/**
 * Represents a row in an api price sheet.
 */
class ApiPriceRecord {

  /**
     * Assigns each column value to a property.
     * @param {string} ticker - The ticker of the asset.
     * @param {number} currentPrice - The current price of the asset.
     * @param {date} date - When the current price was last updated by the selected API.
     */
  constructor(
    ticker,
    currentPrice,
    date) {

    /**
     * The ticker of the asset.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The current price of the asset.
     * @type {number}
     */
    this.currentPrice = currentPrice;

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
      'currentPrice',
      'date'
    ];

    let index = columns.indexOf(columnName);

    return index === -1 ? index : index + 1;
  }
};

/**
 * Retrieves the asset records from the asset sheet.
 * @return {Array<AssetRecord>} The collection of asset records.
 */
AssetTracker.prototype.getApiPriceRecords = function (sheetName) {

  let range = this.getApiPriceRange(sheetName);

  //convert raw data to object array
  let apiPriceRecords = [];

  if (range) {

    let data = range.getValues();

    for (let row of data) {

      let apiPriceRecord = new ApiPriceRecord(
        row[0],
        row[1],
        row[2]
      );

      apiPriceRecords.push(apiPriceRecord);
    }
  }
  return apiPriceRecords;
};

/**
 * Returns the range in the asset sheet that contains the data excluding header rows.
 * If there is no asset sheet it creates a sample asset sheet and returns the range from that.
 * Throws a ValidationError if the ledger sheet contains insufficient columns or no data rows.
 * @return {Range} The range in the asset sheet that contains the data excluding header rows.
 */
AssetTracker.prototype.getApiPriceRange = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = this.apiPriceSheet(sheetName);
  }

  if (sheet.getMaxColumns() < this.apiPriceSheetDataColumns) {
    throw new ValidationError(`${sheetName} sheet has insufficient columns.`);
  }

  let range = sheet.getDataRange();

  if (range.getHeight() < this.apiPriceSheetHeaderRows + 1) {
    return null;
  }

  range = range.offset(this.apiPriceSheetHeaderRows, 0, range.getHeight() - this.apiPriceSheetHeaderRows, this.apiPriceSheetDataColumns);

  return range;
};