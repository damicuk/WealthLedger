/**
 * Central error handling displays alert and sets the currenct cell when appropriate.
 * @param {string} error - The type of error.
 * @param {string} message - The message to display to the user.
 * @param {string} [sheetName] - The name of the sheet where the error was found.
 * @param {number} [rowIndex] - The row index of the cell in the named sheet.
 * @param {number} [columnIndex] - The column index of the cell in the named sheet.
 */
AssetTracker.prototype.handleError = function (error, message, sheetName, rowIndex, columnIndex) {

  let alertTitle;

  if (error === 'validation') {

    if (sheetName && rowIndex && columnIndex) {
      this.setCurrentCell(sheetName, rowIndex, columnIndex);
    }

    alertTitle = `Validation failed`;

  }
  else if (error === 'assetAccount') {

    if (sheetName && rowIndex && columnIndex) {
      this.setCurrentCell(sheetName, rowIndex, columnIndex);
    }

    alertTitle = `Insufficient funds`;

  }
  else if (error === 'api') {

    alertTitle = `Error updating current prices`;

  }
  else if (error === 'settings') {

    alertTitle = `Failed to save settings`;

  }

  let ui = SpreadsheetApp.getUi();
  ui.alert(alertTitle, message, ui.ButtonSet.OK);

};

/**
 * General custom error from which to inherit.
 * Assigns the name of the class to the name property and passes the message to super.
 * @extends Error
 */
var CustomError = class CustomError extends Error {

  /**
   * Initializes class with message, sets name property to the name of the class.
   * @param {string} message - description of the error and suggested solution.
   */
  constructor(message) {

    super(message);

    this.name = this.constructor.name;
  }
};

/**
 * Error in the validation of the assets or ledger sheet.
 * @extends CustomError
 */
var ValidationError = class ValidationError extends CustomError {

  /**
   * Initializes class with message, rowIndex and columnName, sets name property to the name of the class.
   * @param {string} message - description of the error and suggested solution.
   * @param {number} [rowIndex] - the row numer in the assets or ledger sheet that requires attention.
   * @param {string} [columnName] - the name assigned to the column in the assets or ledger sheet.
   */
  constructor(message, rowIndex, columnName) {

    super(message);

    /**
     * The row numer in the assets or ledger sheet that requires attention.
     * @type {number}
     */
    this.rowIndex = rowIndex;

    /**
     * The name assigned to the column in the assets or ledger sheet.
     * @type {string}
     */
    this.columnName = columnName;
  }
};

/**
 * Error when attempting to withdraw from an asset account.
 * @extends CustomError
 */
var AssetAccountError = class AssetAccountError extends CustomError {

  /**
   * Initializes class with message and rowIndex, sets name property to the name of the class.
   * @param {string} message - description of the error and suggested solution.
   * @param {number} [rowIndex] - the row numer in the assets or ledger sheet that requires attention.
   * @param {string} [columnName] - the name assigned to the column in the assets or ledger sheet.
   */
  constructor(message, rowIndex, columnName) {

    super(message);

    /**
     * The row numer in the assets or ledger sheet that requires attention.
     * @type {number}
     */
    this.rowIndex = rowIndex;

    /**
     * The name assigned to the column in the assets or ledger sheet.
     * @type {string}
     */
    this.columnName = columnName;
  }
};

/**
 * Error when attempting to retrieve current prices from an API.
 * @extends CustomError
 */
var ApiError = class ApiError extends CustomError {

  /**
   * Initializes class with message, sets name property to the name of the class.
   * @param {string} message - description of the error and suggested solution.
   */
  constructor(message) {

    super(message);
  }
};