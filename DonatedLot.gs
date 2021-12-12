/**
 * Represents donated asset lot.
 */
var DonatedLot = class DonatedLot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {Lot} lot - An amount of asset purchased together.
   * @param {Date} date - The date of the donation.
   * @param {number} exRate - The donated asset to fiat base exchange rate, NaN if the income asset is fiat base.
   * @param {string} walletName - The name of the wallet (or exchange) from which the donation was debited.
   */
  constructor(lot, date, exRate, walletName) {

    /**
     * An amount of asset purchased together.
     * @type {Lot}
     */
    this.lot = lot;
    
    /**
     * The date of the donation.
     * @type {Date}
     */
    this.date = date;

    /**
     * The income asset to fiat base exchange rate, NaN if the income asset is fiat base.
     * @type {number}
     */
    this.exRate = exRate;

    /**
     * The name of the wallet (or exchange) where the income was credited.
     * @type {string}
     */
    this.walletName = walletName;
  }
};
