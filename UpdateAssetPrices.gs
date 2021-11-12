AssetTracker.prototype.updateAssetPrices = function (assetRecords) {

  let cmcTickerSet = this.getApiTickerSet(this.cmcApiName, assetRecords);
  let ccTickerSet = this.getApiTickerSet(this.ccApiName, assetRecords);

  let cmcAssetPriceMap = new Map();
  let ccAssetPriceMap = new Map();

  let errorMessages = [];

  try {
    cmcAssetPriceMap = this.getApiAssetPriceMap(this.cmcApiName, this.cmcApiKey, Array.from(cmcTickerSet), this.fiatBase.ticker);
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
    ccAssetPriceMap = this.getApiAssetPriceMap(this.ccApiName, this.ccApiKey, Array.from(ccTickerSet), this.fiatBase.ticker);
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
    let ticker = assetRecord.ticker;
    let apiName = assetRecord.apiName;
    let currentPrice = assetRecord.currentPrice;
    let currentPriceFormula = assetRecord.currentPriceFormula;
    let date = assetRecord.date;
    let timestamp = (isNaN(date) || apiName === '') ? null : assetRecord.date.toISOString();

    if (apiName === this.cmcApiName && cmcAssetPriceMap.has(ticker)) {
      let mapValue = cmcAssetPriceMap.get(ticker);
      currentPriceTable.push([[mapValue.currentPrice]]);
      timestampTable.push([[mapValue.timestamp]]);
      updateRequired = true;
    }
    else if (apiName === this.ccApiName && ccAssetPriceMap.has(ticker)) {
      let mapValue = ccAssetPriceMap.get(ticker);
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

  let cmcFailedTickerSet = this.getApiFailedTickerSet(cmcTickerSet, cmcAssetPriceMap);
  let ccFailedTickerSet = this.getApiFailedTickerSet(ccTickerSet, ccAssetPriceMap);

  if (cmcFailedTickerSet.size > 0) {
    errorMessages.push(`Failed to update price for ${Array.from(cmcFailedTickerSet).sort(this.abcComparator).join(', ')} in fiat base (${this.fiatBase}) from ${this.cmcApiName}.`);
  }

  if (ccFailedTickerSet.size > 0) {
    errorMessages.push(`Failed to update price for ${Array.from(ccFailedTickerSet).sort(this.abcComparator).join(', ')} in fiat base (${this.fiatBase}) from ${this.ccApiName}.`);
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
};


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
};