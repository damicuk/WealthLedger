/**
 * Represents a row in the asset sheet.
 */
class AssetRecord {

  /**
   * Assigns each column value to a property.
   * @param {string} ticker - The ticker of the asset.
   * @param {string} assetType - The type of the asset.
   * @param {number} decimalPlaces - The number of decimal places of the asset.
   * @param {number} currentPrice - The current price of the asset.
   * @param {string} currentPriceFormula - The formula in current price column of the row in the assets sheet.
   * @param {Date} date - When the current price was last updated by the selected API.
   * @param {string} apiName - The api to call to fetch the current price.
   * @param {string} apiAssetID - The ID to pass to the api to fetch the current price.
   */
  constructor(
    ticker,
    assetType,
    decimalPlaces,
    currentPrice,
    currentPriceFormula,
    date,
    apiName,
    apiAssetID) {

    /**
     * The ticker of the asset.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The type of the asset.
     * @assetType {string}
     */
    this.assetType = assetType;

    /**
     * The number of decimal places of the asset.
     * @type {number}
     */
    this.decimalPlaces = decimalPlaces;

    /**
     * The current price of the asset.
     * @type {number}
     */
    this.currentPrice = currentPrice;

    /**
     * The formula in current price column of the row in the assets sheet.
     * @type {string}
     */
    this.currentPriceFormula = currentPriceFormula;

    /**
     * When the current price was last updated.
     * @type {Date}
     */
    this.date = new Date(date);

    /**
     * The api to call to fetch the current price.
     * @type {string}
     */
    this.apiName = apiName;

    /**
     * The ID to pass to the api to fetch the current price.
     * @type {string}
     */
    this.apiAssetID = apiAssetID;
  }

  /**
   * Returns the index of the column given its assigned name.
   * Avoids hard coding column numbers.
   * @param {string} columnName - the name assigned to the column in the asset sheet.
   * @return {number} The index of the named column or -1 if column name not found.
   * @static
   */
  static getColumnIndex(columnName) {

    let columns = [
      'ticker',
      'assetType',
      'decimalPlaces',
      'currentPrice',
      'date',
      'apiName',
      'apiAssetID'
    ];

    let index = columns.indexOf(columnName);

    return index === -1 ? index : index + 1;
  }
}

/**
 * Retrieves the asset records from the asset sheet.
 * @return {Array<AssetRecord>} The collection of asset records.
 */
AssetTracker.prototype.getAssetRecords = function () {

  let assetsRange = this.getAssetsRange();
  let assetsData = assetsRange.getValues();
  let currentPriceRange = assetsRange.offset(0, 3, assetsRange.getHeight(), 1);
  let currentPriceFormulas = currentPriceRange.getFormulas();

  //convert raw data to object array
  let assetRecords = [];
  let rowIndex = 0;
  for (let row of assetsData) {

    let assetRecord = new AssetRecord(
      row[0],
      row[1],
      row[2],
      row[3],
      currentPriceFormulas[rowIndex][0],
      row[4],
      row[5],
      row[6]
    );

    assetRecords.push(assetRecord);

    rowIndex++;
  }
  return assetRecords;
};