/**
 * Requests price data from CoinMarketCap for multiple asset IDs.
 * Creates a table of the results. 
 * Throws an ApiError if the requied API key is missing.
 * Throw an ApiError if the API request failed.
 * Throws an ApiError if the call to the API returns an error response.
 * @param {string} cmcApiKey - The CoinMarketCap API key.
 * @param {Array<string>|string} cmcIds - Comma-separated list of CoinMarketCap IDs.
 * @param {string} fiatBaseTicker - Fiat base ticker.
 * @return {Array<Array<string, number, Date>>} The table containing the price data for the asset IDs.
 */
AssetTracker.prototype.getPriceMap = function (cmcApiKey, cmcIds, fiatBaseTicker) {

  let priceMap = new Map();

  if (cmcIds.length > 0) {

    let now = new Date();

    if (!cmcApiKey) {

      let errorMessage = `CoinMarketCap API key missing\nTo get an API key, go to https://coinmarketcap.com/api/ register, create a key, and save it in settings.`;

      throw new ApiError(errorMessage);

    }

    const requestOptions = {
      method: 'GET',
      uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
      qs: {
        'start': '1',
        'limit': '5000',
        'convert': fiatBaseTicker
      },
      headers: {
        'X-CMC_PRO_API_KEY': cmcApiKey
      },
      json: true,
      gzip: true
    };

    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${cmcIds}&convert=${fiatBaseTicker}`;

    let response;
    try {
      response = UrlFetchApp.fetch(url, requestOptions);
    }
    catch (error) {

      const message = `Failed to update crypto prices from CoinMarketCap.`;
      throw new ApiError(message);

    }

    const txt = response.getContentText();
    const data = JSON.parse(txt);

    for (let coin in data.data) {

      let currentPrice = data.data[coin].quote[fiatBaseTicker].price;

      priceMap.set(coin, { currentPrice: currentPrice, timestamp: now.toISOString() });

    }
  }

  return priceMap;
};

/**
 * Tests the validaty of an API by attempting a simple request and checking for the error response.
 * @param {string} cmcApiKey - The CoinMarketCap API key.
 * @return {boolean} Whether the test request was successful.
 */
AssetTracker.prototype.validateApiKey = function (cmcApiKey) {

  try {
    this.getPriceMap(cmcApiKey, '1', 'USD');
  }
  catch (error) {
    if (error instanceof ApiError) {
      return false;
    }
    else {
      throw error;
    }
  }
  return true;
};
