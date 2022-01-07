/**
 * Validates and processes the ledger, retrieves the currenct prices, and writes the reports.
 * Sets the spreadsheet locale to en_US unless it is already set to a locale that starts with "en_".
 * Uses the error handler to handle any ValidatioError, AssetAccountError, or ApiError .
 * Updates the data validation on the ledger asset and wallet columns.
 * Displays toast on success.
 */
AssetTracker.prototype.writeReports = function () {

  this.checkLocale();

  let assetsValidationResults = this.validateAssetsSheet();
  let assetsValidationSuccess = assetsValidationResults[0];
  let assetRecords = assetsValidationResults[1];
  let fiatBaseRowIndex = assetsValidationResults[2];
  if (!assetsValidationSuccess) {
    return;
  }

  this.processAssets(assetRecords);

  if (this.fiatBase.ticker === 'GBP' && this.accountingModel !== 'UK' || this.fiatBase.ticker !== 'GBP' && this.accountingModel === 'UK') {
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

  if (this.accountingModel === 'UK') {

    let timeZone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

    this.processLedgerUK(ledgerRecords, timeZone);

    this.deleteSheets(this.defaultReportNames);

    let fiatData = this.getFiatData();
    let ukOpenData = this.getUKOpenData();
    let ukClosedData = this.getUKClosedData();
    let incomeData = this.getIncomeData();
    let ukAccountsData = this.getUKAccountsData();

    this.fiatAccountsSheet(fiatData[0], fiatData[1]);
    this.ukOpenReport(ukOpenData[0], ukOpenData[1], ukOpenData[2]);
    this.ukClosedReport(ukClosedData[0], ukClosedData[1], ukClosedData[2], ukClosedData[3]);
    this.incomeReport(incomeData[0], incomeData[1], incomeData[2], incomeData[3], this.ukIncomeReportName);
    this.ukAccountsReport(ukAccountsData[0], ukAccountsData[1]);

    this.ukChartsDataSheet();
    this.ukOpenSummaryReport();
    this.ukClosedSummaryReport();
    this.incomeSummaryReport(this.ukIncomeSummaryReportName);
    this.ukDonationsSummaryReport();
    this.ukWalletsReport();

  }
  else {

    this.deleteSheets(this.ukReportNames);

    let fiatData = this.getFiatData();
    let openData = this.getOpenData();
    let closedData = this.getClosedData();
    let incomeData = this.getIncomeData();

    this.fiatAccountsSheet(fiatData[0], fiatData[1]);
    this.openReport(openData[0], openData[1], openData[2], openData[3]);
    this.closedReport(closedData[0], closedData[1], closedData[2], closedData[3], closedData[4], closedData[5]);
    this.incomeReport(incomeData[0], incomeData[1], incomeData[2], incomeData[3]);

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