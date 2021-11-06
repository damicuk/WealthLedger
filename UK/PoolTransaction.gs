var PoolTransaction = class PoolTransaction {

  constructor(date, debitAsset, debitAmount, debitFee, creditAsset, creditAmount, creditFee) {

    this.date = date;
    this.debitAsset = debitAsset;
    this.debitAmountSubunits = Math.round(debitAmount * this.debitAsset.subunits);
    this.debitFeeSubunits = Math.round(debitFee * this.debitAsset.subunits);
    this.creditAsset = creditAsset;
    this.creditAmountSubunits = Math.round(creditAmount * this.creditAsset.subunits);
    this.creditFeeSubunits = Math.round(creditFee * this.creditAsset.subunits);

  }

  get debitAmount() {

    return this.debitAmountSubunits / this.debitAsset.subunits;
  }

  get debitFee() {

    return this.debitFeeSubunits / this.debitAsset.subunits;
  }

  get creditAmount() {

    return this.creditAmountSubunits / this.creditAsset.subunits;
  }

  get creditFee() {

    return this.creditFeeSubunits / this.creditAsset.subunits;
  }

  merge(poolTransaction) {

    if (this.date && this.date.getTime() !== poolTransaction.date.getTime()) {
      throw Error(`Unable to merge pool transaction with date ${this.date.toUTCString()} and pool transaction with date ${poolTransaction.date.toUTCString()}`);
    }
    else if (this.debitAsset !== poolTransaction.debitAsset) {
      throw Error(`Unable to merge pool transaction with debit currency ${this.debitAsset} and pool transaction with debit currency ${poolTransaction.debitAsset}`);
    }
    else if (this.creditAsset !== poolTransaction.creditAsset) {
      throw Error(`Unable to merge pool transaction with credit currency ${this.creditAsset} and pool transaction with credit currency ${poolTransaction.creditAsset}`);
    }
    this.debitAmountSubunits += poolTransaction.debitAmountSubunits;
    this.debitFeeSubunits += poolTransaction.debitFeeSubunits;
    this.creditAmountSubunits += poolTransaction.creditAmountSubunits;
    this.creditFeeSubunits += poolTransaction.creditFeeSubunits;

  }
}
