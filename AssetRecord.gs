/**
 * Represents a row in the asset sheet.
 */
var AssetRecord = class AssetRecord {

  /**
   * Assigns each column value to a property.
   * @param {string} ticker - The ticker of the asset.
   * @param {string} assetType - The type of the asset.
   * @param {number} decimalPlaces - The number of decimal places of the asset.
   * @param {number} currentPrice - The current price of the asset.
   * @param {string} currentPriceFormula - The formula in current price column of the row in the assets sheet.
   * @param {string} cmcId - The CoinMarketCap asset id e.g. Bitcoin id = 1.
   * @param {Date} date - When the current price was last updated by the selected API.
   * @param {string} comment - The comment.
   */
  constructor(
    ticker,
    assetType,
    decimalPlaces,
    currentPrice,
    currentPriceFormula,
    cmcId,
    date,
    comment) {

    /**
     * The ticker of the asset.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The type of the asset.
     * @type {string}
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
     * The CoinMarketCap asset id e.g. Bitcoin id = 1.
     * @type {string}
     */
    this.cmcId = cmcId;

    /**
     * When the current price was last updated.
     * @type {Date}
     */
    this.date = new Date(date);

    /**
     * The comment.
     * @type {string}
     */
    this.comment = comment;
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
      'cmcId',
      'date',
      'comment'
    ];

    let index = columns.indexOf(columnName);

    return index === -1 ? index : index + 1;
  }
};

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
      row[4].toString(),
      row[5],
      row[6]
    );

    assetRecords.push(assetRecord);

    rowIndex++;
  }
  return assetRecords;
};

/**
 * Returns a data table corresponding to the given asset records.
 * Adds a blank row to the end of the data table.
 * @param {Array<AssetRecord>} The collection of asset records.
 * @return {Array<Array>} The data table.
 */
AssetTracker.prototype.getAssetDataTable = function (assetRecords) {

  let dataTable = [];

  for (let assetRecord of assetRecords) {

    dataTable.push(
      [
        assetRecord.ticker,
        assetRecord.assetType,
        assetRecord.decimalPlaces,
        assetRecord.currentPriceFormula !== '' ? assetRecord.currentPriceFormula : assetRecord.currentPrice,
        assetRecord.cmcId,
        isNaN(assetRecord.date) ? null : assetRecord.date.toISOString(),
        assetRecord.comment
      ]
    );
  }

  dataTable.push(['', '', '', '', '', '', '']);

  return dataTable;
};