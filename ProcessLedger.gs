/**
 * Processes the asset records.
 * Adds to the Map of assets.
 * Sets fiat base.
 * @param {Array<AssetRecord>} assetRecords - The collection of asset records.
 */
AssetTracker.prototype.processAssets = function (assetRecords) {

  for (let assetRecord of assetRecords) {

    let assetType;
    let isFiatBase = false;

    if (assetRecord.assetType === 'Fiat Base') {
      assetType = 'Fiat';
      isFiatBase = true;
    }
    else {
      assetType = assetRecord.assetType;
      if (!Asset.defaultAssetTypes.includes(assetType)) {
        this.userDefinedAssetTypes.add(assetType);
      }
    }

    let asset = new Asset(assetRecord.ticker, assetType, isFiatBase, assetRecord.decimalPlaces);

    if (isFiatBase) {
      this.fiatBase = asset;
    }

    this.assets.set(assetRecord.ticker, asset);
  }
};

/**
 * Processes the ledger records.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Skips ledger records with the skip action.
 * Stops reading if it encounters the stop action.
 * @param {Array<LedgerRecord>} ledgerRecords - The collection of ledger records.
 */
AssetTracker.prototype.processLedger = function (ledgerRecords) {

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    ledgerRecords = ledgerRecords.slice().reverse();
    let rowIndex = this.ledgerHeaderRows + ledgerRecords.length;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Skip') {
        rowIndex--;
        continue;
      }
      else if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.processLedgerRecord(ledgerRecord, rowIndex--);
    }
  }
  else {

    let rowIndex = this.ledgerHeaderRows + 1;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Skip') {
        rowIndex++;
        continue;
      }
      else if (ledgerRecord.action === 'Stop') {
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
    if (!debitAsset.isFiatBase && !creditAsset.isFiatBase && !(debitAsset.isFiat && creditAsset.isFiat)) {

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

    if (debitAsset) { //Check debit asset previously held
      let assetHeld = false;
      for (let wallet of this.wallets) {
        if (wallet.assetAccounts.has(debitAsset.ticker)) {
          assetHeld = true;
          break;
        }
      }
      if (!assetHeld) {
        throw new AssetAccountError(`Income source can not be debit asset (${debitAsset}) when asset not previously held.`, rowIndex, 'debitAsset');
      }
    }

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

    if (debitWalletName) { //Gift given

      this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    }
    else { //Gift received

      let lot = new Lot(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, creditWalletName);

      this.getWallet(creditWalletName).getAssetAccount(creditAsset).deposit(lot);

    }
  }
  else if (action === 'Fee') {

    if (debitAsset.isFiat) {

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitFee);

    }
    else {

      this.getWallet(debitWalletName).getAssetAccount(debitAsset).apportionFee(debitFee, rowIndex);

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).removeZeroSubunitLots();

      this.closeLots(lots, date, this.fiatBase, 0, 0, 0, debitWalletName);
    }
  }
  else if (action === 'Split') {

    let denominator = debitAmount ? debitAmount : 1;
    let numerator = creditAmount ? creditAmount : 1;
    this.splitAsset(debitAsset, numerator, denominator);
  }
};

/**
 * Searches for all current holdings of the given asset and adjusts the amount and fee according to the split numerator and denominator.
 * Rounds the balance subunits up in the case of fractional results.
 * @param {Asset} asset - The asset being split.
 * @param {number} numerator - The numerator of the split. 
 * @param {number} denominator - The denominator of the split.
 */
AssetTracker.prototype.splitAsset = function (asset, numerator, denominator) {

  for (let wallet of this.wallets) {
    if (wallet.assetAccounts.has(asset.ticker)) {
      let assetAccount = wallet.assetAccounts.get(asset.ticker);

      let creditAmountSubunits = 0;
      let lotsCreditAmountSubunits = [];
      let lotsCreditFeeSubunits = [];
      for (let lot of assetAccount.lots) {
        lotsCreditAmountSubunits.push(lot.creditAmountSubunits);
        lotsCreditFeeSubunits.push(lot.creditFeeSubunits);
        creditAmountSubunits += lot.creditAmountSubunits;
      }

      let newBalanceSubunits = Math.ceil(assetAccount.subunits * numerator / denominator);
      let newCreditAmountSubunits = Math.ceil(creditAmountSubunits * numerator / denominator);
      let newCreditFeeSubunits = newCreditAmountSubunits - newBalanceSubunits;

      let apportionedCreditAmountSubunits = AssetTracker.apportionInteger(newCreditAmountSubunits, lotsCreditAmountSubunits);
      let apportionedCreditFeeSubunits = AssetTracker.apportionInteger(newCreditFeeSubunits, lotsCreditFeeSubunits);

      let index = 0;
      for (let lot of assetAccount.lots) {
        lot.creditAmountSubunits = apportionedCreditAmountSubunits[index];
        lot.creditFeeSubunits = apportionedCreditFeeSubunits[index];
        index++;
      }
    }
  }
};