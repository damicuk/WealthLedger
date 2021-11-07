var AssetPool = class AssetPool {

  /**
   * Sets the asset and initializes an empty array to contain the asset deposits.
   * @param {Assey} asset - the asset.
   */
  constructor(asset) {

    /**
     * The asset.
     * @type {string}
     */
    this.asset = asset;

    /**
     * The collection of pool deposits.
     * @type {Array<PoolDeposit>}
     */
    this.poolDeposits = [];

    /**
     * The collection of pool withdrawals.
     * @type {Array<PoolDeposit>}
     */
    this.poolWithdrawals = [];

    /**
     * The collection of closed pool lots each consisting of a matched pool deposit and pool withdrawal.
     * @type {Array<PoolDeposit>}
     */
    this.closedPoolLots = [];
  }

  /**
   * The balance in the account in subunits.
   * @type {number}
   */
  get subunits() {

    let subunits = 0;
    for (let poolDeposit of this.poolDeposits) {

      subunits += poolDeposit.subunits; //adding two integers - no need to round

    }
    return subunits;
  }

  /**
   * The balance in the account.
   * @type {number}
   */
  get balance() {

    return this.subunits / this.asset.subunits;
  }

  addPoolDeposit(poolDeposit) {

    if (this.poolDeposits.length > 0) {

      let lastPoolDeposit = this.poolDeposits[this.poolDeposits.length - 1];

      if (poolDeposit.date.getTime() === lastPoolDeposit.date.getTime()) {

        lastPoolDeposit.merge(poolDeposit);

        return;
      }
    }
    this.poolDeposits.push(poolDeposit);
  }

  addPoolWithdrawal(poolWithdrawal) {

    let reversedPoolWithrawals = this.poolWithdrawals.slice().reverse();

    for (let testPoolWithdrawal of reversedPoolWithrawals) {

      if (poolWithdrawal.date.getTime() === testPoolWithdrawal.date.getTime()) {

        if (poolWithdrawal.action === testPoolWithdrawal.action) {

          testPoolWithdrawal.merge(poolWithdrawal);

          return;
        }
      }
      else {

        break;
      }
    }
    this.poolWithdrawals.push(poolWithdrawal);
  }

  match() {

    while (this.matchSameDay());

    while (this.match30Days());

    this.mergePoolDeposits();

    while (this.matchPool());
  }

  matchSameDay() {

    for (let poolWithdrawal of this.poolWithdrawals) {

      if (poolWithdrawal.action !== 'Transfer') {

        for (let poolDeposit of this.poolDeposits) {

          if (poolWithdrawal.date.getTime() === poolDeposit.date.getTime()) {

            this.matchFound(poolWithdrawal, poolDeposit);

            return true;
          }
        }
      }
    }
    return false;
  }

  match30Days() {

    for (let poolWithdrawal of this.poolWithdrawals) {

      if (poolWithdrawal.action !== 'Transfer') {

        for (let poolDeposit of this.poolDeposits) {

          let diffDays = this.diffDays(poolWithdrawal.date, poolDeposit.date);

          if (diffDays > 0 && diffDays <= 30) {

            this.matchFound(poolWithdrawal, poolDeposit);

            return true;
          }
        }
      }
    }
    return false;
  }

  matchPool() {

    for (let poolWithdrawal of this.poolWithdrawals) {

      if (this.poolDeposits.length > 0) {

        let poolDeposit = this.poolDeposits[0];

        if (poolWithdrawal.action === 'Transfer') {

          this.processTransferFee(poolWithdrawal, poolDeposit);
        }
        else {

          this.matchFound(poolWithdrawal, poolDeposit);
        }

        return true;
      }
      else {

        //the application should have thrown a crypto account error before reaching here
        throw Error(`Attempted to withdraw ${this.asset} ${poolWithdrawal.debitAmount} + fee ${poolWithdrawal.debitFee} from balance of ${this.asset} ${this.balance}`);

      }
    }
    return false;
  }

  processTransferFee(poolWithdrawal, poolDeposit) {

    let feeSubunits = Math.round(poolWithdrawal.debitFee * this.asset.subunits);
    poolDeposit.creditFeeSubunits += feeSubunits;
    this.poolWithdrawals.splice(this.poolWithdrawals.indexOf(poolWithdrawal), 1);
    return;
  }

  matchFound(poolWithdrawal, poolDeposit) {

    let closedPoolLot;

    if (poolWithdrawal.subunits === poolDeposit.subunits) {

      this.poolDeposits.splice(this.poolDeposits.indexOf(poolDeposit), 1);
      this.poolWithdrawals.splice(this.poolWithdrawals.indexOf(poolWithdrawal), 1);
      closedPoolLot = { poolDeposit: poolDeposit, poolWithdrawal: poolWithdrawal };

    }
    else if (poolWithdrawal.subunits > poolDeposit.subunits) {

      let poolWithdrawals = poolWithdrawal.split(poolDeposit.subunits);
      this.poolDeposits.splice(this.poolDeposits.indexOf(poolDeposit), 1);
      this.poolWithdrawals.splice(this.poolWithdrawals.indexOf(poolWithdrawal), 1, poolWithdrawals[1]);
      closedPoolLot = { poolDeposit: poolDeposit, poolWithdrawal: poolWithdrawals[0] };

    }
    else {

      let poolDeposits = poolDeposit.split(poolWithdrawal.subunits);
      this.poolDeposits.splice(this.poolDeposits.indexOf(poolDeposit), 1, poolDeposits[1]);
      this.poolWithdrawals.splice(this.poolWithdrawals.indexOf(poolWithdrawal), 1);
      closedPoolLot = { poolDeposit: poolDeposits[0], poolWithdrawal: poolWithdrawal };

    }
    if (poolWithdrawal.action !== 'Gift') {

      this.closedPoolLots.push(closedPoolLot);

    }
  }

  mergePoolDeposits() {

    let mergedPoolDeposit;

    for (let poolDeposit of this.poolDeposits) {

      poolDeposit.date = null;

      if (mergedPoolDeposit) {

        mergedPoolDeposit.merge(poolDeposit);
      }
      else {

        mergedPoolDeposit = poolDeposit;
      }
    }

    if (mergedPoolDeposit) {

      this.poolDeposits = [mergedPoolDeposit];
    }
    else {

      this.poolDeposits = [];
    }
  }

  diffDays(date1, date2, timeZone) {

    date1 = this.convertTZDateOnly(date1, timeZone);
    date2 = this.convertTZDateOnly(date2, timeZone);

    const oneDay = 24 * 60 * 60 * 1000;

    const diffDays = Math.round((date2 - date1) / oneDay);

    return diffDays;

  }

  convertTZDateOnly(date, tzString) {
    return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleDateString('en-US', { timeZone: tzString }));
  }
};
