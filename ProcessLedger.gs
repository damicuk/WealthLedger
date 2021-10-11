/**
 * Processes the asset records.
 * Adds to the Map of assets.
 * Sets the base currency.
 * @param {AssetRecord[]} assetRecords - The collection of asset records.
 */
AssetTracker.prototype.processAssets = function (assetRecords) {

  for (let assetRecord of assetRecords) {

    let assetType;
    let isBaseCurrency = false;

    if (assetRecord.assetType === 'Fiat Base') {
      assetType = 'Fiat';
      isBaseCurrency = true;
    }
    else {
      assetType = assetRecord.assetType;
    }

    let asset = new Asset(assetRecord.ticker, assetType, isBaseCurrency, assetRecord.decimalPlaces);

    if (isBaseCurrency) {
      this.baseCurrency = asset;
    }

    this.assets.set(assetRecord.ticker, asset);
  }
}

/**
 * Processes the ledger records.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Stops reading if it encounters the stop action.
 * @param {LedgerRecord[]} ledgerRecords - The collection of ledger records.
 */
AssetTracker.prototype.processLedger = function (ledgerRecords) {

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    ledgerRecords = ledgerRecords.slice().reverse();
    let rowIndex = this.ledgerHeaderRows + ledgerRecords.length;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.processLedgerRecord(ledgerRecord, rowIndex--);
    }
  }
  else {
    let rowIndex = this.ledgerHeaderRows + 1;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.processLedgerRecord(ledgerRecord, rowIndex++);
    }
  }
};

/**
 * Processes a ledger record.
 * It treats the ledger record as an instuction and simulates the action specified.
 * @param {LedgerRecord} ledgerRecord - The ledger record to process.
 * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.processLedgerRecord = function (ledgerRecord, rowIndex) {

  let date = ledgerRecord.date;
  let action = ledgerRecord.action;
  let debitAsset = this.assets.get(ledgerRecord.debitAsset);
  let debitExRate = ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let debitWalletName = ledgerRecord.debitWalletName;
  let creditAsset = this.assets.get(ledgerRecord.creditAsset);
  let creditExRate = ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;
  let creditWalletName = ledgerRecord.creditWalletName;
  let lotMatching = ledgerRecord.lotMatching;

  if (lotMatching) {
    this.lotMatching = lotMatching;
  }

  if (action === 'Transfer') {

    if (debitAsset.isFiat) { //Fiat transfer

      if (debitWalletName) { //Fiat withdrawal

        this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      }
      else if (creditWalletName) { //Fiat deposit

        this.getWallet(creditWalletName).getFiatAccount(debitAsset).transfer(debitAmount).transfer(-debitFee);

      }
    }
    else {  //Asset transfer

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.getWallet(creditWalletName).getAssetAccount(debitAsset).deposit(lots);

    }
  }
  else if (action === 'Trade') {

    //Infer missing ex rates
    if (!debitAsset.isBaseCurrency && !creditAsset.isBaseCurrency && !(debitAsset.isFiat && creditAsset.isFiat)) {

      if (!debitExRate) {

        debitExRate = Math.round(10 ** this.exRateDecimalPlaces * creditExRate * creditAmount / debitAmount) / 10 ** this.exRateDecimalPlaces;

      }
      if (!creditExRate) {

        creditExRate = Math.round(10 ** this.exRateDecimalPlaces * debitExRate * debitAmount / creditAmount) / 10 ** this.exRateDecimalPlaces;

      }
    }

    if (debitAsset.isFiat && creditAsset.isFiat) {  //Exchange fiat

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      this.getWallet(debitWalletName).getFiatAccount(creditAsset).transfer(creditAmount).transfer(-creditFee);

    }
    else if (debitAsset.isFiat && !creditAsset.isFiat) {  //Buy asset

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      let lot = new Lot(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getAssetAccount(creditAsset).deposit(lot);

    }
    else if (!debitAsset.isFiat && creditAsset.isFiat) { //Sell asset

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, creditAsset, creditExRate, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getFiatAccount(creditAsset).transfer(creditAmount).transfer(-creditFee);

    }
    else { //Exchange assets

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, creditAsset, creditExRate, creditAmount, creditFee, debitWalletName);

      let lot = new Lot(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, debitWalletName);

      this.getWallet(debitWalletName).getAssetAccount(creditAsset).deposit(lot);

    }
  }
  else if (action === 'Income') {

    if (creditAsset.isFiat) { //Fiat income

      this.getWallet(creditWalletName).getFiatAccount(creditAsset).transfer(creditAmount);

    }
    else { // Asset income

      //the cost base is the value of (credit exchange rate x credit amount)
      let lot = new Lot(date, creditAsset, creditExRate, creditAmount, 0, creditAsset, creditAmount, 0, creditWalletName);

      this.getWallet(creditWalletName).getAssetAccount(creditAsset).deposit(lot);

    }

    //keep track of income separately
    this.incomeLots.push({ date: date, sourceAsset: debitAsset, incomeAsset: creditAsset, exRate: creditExRate, amount: creditAmount, walletName: creditWalletName });

  }
  else if (action === 'Donation') {

    let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    for (let lot of lots) {
      this.donatedLots.push({ lot: lot, date: date, exRate: debitExRate, walletName: debitWalletName });
    }
  }
  else if (action === 'Gift') {

    if (debitAsset.isFiat) {

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

    }
    else {

      this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    }
  }
  else if (action === 'Fee') {

    if (debitAsset.isFiat) {

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitFee);

    }
    else {

      this.getWallet(debitWalletName).getAssetAccount(debitAsset).apportionFee(debitFee, rowIndex);

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).removeZeroSubunitLots();

      this.closeLots(lots, date, this.baseCurrency, 0, 0, 0, debitWalletName);
    }
  }
  else if (action === 'Split') {

    let denominator = debitAmount ? debitAmount : 1;
    let numerator = creditAmount ? creditAmount : 1;
    this.splitAsset(debitAsset, numerator, denominator);
  }
};

/**
 * Searches for all occurances of the given asset and adjusts the amount, fee and exrate according to the split numerator and denominator.
 * @param {Asset} asset - The asset to search for.
 * @param {number} numerator - The numerator of the split. 
 * @param {number} denominator - The denominator of the split.
 */
