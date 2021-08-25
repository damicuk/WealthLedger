/**
 * Represents an amount of asset purchased together.
 * Calculations are done in integer amounts of subunits to avoid computational rounding errors.
 */
var Lot = class Lot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - the date of the transaction.
   * @param {string} debitAsset - The ticker of the asset debited.
   * @param {number} debitExRate - The debit asset to accounting currency exchange rate, 0 if the debit asset is the accounting currency.
   * @param {number} debitAmount - The amount of asset debited.
   * @param {number} debitFee - The fee in asset units debited.
   * @param {string} creditAsset - The ticker of the asset credited.
   * @param {number} creditAmount - The amount of asset credited.
   * @param {number} creditFee - The fee in asset units credited.
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place.
   */
  constructor(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, walletName) {

    /**
     * The date of the transaction.
     * @type {Date}
     */
    this.date = date;

    /**
     * The ticker of the asset debited.
     * @type {string}
     */
    this.debitAsset = debitAsset;

    /**
     * The debit asset to accounting currency exchange rate, 0 if the debit asset is the accounting currency.
     * @type {number}
     */
    this.debitExRate = debitExRate;

    /**
     * The amount of asset debited in subunits.
     * @type {number}
     */
    this.debitAmountSubunits = Math.round(debitAmount * this._debitAssetSubunits);

    /**
     * The fee in asset subunits debited.
     * @type {number}
     */
    this.debitFeeSubunits = Math.round(debitFee * this._debitAssetSubunits);

    /**
     * The ticker of the asset credited.
     * @type {string}
     */
    this.creditAsset = creditAsset;

    /**
     * The amount of asset credited in subunits.
     * @type {number}
     */
    this.creditAmountSubunits = Math.round(creditAmount * this._creditAssetSubunits);

    /**
     * The fee in asseet subunits credited.
     * @type {number}
     */
    this.creditFeeSubunits = Math.round(creditFee * this._creditAssetSubunits);

    /**
     * The name of the wallet (or exchange) in which the transaction took place.
     * @type {string}
     */
    this.walletName = walletName;

  }

  get debitAsset() {

    return this._debitAsset;
  }

  set debitAsset(ticker) {

    this._debitAsset = ticker;
    this._debitAssetSubunits = Currency.subunits(ticker);

  }

  get creditAsset() {

    return this._creditAsset;
  }

  set creditAsset(ticker) {

    this._creditAsset = ticker;
    this._creditAssetSubunits = Currency.subunits(ticker);
  }

  /**
   * The amount of asset debited.
   * @type {number}
   */
  get debitAmount() {

    return this.debitAmountSubunits / this._debitAssetSubunits;
  }

  /**
   * The fee in asset units debited.
   * @type {number}
   */
  get debitFee() {

    return this.debitFeeSubunits / this._debitAssetSubunits;
  }

  /**
   * The amount of asset credited.
   * @type {number}
   */
  get creditAmount() {

    return this.creditAmountSubunits / this._creditAssetSubunits;
  }

  /**
   * The fee in asset units credited.
   * @type {number}
   */
  get creditFee() {

    return this.creditFeeSubunits / this._creditAssetSubunits;
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
   * The costs are assigned in proportion to the balances of the returned lots.
   * @param {number} subunits - The balance in subunits required in the first lot of the returned lots.
   * @return {Lots[]} Array of two lots, the first having the requested balance, the second with the remainder.
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
      debitAmountSubunits / this._debitAssetSubunits,
      debitFeeSubunits / this._debitAssetSubunits,
      this.creditAsset,
      creditAmountSubunits / this._creditAssetSubunits,
      creditFeeSubunits / this._creditAssetSubunits,
      this.walletName);

    splitLots.push(lot1);

    let lot2 = new Lot(
      this.date,
      this.debitAsset,
      this.debitExRate,
      (this.debitAmountSubunits - lot1.debitAmountSubunits) / this._debitAssetSubunits,
      (this.debitFeeSubunits - lot1.debitFeeSubunits) / this._debitAssetSubunits,
      this.creditAsset,
      (this.creditAmountSubunits - lot1.creditAmountSubunits) / this._creditAssetSubunits,
      (this.creditFeeSubunits - lot1.creditFeeSubunits) / this._creditAssetSubunits,
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
      this.debitAmountSubunits / this._debitAssetSubunits,
      this.debitFeeSubunits / this._debitAssetSubunits,
      this.creditAsset,
      this.creditAmountSubunits / this._creditAssetSubunits,
      this.creditFeeSubunits / this._creditAssetSubunits,
      this.walletName);
  }
};