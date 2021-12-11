/**
 * Represents an amount of asset purchased together.
 * Calculations are done in integer amounts of subunits to avoid computational rounding errors.
 */
var Lot = class Lot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - The date of the transaction.
   * @param {Asset} debitAsset - The asset debited.
   * @param {number} debitExRate - The debit asset to fiat base exchange rate, 0 if the debit asset is fiat base.
   * @param {number} debitAmount - The amount of asset debited.
   * @param {number} debitFee - The fee in debit asset units.
   * @param {Asset} creditAsset - The asset credited.
   * @param {number} creditAmount - The amount of asset credited.
   * @param {number} creditFee - The fee in credit asset units.
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place.
   */
  constructor(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, walletName) {

    /**
     * The date of the transaction.
     * @type {Date}
     */
    this.date = date;

    /**
     * The asset debited.
     * @type {Asset}
     */
    this.debitAsset = debitAsset;

    /**
     * The debit asset to fiat base exchange rate, 0 if the debit asset is fiat base.
     * @type {number}
     */
    this.debitExRate = debitExRate;

    /**
     * The amount of asset debited in subunits.
     * @type {number}
     */
    this.debitAmountSubunits = Math.round(debitAmount * this.debitAsset.subunits);

    /**
     * The fee in debit asset subunits.
     * @type {number}
     */
    this.debitFeeSubunits = Math.round(debitFee * this.debitAsset.subunits);

    /**
     * The asset credited.
     * @type {Asset}
     */
    this.creditAsset = creditAsset;

    /**
     * The amount of asset credited in subunits.
     * @type {number}
     */
    this.creditAmountSubunits = Math.round(creditAmount * this.creditAsset.subunits);

    /**
     * The fee in credit asset subunits.
     * @type {number}
     */
    this.creditFeeSubunits = Math.round(creditFee * this.creditAsset.subunits);

    /**
     * The name of the wallet (or exchange) in which the transaction took place.
     * @type {string}
     */
    this.walletName = walletName;

  }

  /**
   * The amount of asset debited.
   * @type {number}
   */
  get debitAmount() {

    return this.debitAmountSubunits / this.debitAsset.subunits;
  }

  /**
   * The fee in debit asset units.
   * @type {number}
   */
  get debitFee() {

    return this.debitFeeSubunits / this.debitAsset.subunits;
  }

  /**
   * The amount of asset credited.
   * @type {number}
   */
  get creditAmount() {

    return this.creditAmountSubunits / this.creditAsset.subunits;
  }

  /**
   * The fee in credit asset units.
   * @type {number}
   */
  get creditFee() {

    return this.creditFeeSubunits / this.creditAsset.subunits;
  }

  /**
   * The balance in the account in subunits.
   * @type {number}
   */
  get subunits() {

    return this.creditAmountSubunits - this.creditFeeSubunits;
  }

  /**
   * The cost basis in subunits.
   * @type {number}
   */
  get costBasisSubunits() {

    let exRate = 1;
    if (this.debitExRate) {

      exRate = this.debitExRate;

    }

    return Math.round((this.debitAmountSubunits + this.debitFeeSubunits) * exRate);
  }

  /**
   * Splits a lot into two lots.
   * Used when withdrawing an amount from a asset account.
   * The fees are assigned in proportion to the balances of the returned lots.
   * @param {number} subunits - The balance in subunits required in the first lot of the returned lots.
   * @return {Array<Lot>} Array of two lots, the first having the requested balance, the second with the remainder.
   */
  split(subunits) {

    let splitLots = [];

    let debitAmountSubunits = Math.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = Math.round((subunits / this.subunits) * this.debitFeeSubunits);

    let creditAmountSubunits = Math.round((subunits / this.subunits) * this.creditAmountSubunits);
    let creditFeeSubunits = creditAmountSubunits - subunits;

    let lot1 = new Lot(
      this.date,
      this.debitAsset,
      this.debitExRate,
      debitAmountSubunits / this.debitAsset.subunits,
      debitFeeSubunits / this.debitAsset.subunits,
      this.creditAsset,
      creditAmountSubunits / this.creditAsset.subunits,
      creditFeeSubunits / this.creditAsset.subunits,
      this.walletName);

    splitLots.push(lot1);

    let lot2 = new Lot(
      this.date,
      this.debitAsset,
      this.debitExRate,
      (this.debitAmountSubunits - lot1.debitAmountSubunits) / this.debitAsset.subunits,
      (this.debitFeeSubunits - lot1.debitFeeSubunits) / this.debitAsset.subunits,
      this.creditAsset,
      (this.creditAmountSubunits - lot1.creditAmountSubunits) / this.creditAsset.subunits,
      (this.creditFeeSubunits - lot1.creditFeeSubunits) / this.creditAsset.subunits,
      this.walletName);

    splitLots.push(lot2);

    return splitLots;

  }

  /**
   * Duplicates a lot.
   * Used to keep a separate account of income lots.
   * @return {Lots} A copy of the lot.
   */
  duplicate() {

    return new Lot(
      this.date,
      this.debitAsset,
      this.debitExRate,
      this.debitAmountSubunits / this.debitAsset.subunits,
      this.debitFeeSubunits / this.debitAsset.subunits,
      this.creditAsset,
      this.creditAmountSubunits / this.creditAsset.subunits,
      this.creditFeeSubunits / this.creditAsset.subunits,
      this.walletName);
  }
};