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
   */
  constructor(
    ticker,
    assetType,
    decimalPlaces,
    currentPrice) {

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
      'currentPrice'
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

  //convert raw data to object array
  let assetRecords = [];
  for (let row of assetsData) {

    let assetRecord = new AssetRecord(
      row[0],
      row[1],
      row[2],
      row[3]
    );

    assetRecords.push(assetRecord);
  }
  return assetRecords;
};

/**
 * Returns the range in the asset sheet that contains the data excluding header rows.
 * If there is no asset sheet it creates a sample asset sheet and returns the range from that.
 * Throws a ValidationError if the ledger sheet contains insufficient columns or no data rows.
 * @return {Range} The range in the asset sheet that contains the data excluding header rows.
 */
AssetTracker.prototype.getAssetsRange = function () {

  let ss = SpreadsheetApp.getActive();
  let assetsSheet = ss.getSheetByName(this.assetsSheetName);

  if (!assetsSheet) {

    // assetSheet = this.sampleAssetSheet();
  }

  if (assetsSheet.getMaxColumns() < this.assetsDataColumns) {
    throw new ValidationError('Asset sheet has insufficient columns.');
  }

  let assetsRange = assetsSheet.getDataRange();

  if (assetsRange.getHeight() < this.assetsHeaderRows + 1) {
    throw new ValidationError('Asset sheet contains no data rows.');
  }

  assetsRange = assetsRange.offset(this.assetsHeaderRows, 0, assetsRange.getHeight() - this.assetsHeaderRows, this.assetsDataColumns);

  return assetsRange;
};




