/**
 * Processes the asset records.
 * Adds to the Map of assets.
 * Sets fiat base.
 * @param {Array<AssetRecord>} assetRecords - The collection of asset records.
 */
AssetTracker.prototype.processAssets = function (assetRecords) {

  let rowIndex = this.assetsHeaderRows + 1;
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

    let asset = new Asset(assetRecord.ticker, assetType, isFiatBase, assetRecord.decimalPlaces, rowIndex++);

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
 * @param {number} rowIndex - The index of the row in the ledger sheet.
 */
AssetTracker.prototype.processLedgerRecord = function (ledgerRecord, rowIndex) {

  let date = ledgerRecord.date;
  let action = ledgerRecord.action;
  let debitAsset = ledgerRecord.debitAsset === '' ? null : this.assets.get(ledgerRecord.debitAsset);
  let debitExRate = debitAsset === this.fiatBase ? 1 : ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let debitWalletName = ledgerRecord.debitWalletName;
  let creditAsset = ledgerRecord.creditAsset === '' ? null : this.assets.get(ledgerRecord.creditAsset);
  let creditExRate = creditAsset === this.fiatBase ? 1 : ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;
  let creditWalletName = ledgerRecord.creditWalletName;
  let lotMatching = ledgerRecord.lotMatching;


  if (lotMatching !== '') {
    this.lotMatching = lotMatching;
  }

  if (action === 'Transfer') {

    if (creditAsset && creditAsset.isFiat) { //Fiat deposit

      this.getWallet(creditWalletName).getFiatAccount(creditAsset).transfer(creditAmount);

    }
    else if (debitAsset && debitAsset.isFiat) { //Fiat withdrawal or exchange

      if (debitWalletName) { //Fiat withdrawal

        this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      }
      if (creditWalletName) { //Fiat deposit

        this.getWallet(creditWalletName).getFiatAccount(debitAsset).transfer(debitAmount);

      }
    }
    else {  //Asset transfer

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.getWallet(creditWalletName).getAssetAccount(debitAsset).deposit(lots);

    }
  }
  else if (action === 'Trade') {

    //Deduce missing ex rates
    if (!debitAsset.isFiatBase && !creditAsset.isFiatBase && !(debitAsset.isFiat && creditAsset.isFiat)) {

      if (debitExRate === '') {

        if (debitAmount === 0 || creditAmount === 0) {

          debitExRate = 0;
        }
        else {

          debitExRate = AssetTracker.round(10 ** this.exRateDecimalPlaces * creditExRate * creditAmount / debitAmount) / 10 ** this.exRateDecimalPlaces;
        }
      }
      if (creditExRate === '') {

        if (debitAmount === 0 || creditAmount === 0) {

          creditExRate = 0;
        }
        else {

          creditExRate = AssetTracker.round(10 ** this.exRateDecimalPlaces * debitExRate * debitAmount / creditAmount) / 10 ** this.exRateDecimalPlaces;
        }
      }
    }

    if (debitAsset.isFiat && creditAsset.isFiat) {  //Exchange fiat

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      this.getWallet(debitWalletName).getFiatAccount(creditAsset).transfer(creditAmount).transfer(-creditFee);

    }
    else { //Buy, sell or exchange asset
      if (debitAsset.isFiat) {

        this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitAmount).transfer(-debitFee);

      }
      else {

        let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

        //Handle withdrawal of zero
        if (lots.length === 0) {
          lots = [new Lot(date, this.fiatBase, 1, 0, 0, debitAsset, debitAmount, debitFee, debitWalletName, action, rowIndex)];
        }

        this.closeLots(lots, date, creditAsset, creditExRate, creditAmount, creditFee, debitWalletName, action, rowIndex);

      }
      if (creditAsset.isFiat) {

        this.getWallet(debitWalletName).getFiatAccount(creditAsset).transfer(creditAmount).transfer(-creditFee);

      }
      else {

        let lot = new Lot(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, debitWalletName, action, rowIndex);

        //If the lot has zero balance close it straight away
        //Check we have an account even if we don't use it - to update ledger asset ticker dropdowns
        let creditAssetAccount = this.getWallet(debitWalletName).getAssetAccount(creditAsset);

        if (lot.subunits === 0) {

          this.closeLots([lot], date, this.fiatBase, 1, 0, 0, debitWalletName, action, rowIndex);
        }
        else {

          creditAssetAccount.deposit(lot);
        }

      }
    }
  }
  else if (action === 'Income') {

    if (debitAsset) { //Check debit asset previously held
      let assetHeld = false;
      for (let wallet of this.wallets.values()) {
        if (wallet.assetAccounts.has(debitAsset.ticker)) {
          assetHeld = true;
          break;
        }
      }
      if (!assetHeld) {
        throw new AssetAccountError(`Income row ${rowIndex}: Income source can not be debit asset (${debitAsset}) when asset not previously held.`, rowIndex, 'debitAsset');
      }
    }

    if (creditAsset.isFiat) { //Fiat income

      this.getWallet(creditWalletName).getFiatAccount(creditAsset).transfer(creditAmount);

    }
    else { // Asset income

      //the cost base is the value of (credit exchange rate x credit amount)
      let lot = new Lot(date, creditAsset, creditExRate, creditAmount, 0, creditAsset, creditAmount, 0, creditWalletName, action, rowIndex);

      this.getWallet(creditWalletName).getAssetAccount(creditAsset).deposit(lot);

    }

    //keep track of income separately
    this.incomeLots.push(new IncomeLot(date, debitAsset, creditAsset, creditExRate, creditAmount, creditWalletName, rowIndex));

  }
  else if (action === 'Donation') {

    let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

    this.closeLots(lots, date, debitAsset, debitExRate, debitAmount, 0, debitWalletName, action, rowIndex);

  }
  else if (action === 'Gift') {

    if (debitWalletName) { //Gift given

      let lots = this.getWallet(debitWalletName).getAssetAccount(debitAsset).withdraw(debitAmount, debitFee, this.lotMatching, rowIndex);

      this.closeLots(lots, date, debitAsset, debitExRate, debitAmount, 0, debitWalletName, action, rowIndex);

    }
    else { //Gift received

      let lot = new Lot(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, creditWalletName, action, rowIndex);

      this.getWallet(creditWalletName).getAssetAccount(creditAsset).deposit(lot);

    }
  }
  else if (action === 'Fee') {

    if (debitAsset.isFiat) {

      this.getWallet(debitWalletName).getFiatAccount(debitAsset).transfer(-debitFee);

    }
    else {

      let assetAccount = this.getWallet(debitWalletName).getAssetAccount(debitAsset);

      assetAccount.apportionFee(debitFee, rowIndex);

      this.removeZeroSubunitLots(date, assetAccount, action, rowIndex);
    }
  }
  else if (action === 'Adjust') {

    if (debitAsset) {

      this.adjustAsset(date, debitAsset, -debitAmount, debitWalletName, action, rowIndex);
    }
    else {

      this.adjustAsset(date, creditAsset, creditAmount, creditWalletName, action, rowIndex);
    }
  }
  else if (action === 'Inflation') {

    this.inflationRecords.push(new InflationRecord(date, creditAmount, rowIndex));
  }
};

