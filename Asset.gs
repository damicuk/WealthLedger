/**
 * Represents an asset.
 */
var Asset = class Asset {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {string} ticker - The ticker of the asset.
   * @param {string} assetType - The asset type of the asset.
   * @param {boolean} isBaseCurrency - Whether the asset is the base currency.
   * @param {number} decimalPlaces - The number of decimal places of the asset.
   * @param {number} currentPrice - The current price of the asset.
   */
  constructor(ticker, assetType, isBaseCurrency, decimalPlaces, currentPrice) {

    /**
     * The ticker of the asset.
     * @type {string}
     */
    this.ticker = ticker;

    /**
     * The asset type of the asset.
     * @type {string}
     */
    this.assetType = assetType;

    /**
     * Whether the asset is the base currency.
     * @type {boolean}
     */
    this.isBaseCurrency = isBaseCurrency;

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
   * Whether the asset is fiat.
   * @type {boolean}
   */
  get isFiat() {

    return this.assetType === 'Fiat';

  }

  /**
   * The number of subunits in a unit of the asset.
   * @type {number}
   */
  get subunits() {
    
    return 10 ** this.decimalPlaces;

  }

  /**
   * Override toString() to return the asset ticker.
   * @return {string} The asset ticker.
   */
  toString() {

    return this.ticker;

  }
}
