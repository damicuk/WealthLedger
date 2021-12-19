/**
 * Represents an amount of asset purchased together.
 * Calculations are done in integer amounts of subunits to avoid computational rounding errors.
 */
var Lot = class Lot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Date} date - The date of the transaction.
   * @param {Asset} debitAsset - The asset debited.
   * @param {number} debitExRate - The debit asset to fiat base exchange rate.
   * @param {number} debitAmount - The amount of asset debited.
   * @param {number} debitFee - The fee in debit asset units.
   * @param {Asset} creditAsset - The asset credited.
   * @param {number} creditAmount - The amount of asset credited.
   * @param {number} creditFee - The fee in credit asset units.
   * @param {string} walletName - The name of the wallet (or exchange) in which the transaction took place.
   * @param {string} action - The action in the ledger sheet that gave rise to the lot.
   * @param {number} rowIndex - The index of the row in the ledger sheet that gave rise to the lot.
   */
  constructor(date, debitAsset, debitExRate, debitAmount, debitFee, creditAsset, creditAmount, creditFee, walletName, action, rowIndex) {

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
     * The debit asset to fiat base exchange rate.
     * @type {number}
     */
    this.debitExRate = debitExRate;

    /**
     * The amount of asset debited in subunits.
     * @type {number}
     */
    this.debitAmountSubunits = AssetTracker.round(debitAmount * this.debitAsset.subunits);

    /**
     * The fee in debit asset subunits.
     * @type {number}
     */
    this.debitFeeSubunits = AssetTracker.round(debitFee * this.debitAsset.subunits);

    /**
     * The asset credited.
     * @type {Asset}
     */
    this.creditAsset = creditAsset;

    /**
     * The amount of asset credited in subunits.
     * @type {number}
     */
    this.creditAmountSubunits = AssetTracker.round(creditAmount * this.creditAsset.subunits);

    /**
     * The fee in credit asset subunits.
     * @type {number}
     */
    this.creditFeeSubunits = AssetTracker.round(creditFee * this.creditAsset.subunits);

    /**
     * The name of the wallet (or exchange) in which the transaction took place.
     * @type {string}
     */
    this.walletName = walletName;

    /**
     * The action in the ledger sheet that gave rise to the lot.
     * @type {string}
     */
    this.action = action;

    /**
     * The index of the row in the ledger sheet that gave rise to the lot.
     * @type {number}
     */
    this.rowIndex = rowIndex;
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

    return AssetTracker.round((this.debitAmountSubunits + this.debitFeeSubunits) * this.debitExRate);
  }

  /**
   * Splits a lot into two lots.
   * Used when withdrawing an amount from a asset account.
   * The fees are assigned in proportion to the balances of the returned lots.
   * @param {number} subunits - The balance in subunits required in the first lot of the returned lots.
   * @return {Array<Lot>} Array of two lots, the first having the requested balance, the second with the remainder.
   */
  split(subunits) {

    let debitAmountSubunits = AssetTracker.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = AssetTracker.round((subunits / this.subunits) * this.debitFeeSubunits);

    let creditAmountSubunits = AssetTracker.round((subunits / this.subunits) * this.creditAmountSubunits);
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
      this.walletName,
      this.action,
      this.rowIndex
    );

    let lot2 = new Lot(
      this.date,
      this.debitAsset,
      this.debitExRate,
      (this.debitAmountSubunits - lot1.debitAmountSubunits) / this.debitAsset.subunits,
      (this.debitFeeSubunits - lot1.debitFeeSubunits) / this.debitAsset.subunits,
      this.creditAsset,
      (this.creditAmountSubunits - lot1.creditAmountSubunits) / this.creditAsset.subunits,
      (this.creditFeeSubunits - lot1.creditFeeSubunits) / this.creditAsset.subunits,
      this.walletName,
      this.action,
      this.rowIndex
    );

    return [lot1, lot2];
  }
};