/**
 * Validates and processes the ledger, retrieves the currenct crypto prices, and writes the reports.
 * Uses the error handler to handle any ValidatioError, CryptoAccountError, or ApiError .
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
    if (error instanceof CryptoAccountError) {
      this.handleError('cryptoAccount', error.message, this.ledgerSheetName, error.rowIndex, LedgerRecord.getColumnIndex('debitAmount'));
      return;
    }
    else {
      throw error;
    }
  }

  this.fiatAccountsSheet();

  if (this.baseCurrency.ticker === 'GBP') {

    this.processLedgerUK(ledgerRecords);

    this.deleteSheets(this.defaultReportNames);

    this.ukOpenPoolsReport();
    this.ukAssetAccountsReport();
    this.ukClosedPositionsReport();
    this.incomeReport(this.ukIncomeReportName);
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

AssetTracker.prototype.updateAssetPrices = function (assetRecords) {

  let ccTickerSet = this.getApiTickerSet(this.ccApiName, assetRecords);
  let cmcTickerSet = this.getApiTickerSet(this.cmcApiName, assetRecords);

  let ccAssetPriceMap = new Map();
  let cmcAssetPriceMap = new Map();

  let errorMessages = [];

  try {
    ccAssetPriceMap = this.getApiAssetPriceMap(this.ccApiName, this.ccApiKey, Array.from(ccTickerSet), this.baseCurrency);
  }
  catch (error) {
    if (error instanceof ApiError) {
      errorMessages.push(error.message);
    }
    else {
      throw error;
    }
  }

  try {
    cmcAssetPriceMap = this.getApiAssetPriceMap(this.cmcApiName, this.cmcApiKey, Array.from(cmcTickerSet), this.baseCurrency);
  }
  catch (error) {
    if (error instanceof ApiError) {
      errorMessages.push(error.message);
    }
    else {
      throw error;
    }
  }

  let dataTable = [];
  let updateRequired = false;
  for (let assetRecord of assetRecords) {
    let ticker = assetRecord.ticker;
    let apiName = assetRecord.apiName;
    let currentPrice = assetRecord.currentPrice;
    let currentPriceFormula = assetRecord.currentPriceFormula;
    let date = assetRecord.date;
    let timestamp = (isNaN(date) || apiName === '') ? null : assetRecord.date.toISOString();

    if (apiName === this.ccApiName && ccAssetPriceMap.has(ticker)) {
      let mapValue = ccAssetPriceMap.get(ticker);
      dataTable.push([[mapValue.currentPrice], [mapValue.timestamp]]);
      updateRequired = true;
    }
    else if (apiName === this.cmcApiName && cmcAssetPriceMap.has(ticker)) {
      let mapValue = cmcAssetPriceMap.get(ticker);
      dataTable.push([[mapValue.currentPrice], [mapValue.timestamp]]);
      updateRequired = true;
    }
    else if (currentPriceFormula !== '') {
      dataTable.push([[currentPriceFormula], [timestamp]]);
    }
    else {
      dataTable.push([[currentPrice], [timestamp]]);
    }
  }

  if (updateRequired) {

    let assetsRange = this.getAssetsRange();
    let updateRange = assetsRange.offset(0, 4, assetsRange.getHeight(), 2);
    updateRange.setValues(dataTable);

  }

  let ccFailedTickerSet = this.getApiFailedTickerSet(ccTickerSet, ccAssetPriceMap);
  let cmcFailedTickerSet = this.getApiFailedTickerSet(cmcTickerSet, cmcAssetPriceMap);

  if (ccFailedTickerSet.size > 0) {
    errorMessages.push(`Failed to update price for ${Array.from(ccFailedTickerSet).sort(this.abcComparator).join(', ')} from ${this.ccApiName}.`);
  }

  if (cmcFailedTickerSet.size > 0) {
    errorMessages.push(`Failed to update price for ${Array.from(cmcFailedTickerSet).sort(this.abcComparator).join(', ')} from ${this.cmcApiName}.`);
  }

  if (errorMessages.length > 0) {
    throw new ApiError(errorMessages.join('\n\n'));
  }
};

AssetTracker.prototype.getApiFailedTickerSet = function (apiTickerSet, apiAssetPriceMap) {

  let apiFailedTickerSet = new Set(apiTickerSet);
  let apiSuccessTickers = Array.from(apiAssetPriceMap.keys());
  for (let apiSuccessTicker of apiSuccessTickers) {
    apiFailedTickerSet.delete(apiSuccessTicker);
  }
  return apiFailedTickerSet;
}


AssetTracker.prototype.getApiTickerSet = function (apiName, assetRecords, refreshMins = 10) {

  let tickerSet = new Set();
  let now = new Date();
  let refreshMs = refreshMins * 60000;
  let pricesCurrent = true;

  for (let assetRecord of assetRecords) {
    let ticker = assetRecord.ticker;
    let date = assetRecord.date;
    if (assetRecord.apiName === apiName) {
      if (isNaN(date) || now - date > refreshMs) {
        pricesCurrent = false;
      }
      tickerSet.add(ticker);
    }
  }

  if (pricesCurrent) {
    return new Set();
  }

  return tickerSet;

}

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
    this.openSummaryReportName,
    this.closedSummaryReportName,
    this.incomeSummaryReportName,
    this.donationsSummaryReportName,
    this.walletsReportName,
    this.ukOpenPoolsReportName,
    this.ukAssetAccountsReportName,
    this.ukClosedPositionsReportName,
    this.ukIncomeReportName,
    this.ukOpenSummaryReportName,
    this.ukClosedSummaryReportName,
    this.ukIncomeSummaryReportName,
    this.ukDonationsSummaryReportName,
    this.ukWalletsReportName
  ];

  this.deleteSheets(sheetNames);
};