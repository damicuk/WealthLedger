/**
 * Represents an amount of asset that has been sold or exchanged.
 */
var ClosedPoolLot = class ClosedPoolLot {

  /**
   * Initializes the class with the properties set to the parameters.
   * @param {PoolDeposit} poolDeposit - The fee in asset units credited.
   * @param {PoolWithdrawal} poolWithdrawal - The name of the wallet (or exchange) in which the transaction took place.
   */
  constructor(poolDeposit, poolWithdrawal) {

    /**
     * An amount of asset purchased together.
     * @type {Lot}
     */
    this.poolDeposit = poolDeposit;

    /**
     * An amount of asset sold or exchanged.
     * @type {Lot}
     */
    this.poolWithdrawal = poolWithdrawal;

  }
};