/**
 * Wraps the lots that have been sold or exchanged in a ClosedLot objects and adds it to the closedLots collection.
 * The credited amount and fees are assigned to the closed lots in proportion to the size of the lots.
 * @param {lots} lots - The lots that have been sold or exchanged.
 * @param {Date} date - The date of the sale or exchange.
 * @param {string} creditAsset - The ticker of the fiat or asset credited for the lots sold or exchanged.
 * @param {number} creditExRate - The exchange rate of the asset of the lots to fiat base at the time of the sale or exchange.
 * @param {number} creditAmount - The amount of the fiat or asset credited for the lots sold or exchanged.
 * @param {number} creditFee - The fee in the credited asset for transaction.
 * @param {string} creditWalletName - The name of the wallet (or exchange) where transaction takes place.
 * @param {string} action - The action in the ledger sheet that closed the lot.
 * @param {number} rowIndex - The index of the row in the ledger sheet.
 * 
 */
AssetTracker.prototype.closeLots = function (lots, date, creditAsset, creditExRate, creditAmount, creditFee, creditWalletName, action, rowIndex) {

  if (lots.length === 0) {
    return;
  }

  let creditAmountSubunits = AssetTracker.round(creditAmount * creditAsset.subunits);
  let creditFeeSubunits = AssetTracker.round(creditFee * creditAsset.subunits);

  //apportion the fee to withdrawal lots
  let lotsSubunits = [];
  for (let lot of lots) {
    lotsSubunits.push(lot.subunits);
  }
  let apportionedCreditAmountSubunits = AssetTracker.apportionInteger(creditAmountSubunits, lotsSubunits);
  let apportionedCreditFeeSubunits = AssetTracker.apportionInteger(creditFeeSubunits, lotsSubunits);
  let index = 0;
  for (let lot of lots) {

    let closedLot = new ClosedLot(
      lot,
      date,
      creditAsset,
      creditExRate,
      (apportionedCreditAmountSubunits[index] / creditAsset.subunits),
      (apportionedCreditFeeSubunits[index] / creditAsset.subunits),
      creditWalletName,
      action,
      rowIndex
    );

    this.closedLots.push(closedLot);
    index++;
  }
};

