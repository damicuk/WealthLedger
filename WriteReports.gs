/**
 * Validates and processes the ledger, retrieves the currenct prices, and writes the reports.
 * Shows a warning dialog if the spreadsheet locale is not English.
 * Uses the error handler to handle any ValidatioError, AssetAccountError, or ApiError.
 * Updates the data validation on the ledger asset and wallet columns.
 * Displays toast on success.
 */
AssetTracker.prototype.writeReports = function () {

  if (!this.checkLocale()) {
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
    if (error instanceof AssetAccountError) {
      this.handleError('assetAccount', error.message, this.ledgerSheetName, error.rowIndex, LedgerRecord.getColumnIndex(error.columnName));
      return;
    }
    else {
      throw error;
    }
  }

  if (!this.asetsAndLedgerVersionCurrent()) {

    let ui = SpreadsheetApp.getUi();
    const result1 = ui.alert(`Upgade available`, `New versions of the assets and ledger sheets are available.\n\nYou can upgrade any time by selecting 'Copy assets and ledger sheets'.\n\nDo you wish to upgrade now?`, ui.ButtonSet.YES_NO_CANCEL);

    if (result1 === ui.Button.YES) {

      let assetDataTable = this.getAssetDataTable(assetRecords);
      let ledgerDataTable = this.getLedgerDataTable(ledgerRecords);

      this.assetsSheet(assetDataTable);
      this.ledgerSheet(ledgerDataTable);

      this.updateLedger();
      this.updateAssetsSheet();

      const result2 = ui.alert(`Upgrade complete`, `You can delete the original assets and ledger sheets which have been renamed with an added number.\n\nDo you want to complete the reports now.`, ui.ButtonSet.YES_NO);
      if (result2 === ui.Button.NO) {

        SpreadsheetApp.getActive().toast('Action canceled');
        return;
      }
    }
    else if (result1 === ui.Button.CANCEL) {

      SpreadsheetApp.getActive().toast('Action canceled');
      return;
    }
  }

  let inflationData = this.getInflationData();
  let fiatData = this.getFiatData();
  let openData = this.getOpenData();
  let closedData = this.getClosedData();
  let incomeData = this.getIncomeData();

  this.fiatAccountsSheet(fiatData[0], fiatData[1]);
  this.inflationSheet(inflationData[0], inflationData[1]);
  this.openReport(openData[0], openData[1], openData[2], openData[3]);
  this.closedReport(closedData[0], closedData[1], closedData[2], closedData[3], closedData[4], closedData[5]);
  this.incomeReport(incomeData[0], incomeData[1], incomeData[2], incomeData[3]);

  this.chartsDataSheet();
  this.openSummaryReport();
  this.closedSummaryReport();
  this.incomeSummaryReport();
  this.donationsSummaryReport();
  this.walletsReport();
  this.investmentDataSheet();
  this.investmentReport();

  this.updateLedger();
  this.updateAssetsSheet();

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