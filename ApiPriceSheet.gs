/**
 * Creates the api price sheets if they don't already exist.
 * Updates the prices in the api price sheets if necessary.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current.
 */
AssetTracker.prototype.apiPriceSheets = function (refreshMins = 10) {

  this.apiPriceSheet('CryptoCompare', this.ccApiKey, refreshMins);
  this.apiPriceSheet('CoinMarketCap', this.cmcApiKey, refreshMins);

};

/**
 * Creates an api price sheet with the given sheet and range name if it doesn't already exist.
 * Updates the prices in the api price sheets if necessary.
 * Trims the sheet to fit the data.
 * Throws an ApiError if the requied API key is missing.
 * Throw an ApiError if the API request failed.
 * Throws an ApiError if the call to the API returns an error response.
 * @param {string} apiName - The name of the API to query.
 * @param {string} apiKey - The API key.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current. 
 */
AssetTracker.prototype.apiPriceSheet = function (apiName, apiKey, refreshMins = 10) {

  const sheetName = apiName;
  const rangeName = apiName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [[`Asset`, `Current Price`, `Timestamp`]];

    sheet.getRange('A1:C1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('@');
    sheet.getRange('B2:B').setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange('C2:C').setNumberFormat('yyyy-mm-dd hh:mm:ss');

    let dataTable = [
      [, , ,]
    ];

    this.writeTable(ss, sheet, dataTable, rangeName, 1, 3);

  }
  else {

    let apiPriceRecords = this.getApiPriceRecords(sheetName);

    let resultsArray = this.getAssetPriceTable(apiName, apiKey, apiPriceRecords, refreshMins);

    let dataTable = resultsArray[0];
    let failedTickerSet = resultsArray[1];

    this.writeTable(ss, sheet, dataTable, rangeName, 1, 3);

    if (failedTickerSet.size > 0) {
      throw new ApiError(`Failed to update crypto price from ${apiName} for ${Array.from(failedTickerSet).sort(this.abcComparator).join(', ')}`);
    }
  }
};

/**
 * Checks whether the prices in the api price records are all current.
 * If one record is not current then all are considered not current.
 * Requests price data from named API.
 * Creates a table of the results. 
 * The table includes any unchanged records but removes records with a blanc ticker.
 * Returns the resulting table (as the first item of the return array).
 * Returns the set of tickers that the api failed to update (as the second item of the return array).
 * Throws an ApiError if the requied API key is missing.
 * Throw an ApiError if the API request failed.
 * Throws an ApiError if the call to the API returns an error response.
 * @param {string} apiName - The name of the API to query.
 * @param {string} apiKey - The API key.
 * @param {ApiPriceRecord[]} apiPriceRecords - The collection of api price records.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current.
 * @return {[Array[], Set]} An array containing the updated asset price table and the set of tickers that the api failed to return.
 */
AssetTracker.prototype.getAssetPriceTable = function (apiName, apiKey, apiPriceRecords, refreshMins) {

  let table = [];
  let tickerSet = new Set();
  let returnedTickerSet = new Set();
  let failedTickerSet = new Set();
  let now = new Date();
  let refreshMs = refreshMins * 60000;
  let pricesCurrent = true;

  for (let apiPriceRecord of apiPriceRecords) {
    let ticker = apiPriceRecord.ticker;
    let date = apiPriceRecord.date;
    if (ticker !== '') {
      if (isNaN(date) || now - date > refreshMs) {
        pricesCurrent = false;
      }
      tickerSet.add(ticker);
    }
  }

  if (!pricesCurrent) {

    let tickers = Array.from(tickerSet);
    let baseCurrency = this.baseCurrency;

    table = this.getAssetPriceData(apiName, apiKey, tickers, baseCurrency);

    failedTickerSet = new Set(tickerSet);
    for (let row of table) {
      let ticker = row[0];
      returnedTickerSet.add(ticker);
      failedTickerSet.delete(ticker);
    }
  }

  for (let apiPriceRecord of apiPriceRecords) {
    let ticker = apiPriceRecord.ticker;
    if (ticker !== '' && !returnedTickerSet.has(ticker)) {
      let currentPrice = isNaN(apiPriceRecord.currentPrice) ? null : apiPriceRecord.currentPrice;
      let dateString = isNaN(apiPriceRecord.date) ? null : apiPriceRecord.date.toISOString()
      table.push([ticker, currentPrice, dateString]);
    }
  }
  this.sortTable(table, 0, true);

  table.push([, , ,]);

  return [table, failedTickerSet];
};