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
   * @param {string} apiName - The api to call to fetch the current price.
   * @param {date} date - When the current price was last updated by the selected API.
   */
  constructor(
    ticker,
    assetType,
    decimalPlaces,
    currentPrice,
    currentPriceFormula,
    apiName,
    date) {

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
     * The api to call to fetch the current price.
     * @type {string}
     */
    this.apiName = apiName;

    /**
     * When the current price was last updated.
     * @type {date}
     */
    this.date = new Date(date);
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
      'apiName',
      'date'
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
  let assetsFormulas = assetsRange.getFormulas();

  //convert raw data to object array
  let assetRecords = [];
  let rowIndex = 0;
  for (let row of assetsData) {

    let assetRecord = new AssetRecord(
      row[0],
      row[1],
      row[2],
      row[3],
      assetsFormulas[rowIndex][3],
      row[4],
      row[5]
    );

    assetRecords.push(assetRecord);

    rowIndex++;
  }
  return assetRecords;
};