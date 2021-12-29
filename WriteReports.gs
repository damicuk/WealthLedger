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
  if (!assetsValidationSuccess) {
    return;
  }

  this.processAssets(assetRecords);

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