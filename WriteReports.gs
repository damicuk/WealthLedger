/**
 * Validates and processes the ledger, retrieves the currenct prices, and writes the reports.
 * Uses the error handler to handle any ValidatioError, AssetAccountError, or ApiError .
 * Updates the data validation on the ledger asset and wallet columns.
 * Displays toast on success.
 */
AssetTracker.prototype.writeReports = function () {

  let assetsValidationResults = this.validateAssetsSheet();
  let assetsValidationSuccess = assetsValidationResults[0];
  let assetRecords = assetsValidationResults[1];
  let fiatBaseRowIndex = assetsValidationResults[2];
  if (!assetsValidationSuccess) {
    return;
  }

  this.processAssets(assetRecords);

  if (this.fiatBase.ticker === 'GBP' && this.accountingModel !== 'UK'
    || this.fiatBase.ticker !== 'GBP' && this.accountingModel === 'UK') {
    let ui = SpreadsheetApp.getUi();
    let message = `Fiat base is ${this.fiatBase.ticker} but the accounting model is ${this.accountingModel}.\nYou can change the accounting model in setting.\n\nAre you sure you want to continue?`;
    let result = ui.alert(`Warning`, message, ui.ButtonSet.YES_NO);
    if (result !== ui.Button.YES) {
      this.setCurrentCell(this.assetsSheetName, fiatBaseRowIndex, AssetRecord.getColumnIndex('assetType'));
      SpreadsheetApp.getActive().toast('Reports canceled');
      return;
    }
  }

  let ledgerValidationResults = this.validateLedgerSheet();
  let ledgerValidationSuccess = ledgerValidationResults[0];
  let ledgerRecords = ledgerValidationResults[1];
  if (!ledgerValidationSuccess) {
    return;
  }

  try {
    this.processLedger(ledgerRecords);
  }
  catch (error) {
    if (error instanceof AssetAccountError) {
      this.handleError('assetAccount', error.message, this.ledgerSheetName, error.rowIndex, LedgerRecord.getColumnIndex(error.columnName));
      return;
    }
    else {
      throw error;
    }
  }

  this.fiatAccountsSheet();

  if (this.accountingModel === 'UK') {

    let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

    this.processLedgerUK(ledgerRecords, timeZone);

    this.deleteSheets(this.defaultReportNames);

    this.ukOpenReport();
    this.ukClosedReport();
    this.incomeReport(this.ukIncomeReportName);
    this.ukAccountsReport();
    this.ukChartsDataSheet();
    this.ukOpenSummaryReport();
    this.ukClosedSummaryReport();
    this.incomeSummaryReport(this.ukIncomeSummaryReportName);
    this.ukDonationsSummaryReport();
    this.ukWalletsReport();

  }
  else {

    this.deleteSheets(this.ukReportNames);

    this.fiatAccountsSheet();
    this.openReport();
    this.closedReport();
    this.incomeReport();
    this.chartsDataSheet();
    this.openSummaryReport();
    this.closedSummaryReport();
    this.incomeSummaryReport();
    this.donationsSummaryReport();
    this.walletsReport();
  }

  this.updateLedger();
  this.updateAssetsSheet(assetRecords);

  try {
    this.updateAssetPrices(assetRecords);
  }
  catch (error) {
    if (error instanceof ApiError) {
      this.handleError('api', error.message);
    }
    else {
      throw error;
    }
  }

  SpreadsheetApp.getActive().toast('Reports complete', 'Finished', 10);
};