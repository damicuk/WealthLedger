/**
 * Validates and processes the ledger, retrieves the currenct crypto prices, and writes the reports.
 * Uses the error handler to handle any ValidatioError, CryptoAccountError, or ApiError .
 * Updates the data validation on the ledger asset and wallet columns.
 * Displays toast on success.
 */
AssetTracker.prototype.writeReports = function () {

  if (!this.validateApiPriceSheet(this.ccApiName)) {
    return;
  }

  if (!this.validateApiPriceSheet(this.ccApiName)) {
    return;
  }

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
    if (error instanceof CryptoAccountError) {
      this.handleError('cryptoAccount', error.message, this.ledgerSheetName, error.rowIndex, LedgerRecord.getColumnIndex('debitAmount'));
      return;
    }
    else {
      throw error;
    }
  }

  let apiError;
  try {
    this.apiPriceSheets();
  }
  catch (error) {
    if (error instanceof ApiError) {
      //handle the error later
      apiError = error;
    }
    else {
      throw error;
    }
  }

  this.fiatAccountsSheet();
  this.openPositionsReport();
  this.closedPositionsReport();
  this.donationsReport();
  this.incomeReport();
  this.openSummaryReport();
  this.closedSummaryReport();
  this.incomeSummaryReport();
  this.donationsSummaryReport();
  this.walletsReport();

  this.updateLedger();
  this.updateAssetsSheet(assetRecords);

  if (apiError) {
    this.handleError('api', apiError.message);
  }
  else {
    SpreadsheetApp.getActive().toast('Reports complete', 'Finished', 10);
  }
};

/**
 * Deletes all the output sheets.
 * Not intended for use by the end user.
 * Useful in development and testing.
 */
AssetTracker.prototype.deleteReports = function () {

  let sheetNames = [
    this.openPositionsReportName,
    this.closedPositionsReportName,
    this.donationsReportName,
    this.incomeReportName,
    this.openSummaryReportName,
    this.closedSummaryReportName,
    this.incomeSummaryReportName,
    this.donationsSummaryReportName,
    this.walletsReportName,
    this.exRatesTableSheetName,
    this.exRatesSheetName,
    this.fiatAccountsSheetName
  ];

  this.deleteSheets(sheetNames);

};