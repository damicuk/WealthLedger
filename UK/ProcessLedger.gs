/**
 * Processes the ledger records consistent with the UK accounting model.
 * It treats the ledger as a set of instuctions and simulates the actions specified.
 * Stops reading if it encounters the stop action.
 * @param {Array<LedgerRecord>} ledgerRecords - The collection of ledger records.
 */
AssetTracker.prototype.processLedgerUK = function (ledgerRecords) {

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {
    ledgerRecords = ledgerRecords.slice().reverse();
  }

  for (let ledgerRecord of ledgerRecords) {
    this.processLedgerRecordUK(ledgerRecord);
  }

  for (let assetPool of this.assetPools) {
    assetPool.match();
  }
};

/**
 * Processes a ledger record consistent with the UK accounting model.
 * It treats the ledger record as an instuction and simulates the action specified.
 * @param {LedgerRecord} ledgerRecord - The ledger record to process.
 * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.processLedgerRecordUK = function (ledgerRecord) {

  let date = this.getMidnight(ledgerRecord.date);
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

    if (!creditAsset.isFiat) {  //Buy or exchange asset

      let poolDeposit = new PoolDeposit(date,
        this.fiatBase,
        debitExRate ? debitExRate * debitAmount : debitAmount,
        debitExRate ? debitExRate * debitFee : debitFee,
        creditAsset,
        creditAmount,
        creditFee);

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

    let poolDeposit = new PoolDeposit(date, this.fiatBase, creditExRate * creditAmount, 0, creditAsset, creditAmount, 0);
    this.getAssetPool(creditAsset).addPoolDeposit(poolDeposit);

  }
  else if (action === 'Donation') {

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.fiatBase, debitExRate * debitAmount, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);
  }
  else if (action === 'Gift') {

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.fiatBase, 0, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

  }
  else if (action === 'Fee' && !debitAsset.isFiat) {

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, 0, debitFee, this.fiatBase, 0, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);
  }
};

/**
 * Gets the date at midnight on the day of the given date.
 * The timezone of the spreadsheet is taken into account.
 * @param {Date} date - The given date.
 * @return {Date} The date at midnight on the day of the given date.
 */
AssetTracker.prototype.getMidnight = function (date) {

  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  let dateTZ = new Date(date.toLocaleString('en-US', { timeZone: timeZone }));

  let dateTime = date.getTime();
  dateTime -= dateTZ.getHours() * 3600000;
  dateTime -= dateTZ.getMinutes() * 60000;
  dateTime -= dateTZ.getMilliseconds();

  return new Date(dateTime);
};