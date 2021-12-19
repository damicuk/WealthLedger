/**
 * Pool withdrawal.
 * Represents a withdrawal from the asset pool.
 */
var PoolWithdrawal = class PoolWithdrawal extends PoolTransaction {

  /**
   * Initializes the class by calling and passing most parameters to super.
   * The action property set to the action parameter.
   * @param {Date} date - The date of the transaction.
   * @param {Asset} debitAsset - The asset debited.
   * @param {number} debitAmount - The amount of asset debited.
   * @param {number} debitFee - The fee in debit asset units.
   * @param {Asset} creditAsset - The asset credited.
   * @param {number} creditAmount - The amount of asset credited.
   * @param {number} creditFee - The fee in credit asset units.
   * @param {string} action - The type of action of the transaction.
   */
  constructor(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee, action) {

    super(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee, action);
  }

  /**
   * The balance in asset units.
   * @type {number}
   */
  get balance() {

    return this.subunits / this.debitAsset.subunits;
  }

  /**
   * The balance in asset subunits.
   * @type {number}
   */
  get subunits() {

    return this.debitAmountSubunits + this.debitFeeSubunits;
  }

  /**
   * Splits the pool withdrawal into two.
   * Used when matching with pool deposit in an asset account.
   * The fees are assigned in proportion to the balances of the returned pool withdrawal.
   * @param {number} subunits - The balance in subunits required in the first pool withdrawal of the returned pool withdrawals.
   * @return {Array<PoolDeposit>} Array of two pool withdrawals, the first having the requested balance in subunits, the second with the remainder.
   */
  split(subunits) {

    let debitAmountSubunits = AssetTracker.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = subunits - debitAmountSubunits;

    let creditAmountSubunits = AssetTracker.round((subunits / this.subunits) * this.creditAmountSubunits);
    let creditFeeSubunits = AssetTracker.round((subunits / this.subunits) * this.creditFeeSubunits);

    let poolWithdrawal1 = new PoolWithdrawal(
      this.date,
      this.debitAsset,
      debitAmountSubunits / this.debitAsset.subunits,
      debitFeeSubunits / this.debitAsset.subunits,
      this.creditAsset,
      creditAmountSubunits / this.creditAsset.subunits,
      creditFeeSubunits / this.creditAsset.subunits,
      this.action
    );

    let poolWithdrawal2 = new PoolWithdrawal(
      this.date,
      this.debitAsset,
      (this.debitAmountSubunits - poolWithdrawal1.debitAmountSubunits) / this.debitAsset.subunits,
      (this.debitFeeSubunits - poolWithdrawal1.debitFeeSubunits) / this.debitAsset.subunits,
      this.creditAsset,
      (this.creditAmountSubunits - poolWithdrawal1.creditAmountSubunits) / this.creditAsset.subunits,
      (this.creditFeeSubunits - poolWithdrawal1.creditFeeSubunits) / this.creditAsset.subunits,
      this.action
    );

    return [poolWithdrawal1, poolWithdrawal2];
  }
};