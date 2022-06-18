/**
 * Updates the assets sheet current price and timestamps columns as necessary.
 * Gets the set of tickers whos current price needs to be update by CoinMarketCap.
 * Gets the current price for those tickers from CoinMarketCap.
 * Updates the current price and timestamp columns.
 * Throws an ApiError if it failed to get any of the needed current prices.
 * @param {Array<AssetRecord>} assetRecords - The collection of asset records.
 */
AssetTracker.prototype.updateAssetPrices = function (assetRecords) {

  let cmcIdSet = this.getCmcIdSet(assetRecords);

  let priceMap = new Map();

  let errorMessages = [];

  try {
    priceMap = this.getPriceMap(this.cmcApiKey, Array.from(cmcIdSet), this.fiatBase.ticker);
  }
  catch (error) {
    if (error instanceof ApiError) {
      errorMessages.push(error.message);
    }
    else {
      throw error;
    }
  }

  let currentPriceTable = [];
  let timestampTable = [];
  let updateRequired = false;
  for (let assetRecord of assetRecords) {
    let cmcId = assetRecord.cmcId;
    let currentPrice = assetRecord.currentPrice;
    let currentPriceFormula = assetRecord.currentPriceFormula;
    let date = assetRecord.date;
    let timestamp = (isNaN(date) || cmcId === '') ? null : assetRecord.date.toISOString();

    if (priceMap.has(cmcId)) {
      let mapValue = priceMap.get(cmcId);
      currentPriceTable.push([[mapValue.currentPrice]]);
      timestampTable.push([[mapValue.timestamp]]);
      updateRequired = true;
    }
    else if (currentPriceFormula !== '') {
      currentPriceTable.push([[currentPriceFormula]]);
      timestampTable.push([[timestamp]]);
    }
    else {
      currentPriceTable.push([[currentPrice]]);
      timestampTable.push([[timestamp]]);
    }
  }

  if (updateRequired) {

    let assetsRange = this.getAssetsRange();
    let currentPriceRange = assetsRange.offset(0, 3, assetsRange.getHeight(), 1);
    let timestampRange = assetsRange.offset(0, 5, assetsRange.getHeight(), 1);
    currentPriceRange.setValues(currentPriceTable);
    timestampRange.setValues(timestampTable);
  }

  let failedCmcIdSet = this.getFailedCmcIdSet(cmcIdSet, priceMap);

  if (failedCmcIdSet.size > 0) {
    errorMessages.push(`Failed to update price for CoinMarketCap ID ${Array.from(failedCmcIdSet).sort((a, b) => Number(a) - Number(b)).join(', ')} in fiat base (${this.fiatBase}).`);
  }

  if (errorMessages.length > 0) {
    throw new ApiError(errorMessages.join('\n\n'));
  }
};

/**
 * Gets the set of CoinMarketCap Ids whos current price needs updating.
 * @param {Array<AssetRecord>} assetRecords - The collection of asset records.
 * @param {number} refreshMins - The number of minutes after which the current price is no longer considered current.
 * @return {Set<string>} The set of CoinMarketCap Ids whos current price needs updating.
 */
AssetTracker.prototype.getCmcIdSet = function (assetRecords, refreshMins = 10) {

  let cmcIdSet = new Set();
  let now = new Date();
  let refreshMs = refreshMins * 60000;
  let pricesCurrent = true;

  for (let assetRecord of assetRecords) {
    let cmcId = assetRecord.cmcId;
    let date = assetRecord.date;

    if (isNaN(date) || now - date > refreshMs) {
      pricesCurrent = false;
    }
    if (cmcId !== '') {
      cmcIdSet.add(cmcId);
    }
  }

  if (pricesCurrent) {
    return new Set();
  }

  return cmcIdSet;
};

/**
 * Gets the set of CoinMarketCap IDs whos current price was not updated.
 * @param {Set<string>} cmcIdSet - The set of CoinMarketCap IDs whos current price needs to updating.
 * @param {Map} priceMap - The map of CoinMarketCap IDs whos current price was updated.
 * @return {Set<string>} The set of CoinMarketCap IDs whos current price was not updated.
 */
AssetTracker.prototype.getFailedCmcIdSet = function (cmcIdSet, priceMap) {

  let failedCmcIdSet = new Set(cmcIdSet);
  for (let successCmcId of priceMap.keys()) {
    failedCmcIdSet.delete(successCmcId);
  }
  return failedCmcIdSet;
};