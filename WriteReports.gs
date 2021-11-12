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

  this.fiatAccountsSheet();

  if (this.fiatBase.ticker === 'GBP') {

    this.processLedgerUK(ledgerRecords);

    this.deleteSheets(this.defaultReportNames);

    this.ukOpenPoolsReport();
    this.ukAssetAccountsReport();
    this.ukClosedPositionsReport();
    this.incomeReport(this.ukIncomeReportName);
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
    this.openPositionsReport();
    this.closedPositionsReport();
    this.donationsReport();
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
    return;
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

/**
 * Deletes all the output sheets.
 * Not intended for use by the end user.
 * Useful in development and testing.
 */
AssetTracker.prototype.deleteReports = function () {

  let sheetNames = [
    this.fiatAccountsSheetName,
    this.openPositionsReportName,
    this.closedPositionsReportName,
    this.donationsReportName,
    this.incomeReportName,
    this.chartsDataSheetName,
    this.openSummaryReportName,
    this.closedSummaryReportName,
    this.incomeSummaryReportName,
    this.donationsSummaryReportName,
    this.walletsReportName,
    this.ukOpenPoolsReportName,
    this.ukAssetAccountsReportName,
    this.ukClosedPositionsReportName,
    this.ukIncomeReportName,
    this.ukChartsDataSheetName,
    this.ukOpenSummaryReportName,
    this.ukClosedSummaryReportName,
    this.ukIncomeSummaryReportName,
    this.ukDonationsSummaryReportName,
    this.ukWalletsReportName
  ];

  this.deleteSheets(sheetNames);
};