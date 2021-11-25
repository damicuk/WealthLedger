/**
 * Fiat account.
 * Calculation are done in integer amounts of subunits to avoid computational rounding errors.
 */
var FiatAccount = class FiatAccount {

  /**
   * Sets the fiat asset and initializes the balance to 0.
   * @param {Asset} asset - The fiat asset.
   */
  constructor(asset) {

    /**
     * The fiat asset.
     * @type {Asset}
     */
    this.asset = asset;

    /**
     * The balance in the account in subunits.
     * @type {number}
     */
    this.subunits = 0;

  }

  /**
   * The fiat ticker.
   * @type {string}
   */
  get ticker() {

    return this.asset.ticker;

  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.subunits / this.asset.subunits;

  }

  /**
   * Adjusts the balance in the account.
   * @param {number} amount - Deposits the amount if positive or withdraws the amount if negative.
   * @return {FiatAccount} Returns this instance for chaining.
   */
  transfer(amount) {

    this.subunits += Math.round(amount * this.asset.subunits); //round because multiplying

    return this;

  }
};