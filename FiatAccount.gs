/**
 * Fiat account.
 * Calculation are done in integer amounts of subunits to avoid computational rounding errors.
 */
var FiatAccount = class FiatAccount {

  /**
   * Sets the fiat asset and initializes the balance to 0.
   * @param {Asset} asset - The fiat asset.
   * @param {Wallet} wallet - The wallet to which the asset account belongs.
   */
  constructor(asset, wallet) {

    /**
     * The fiat asset.
     * @type {Asset}
     */
    this.asset = asset;

    /**
     * The wallet to which the asset account belongs.
     * @type {Wallet}
     */
    this.wallet = wallet;

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

    this.subunits += AssetTracker.round(amount * this.asset.subunits); //round because multiplying

    return this;

  }
};