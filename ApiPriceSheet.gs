/**
 * Creates the api price sheets if they don't already exist.
 * Updates the prices in the api price sheets if necessary.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current.
 */
AssetTracker.prototype.apiPriceSheets = function (refreshMins = 10) {

  this.apiPriceSheet(this.cryptoCompareSheetName, this.cryptoCompareRangeName, refreshMins);

};

/**
 * Creates an api price sheet with the given sheet and range name if it doesn't already exist.
 * Updates the prices in the api price sheets if necessary.
 * Trims the sheet to fit the data.
 * Throws an ApiError if the API key is not set in settings.
 * Throws an ApiError if the call to the API returns an error response.
 * Throws an ApiError if any crypto prices are missing.
 * @param {string} sheetName - The name of the api price sheet.
 * @param {string} rangeName - The name of the data range.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current. 
 */
AssetTracker.prototype.apiPriceSheet = function (sheetName, rangeName, refreshMins) {

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

    let resultsArray = this.getAssetPriceTable(apiPriceRecords, refreshMins);

    let dataTable = resultsArray[0];
    let failedTickerSet = resultsArray[1];

    this.writeTable(ss, sheet, dataTable, rangeName, 1, 3);

    if (failedTickerSet.size > 0) {
      throw new ApiError(`Failed to update crypto price in ${this.cryptoCompareSheetName} for ${Array.from(failedTickerSet).sort(this.abcComparator).join(', ')}`);
    }
  }
};

/**
 * Checks whether the prices in the api price records are all current.
 * If one record is not current then all are considered not current.
 * Gets the updated prices from the api and creates a table of the results. 
 * The table includes any unchanged records but removes records with a blanc ticker.
 * Returns the resulting table (as the first item of the return array).
 * Returns the set of tickers that the api failed to update (as the second item of the return array).
 * Throws an ApiError if the API key is not set in settings.
 * Throws an ApiError if the call to the CryptoCompare API returns an error response.
 * @param {ApiPriceRecord[]} apiPriceRecords - The collection of api price records.
 * @param {number} refreshMins - The number of minutes after which the price data is no longer considered current.
 * @return {[Array[], Set]} An array containing the updated asset price table and the set of tickers that the api failed to return.
 */
AssetTracker.prototype.getAssetPriceTable = function (apiPriceRecords, refreshMins) {

  let table = [];
  let tikerSet = new Set();
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
      tikerSet.add(ticker);
    }
  }

  if (!pricesCurrent) {

    let apiKey = this.apiKey;
    if (!apiKey) {

      let errorMessage = `CryptoCompare API key missing\n\nTo get an API key, go to https://min-api.cryptocompare.com register, create a key, and save it in settings.`;

      throw new ApiError(errorMessage);

    }

    let tikers = Array.from(tikerSet);
    let baseCurrency = this.baseCurrency;
    let date = new Date();
    let data = this.getCryptoPriceData(tikers, baseCurrency, apiKey);

    if (data.Response === "Error") {

      throw new ApiError(data.Message);

    }
    else {

      for (let coin in data) {

        let currentPrice = data[coin][baseCurrency];

        table.push([coin, currentPrice, date.toISOString()]);

        returnedTickerSet.add(coin);

      }
    }
  }

  for (let apiPriceRecord of apiPriceRecords) {
    let ticker = apiPriceRecord.ticker;
    if (ticker !== '' && !returnedTickerSet.has(ticker)) {
      let currentPrice = isNaN(apiPriceRecord.currentPrice) ? null : apiPriceRecord.currentPrice;
      let dateString = isNaN(apiPriceRecord.date) ? null : apiPriceRecord.date.toISOString()
      table.push([ticker, currentPrice, dateString]);
      failedTickerSet.add(ticker);
    }
  }
  this.sortTable(table, 0, true);

  table.push([, , ,]);

  return [table, failedTickerSet];
};