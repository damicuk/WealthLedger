var PoolDeposit = class PoolDeposit extends PoolTransaction {

  constructor(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee) {

    super(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee);
  }

  get subunits() {

    return this.creditAmountSubunits - this.creditFeeSubunits;
  }

  get costBasisSubunits() {

    // return Math.round(this.debitAmountSubunits + this.debitFeeSubunits);

    return this.debitAmountSubunits + this.debitFeeSubunits;
  }

  split(subunits) {

    let poolDeposits = [];

    let debitAmountSubunits = Math.round((subunits / this.subunits) * this.debitAmountSubunits);
    let debitFeeSubunits = Math.round((subunits / this.subunits) * this.debitFeeSubunits);

    let creditAmountSubunits = Math.round((subunits / this.subunits) * this.creditAmountSubunits);
    let creditFeeSubunits = creditAmountSubunits - subunits;

    let poolDeposit1 = new PoolDeposit(
      this.date,
      this.debitAsset,
      debitAmountSubunits / this.debitAsset.subunits,
      debitFeeSubunits / this.debitAsset.subunits,
      this.creditAsset,
      creditAmountSubunits / this.creditAsset.subunits,
      creditFeeSubunits / this.creditAsset.subunits);

    poolDeposits.push(poolDeposit1);

    let poolDeposit2 = new PoolDeposit(
      this.date,
      this.debitAsset,
      (this.debitAmountSubunits - poolDeposit1.debitAmountSubunits) / this.debitAsset.subunits,
      (this.debitFeeSubunits - poolDeposit1.debitFeeSubunits) / this.debitAsset.subunits,
      this.creditAsset,
      (this.creditAmountSubunits - poolDeposit1.creditAmountSubunits) / this.creditAsset.subunits,
      (this.creditFeeSubunits - poolDeposit1.creditFeeSubunits) / this.creditAsset.subunits);

    poolDeposits.push(poolDeposit2);

    return poolDeposits;
  }
};