AssetTracker.prototype.splitAsset = function (asset, numerator, denominator) {

  let lots = this.getAllLots();
  for (let lot of lots) {
    if (lot.debitAsset === asset) {
      let splitBalance = this.splitBalance(lot.debitAmountSubunits, lot.debitFeeSubunits, numerator, denominator);
      lot.debitAmountSubunits = splitBalance[0];
      lot.debitFeeSubunits = splitBalance[1];
      lot.debitExRate = this.spltExRate(lot.debitExRate, numerator, denominator);
    }
    if (lot.creditAsset === asset) {
      let splitBalance = this.splitBalance(lot.creditAmountSubunits, lot.creditFeeSubunits, numerator, denominator);
      lot.creditAmountSubunits = splitBalance[0];
      lot.creditFeeSubunits = splitBalance[1];
    }
  }

  for (let closedLot of this.closedLots) {
    if (closedLot.creditAsset === asset) {
      let splitBalance = this.splitBalance(closedLot.creditAmountSubunits, closedLot.creditFeeSubunits, numerator, denominator);
      closedLot.creditAmountSubunits = splitBalance[0];
      closedLot.creditFeeSubunits = splitBalance[1];
      closedLot.creditExRate = this.spltExRate(closedLot.creditExRate, numerator, denominator);
    }
  }

  for (let donatedLot of this.donatedLots) {
    if (donatedLot.lot.creditAsset === asset) {
      donatedLot.exRate = this.spltExRate(donatedLot.exRate, numerator, denominator);
    }
  }

  for (let incomeLot of this.incomeLots) {
    if (incomeLot.creditAsset === asset) {
      let splitBalance = this.splitBalance(incomeLot.creditAmount, 0, numerator, denominator);
      incomeLot.creditAmount = splitBalance[0];
      incomeLot.exRate = this.spltExRate(incomeLot.exRate, numerator, denominator);
    }
  }
};

/**
 * Calculates the value of an integer amount and fee subunits after an asset split.
 * N.B. It rounds the balance subunits up in the case of a reverse split with a remainder after the division.
 * @param {number} amountSubunits - The original integer amount subunits.
 * @param {number} feeSubunits - The original integer fee subunits.
 * @param {number} numerator - The numerator of the asset split.
 * @param {number} denominator - The denominator of the asset split.
 * @return {number[]} The newly calculated integer amount and fee subunits in an array.
 */
AssetTracker.prototype.splitBalance = function (amountSubunits, feeSubunits, numerator, denominator) {

  let balanceSubunits = amountSubunits - feeSubunits;
  let newBalanceSubunits = Math.ceil(balanceSubunits * numerator / denominator);
  let newAmountSubunits = Math.ceil(amountSubunits * numerator / denominator);
  let newFeeSubunits = newAmountSubunits - newBalanceSubunits;

  return [newAmountSubunits, newFeeSubunits];
};

/**
 * Calculates the value of an exrate after an asset split.
 * @param {number} exRate - The original exrate.
 * @param {number} numerator - The numerator of the asset split.
 * @param {number} denominator - The denominator of the asset split. 
 * @return {number} The newly calculated exrate.
 */
AssetTracker.prototype.splitExRate = function (exRate, numerator, denominator) {

  return Math.round(10 ** this.exRateDecimalPlaces * exRate * denominator / numerator) / 10 ** this.exRateDecimalPlaces;
};

/**
 * Gets all the lots in this instance of the asset tracker.
 * @return {Lot[]} An array of containing all lots.
 */
AssetTracker.prototype.getAllLots = function () {

  let lots = [];
  for (let wallet of this.wallets) {
    let walletAssetAccounts = Array.from(wallet.assetAccounts.values());
    for (let assetAccount of walletAssetAccounts) {
      for (let lot of assetAccount.lots) {
        lots.push(lot);
      }
    }
  }

  for (let closedLot of this.closedLots) {
    lots.push(closedLot.lot);
  }

  for (let donatedLot of this.donatedLots) {
    lots.push(donatedLot.lot);
  }

  return lots;
};