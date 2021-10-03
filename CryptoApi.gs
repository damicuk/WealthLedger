/**
 * Requests price data from CryptoCompare API for multiple cryptocurrencies.
 * @param {string} cryptos - Comma-separated list of cryptocurrency tickers.
 * @param {string} baseCurrency - The fiat conversion currency.
 * @param {string} apiKey - The free API key from CryptoCompare.
 * @return {Object} The object containing the fiat conversion price data for the requested cryptocurrencies.
 * Access the prices through data[coin][baseCurrency] e.g.data['BTC']['USD'].
 * Test for errors with data.Response === 'Error' and the error message data.Message.
 */
AssetTracker.prototype.getCryptoPriceData = function (cryptos, baseCurrency, apiKey) {

  let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptos}&tsyms=${baseCurrency}&api_key=${apiKey}`;

  let httpRequest = UrlFetchApp.fetch(url);
  let returnText = httpRequest.getContentText();
  return JSON.parse(returnText);
};

/**
 * Tests the validaty of an API by attempting a simple request and checking for the error response.
 * @param {string} apiKey - The free API key from CryptoCompare.
 * @return {boolean} Whether the test request was successful.
 */
AssetTracker.prototype.validateApiKey = function (apiKey) {

  let data = this.getCryptoPriceData('BTC', 'USD', apiKey);

  if (data.Response === 'Error') {

    return false;
  }
  return true;
};
