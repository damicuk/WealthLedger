/**
 * Copies assets and ledger sheets.
 * Shows a warning dialog if the spreadsheet locale is not English.
 * Renames any existing assets sheet so as not to overwrite it.
 * Shows a warning dialog if the spreadsheet locale is not English.
 * Uses the error handler to handle any ValidatioError or AssetAccountError.
 * Updates the data validation on the ledger asset and wallet columns.
 * Displays toast on success.
 */
AssetTracker.prototype.copyAssetsAndLedger = function () {

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

  let assetDataTable = this.getAssetDataTable(assetRecords);
  let ledgerDataTable = this.getLedgerDataTable(ledgerRecords);

  this.assetsSheet(assetDataTable);
  this.ledgerSheet(ledgerDataTable);

  this.updateLedger();
  this.updateAssetsSheet(assetRecords);

  SpreadsheetApp.getActive().toast('Assets and ledger sheets copied', 'Finished', 10);
}