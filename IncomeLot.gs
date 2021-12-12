/**
 * Represents an amount of asset received as income.
 */
var IncomeLot = class IncomeLot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - The date of the income was credited.
   * @param {Asset} sourceAsset - The source of the income.
   * @param {Asset} incomeAsset - The income asset.
   * @param {number} exRate - The income asset to fiat base exchange rate, NaN if the income asset is fiat base.
   * @param {number} amount - The amount of income in asset units.
   * @param {string} walletName - The name of the wallet (or exchange) to which the income was credited.
   */
  constructor(date, sourceAsset, incomeAsset, exRate, amount, walletName) {


    /**
     * The date of the income was credited.
     * @type {Date}
     */
    this.date = date;

    /**
     * The source of the income.
     * @type {Asset}
     */
    this.sourceAsset = sourceAsset;

    /**
     * The income asset.
     * @type {Asset}
     */
    this.incomeAsset = incomeAsset;

    /**
     * The income asset to fiat base exchange rate, NaN if the income asset is fiat base.
     * @type {number}
     */
    this.exRate = exRate;

    /**
     * The amount of income in asset units.
     * @type {number}
     */
    this.amount = amount;

    /**
     * The name of the wallet (or exchange) to which the income was credited.
     * @type {string}
     */
    this.walletName = walletName;
  }
};
