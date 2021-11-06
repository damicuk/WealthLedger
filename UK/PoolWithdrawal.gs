var PoolWithdrawal = class PoolWithdrawal extends PoolTransaction {

  constructor(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee, action) {

    super(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee);

    this.action = action;
  }

  get subunits() {

    return this.debitAmountSubunits + this.debitFeeSubunits;
  }

  split(subunits) {

    let poolWithdrawals = [];

    let debitAmountSubunits = Math.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = Math.round((subunits / this.subunits) * this.debitFeeSubunits);

    let creditAmountSubunits = Math.round((subunits / this.subunits) * this.creditAmountSubunits);
    let creditFeeSubunits = creditAmountSubunits - subunits;

    let poolWithdrawal1 = new PoolWithdrawal(
      this.date,
      this.debitAsset,
      debitAmountSubunits / this.debitAsset.subunits,
      debitFeeSubunits / this.debitAsset.subunits,
      this.creditAsset,
      creditAmountSubunits / this.creditAsset.subunits,
      creditFeeSubunits / this.creditAsset.subunits);

    poolWithdrawals.push(poolWithdrawal1);

    let poolWithdrawal2 = new PoolWithdrawal(
      this.date,
      this.debitAsset,
      (this.debitAmountSubunits - poolWithdrawal1.debitAmountSubunits) / this.debitAsset.subunits,
      (this.debitFeeSubunits - poolWithdrawal1.debitFeeSubunits) / this.debitAsset.subunits,
      this.creditAsset,
      (this.creditAmountSubunits - poolWithdrawal1.creditAmountSubunits) / this.creditAsset.subunits,
      (this.creditFeeSubunits - poolWithdrawal1.creditFeeSubunits) / this.creditAsset.subunits);

    poolWithdrawals.push(poolWithdrawal2);

    return poolWithdrawals;
  }
};