/**
 * Adjusts the asset balance according to the parameters.
 * Throws an AssetAccountError if the balance is zero or insufficient.
 * Removes any lots with zero subunits.
 * @param {Date} date - The date the adjust occurred.
 * @param {Asset} asset - The asset whose balance is being adjusted.
 * @param {number} adjustAmount - The amount by which to adjust the amount of asset held.
 * @param {string} walletName - The name of the wallet to which to apply the adjust. If not given the adjust is applied to all wallets.
 * @param {string} action - The action, in this case 'Adjust'.
 * @param {number} rowIndex - The index of the row in the ledger sheet.
 */
AssetTracker.prototype.adjustAsset = function (date, asset, adjustAmount, walletName, action, rowIndex) {

  let wallets;
  let assetAccounts = [];
  let assetAccountSubunits = [];
  let totalSubunits = 0;

  if (walletName) {

    //apply to just one wallet
    wallets = [this.getWallet(walletName)];
  }
  else {

    //apply to all wallets
    wallets = this.wallets.values();
  }

  for (let wallet of wallets) {

    if (wallet.assetAccounts.has(asset.ticker)) {

      let assetAccount = wallet.assetAccounts.get(asset.ticker);
      assetAccounts.push(assetAccount);
      assetAccountSubunits.push(assetAccount.subunits);
      totalSubunits += assetAccount.subunits;
    }
  }

  let adjustSubunits = Math.round(adjustAmount * asset.subunits);

  if (totalSubunits + adjustSubunits < 0) {

    throw new AssetAccountError(`Adjust row ${rowIndex}: Attempted to subtract ${asset.ticker} ${-adjustAmount} from ${walletName ? walletName.concat(' ') : ''}balance of ${totalSubunits / asset.subunits}.`, rowIndex, 'debitAmount');
  }

  let assetAccountAdjustSubunits = AssetTracker.apportionInteger(adjustSubunits, assetAccountSubunits);

  let index = 0;
  for (let assetAccount of assetAccounts) {

    assetAccount.adjust(assetAccountAdjustSubunits[index++]);

    this.removeZeroSubunitLots(date, assetAccount, action, rowIndex);
  }
};

/**
 * Removes and closes any lots with zero subunits in the account.
 * Used when misc fee or adjust sets lot subunits to zero.
 * @param {Date} date - The date 0f the action.
 * @param {AssetAccount} assetAccount - The asset account from which to remove the zero subunit lots.
 * @param {string} action - The action in the ledger sheet that closed the lots.
 * @param {number} rowIndex - The index of the row in the ledger sheet.
 */
AssetTracker.prototype.removeZeroSubunitLots = function (date, assetAccount, action, rowIndex) {

  let zeroSubunitLots = assetAccount.removeZeroSubunitLots();

  this.closeLots(zeroSubunitLots, date, this.fiatBase, 1, 0, 0, assetAccount.wallet.name, action, rowIndex);
};