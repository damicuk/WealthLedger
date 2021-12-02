/**
 * Processes the ledger records consistent with the UK accounting model.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Skips ledger records with the skip action.
 * Stops reading if it encounters the stop action.
 * @param {Array<LedgerRecord>} ledgerRecords - The collection of ledger records.
 */
AssetTracker.prototype.processLedgerUK = function (ledgerRecords) {

  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {
    ledgerRecords = ledgerRecords.slice().reverse();
  }

  for (let ledgerRecord of ledgerRecords) {
    if (ledgerRecord.action === 'Skip') {
      continue;
    }
    else if (ledgerRecord.action === 'Stop') {
      break;
    }
    this.processLedgerRecordUK(ledgerRecord, timeZone);
  }

  for (let assetPool of this.assetPools) {
    assetPool.match();
  }
};

/**
 * Processes a ledger record consistent with the UK accounting model.
 * It treats the ledger record as an instuction and simulates the action specified.
 * @param {LedgerRecord} ledgerRecord - The ledger record to process.
 * @param {string} [timeZone] - The tz database time zone from the spreadsheet timezone.
 */
AssetTracker.prototype.processLedgerRecordUK = function (ledgerRecord, timeZone) {

  let date = AssetTracker.getMidnight(ledgerRecord.date, timeZone);
  let action = ledgerRecord.action;
  let debitAsset = this.assets.get(ledgerRecord.debitAsset);
  let debitExRate = ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let creditAsset = this.assets.get(ledgerRecord.creditAsset);
  let creditExRate = ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;

  if (action === 'Transfer') {

    if (!debitAsset.isFiat) { //Asset transfer

      let poolWithdrawal = new PoolWithdrawal(date, debitAsset, 0, debitFee, this.fiatBase, 0, 0, action);
      this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

    }
  }
  else if (action === 'Trade') {

    if (!creditAsset.isFiat) { //Buy or exchange asset

      let poolDeposit = new PoolDeposit(date,
        this.fiatBase,
        debitExRate ? debitExRate * debitAmount : debitAmount,
        debitExRate ? debitExRate * debitFee : debitFee,
        creditAsset,
        creditAmount,
        creditFee,
        action);

      this.getAssetPool(creditAsset).addPoolDeposit(poolDeposit);

    }
    if (!debitAsset.isFiat) { //Sell or exchange asset

      let poolWithdrawal = new PoolWithdrawal(date,
        debitAsset,
        debitAmount,
        debitFee,
        this.fiatBase,
        creditExRate ? creditExRate * creditAmount : creditAmount,
        creditExRate ? creditExRate * creditFee : creditFee,
        action);

      this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

    }
  }
  else if (action === 'Income') {

    if (!creditAsset.isFiat) { // Asset income

      let poolDeposit = new PoolDeposit(date, this.fiatBase, creditExRate * creditAmount, 0, creditAsset, creditAmount, 0, action);
      this.getAssetPool(creditAsset).addPoolDeposit(poolDeposit);

    }
  }
  else if (action === 'Donation') {

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.fiatBase, debitExRate * debitAmount, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

  }
  else if (action === 'Gift') {

    if (creditAsset) { //Gift received

      let poolDeposit = new PoolDeposit(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, 0, action);
      this.getAssetPool(creditAsset).addPoolDeposit(poolDeposit);

    }
    else { //Gift given

      let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.fiatBase, 0, 0, action);
      this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

    }
  }
  else if (action === 'Fee' && !debitAsset.isFiat) {

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, 0, debitFee, this.fiatBase, 0, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

  }
  else if (action === 'Split') {

    let assetPool = this.getAssetPool(debitAsset);

    let denominator = debitAmount ? debitAmount : 1;
    let numerator = creditAmount ? creditAmount : 1;
    if (numerator > denominator) {

      let depositSubunits = Math.ceil(assetPool.subunits * (numerator / denominator - 1));

      if (depositSubunits > 0) {

        let poolDeposit = new PoolDeposit(date, this.fiatBase, 0, 0, debitAsset, (depositSubunits / debitAsset.subunits), 0, action);
        assetPool.addPoolDeposit(poolDeposit);

      }
    }
    else if (denominator > numerator) {

      let withdrawSubunits = Math.floor(assetPool.subunits * (1 - numerator / denominator));

      if (withdrawSubunits > 0) {

        let poolWithdrawal = new PoolWithdrawal(date, debitAsset, (withdrawSubunits / debitAsset.subunits), 0, this.fiatBase, 0, 0, action);
        assetPool.addPoolWithdrawal(poolWithdrawal);

      }
    }
  }
};