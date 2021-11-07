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

  this.ukOpenPoolsReport();
  this.ukAssetAccountsReport();
  this.ukClosedPositionsReport();
  this.ukOpenSummaryReport();
  this.ukClosedSummaryReport();
  this.ukDonationsSummaryReport();
  this.ukWalletsReport();
};

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

      let poolWithdrawal = new PoolWithdrawal(date, debitAsset, 0, debitFee, this.baseCurrency, 0, 0, action);
      this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

    }
  }
  else if (action === 'Trade') { //Trade

    if (!creditAsset.isFiat) {  //Buy or exchange asset

      let poolDeposit = new PoolDeposit(date,
        this.baseCurrency,
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
        this.baseCurrency,
        creditExRate ? creditExRate * creditAmount : creditAmount,
        creditExRate ? creditExRate * creditFee : creditFee,
        action);

      this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

    }
  }
  else if (action === 'Income') { //Income

    let poolDeposit = new PoolDeposit(date, this.baseCurrency, creditExRate * creditAmount, 0, creditAsset, creditAmount, 0);
    this.getAssetPool(creditAsset).addPoolDeposit(poolDeposit);

  }
  else if (action === 'Donation') { //Donation

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.baseCurrency, debitExRate * debitAmount, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);
  }
  else if (action === 'Gift') { //Gift

    let poolWithdrawal = new PoolWithdrawal(date, debitAsset, debitAmount, debitFee, this.baseCurrency, 0, 0, action);
    this.getAssetPool(debitAsset).addPoolWithdrawal(poolWithdrawal);

  }
};

AssetTracker.prototype.getMidnight = function (date) {

  let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  let dateTZ = new Date(date.toLocaleString('en-US', { timeZone: timeZone }));

  let dateTime = date.getTime();
  dateTime -= dateTZ.getHours() * 3600000;
  dateTime -= dateTZ.getMinutes() * 60000;
  dateTime -= dateTZ.getMilliseconds();

  return new Date(dateTime);
};
