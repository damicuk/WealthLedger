/**
 * Represents the inflation index at a given date.
 */
var InflationRecord = class InflationRecord {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - The date of the inflation.
   * @param {number} inflationIndex - The inflation index at the given date.
   * @param {number} rowIndex - The index of the row in the ledger sheet that gave rise to the inflation record.
   */
  constructor(date, inflationIndex, rowIndex) {

    /**
     * The date of the inflation.
     * @type {Date}
     */
    this.date = date;

    /**
     * The inflation index at the given date.
     * @type {number}
     */
    this.inflationIndex = inflationIndex;

    /**
     * The index of the row in the ledger sheet that gave rise to the inflation record.
     * @type {number}
     */
    this.rowIndex = rowIndex;
  }
};
