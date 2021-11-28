/**
 * Asset pool.
 * Deposits and withdrawals may be added to the pool and subsequently matched and processed.
 */
var AssetPool = class AssetPool {

  /**
   * Sets the asset and initializes an empty array to contain the asset deposits.
   * @param {Asset} asset - the asset.
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

  /**
   * Adds a pool deposit to the pool.
   * Merges the pool deposit with the last pool deposit if they have the same date.
   * Otherwise simply adds the pool deposit to the collection of pool deposits.
   * @param {PoolDeposit} poolDeposit - the pool deposit to add.
   */
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

  /**
   * Adds a pool withdrawal to the pool.
   * Merges the pool withdrawal with the last pool withdrawal with the same date and action if one is found.
   * Otherwise simply adds the pool withdrawal to the collection of pool withdrawals.
   * @param {PoolWithdrawal} poolWithdrawal - the pool withdrawal to add.
   */
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

  /**
   * Matches the pool withrawals with the pool deposits and processes the results.
   * Matches first according to the same day rule.
   * Then matches according to the 30 day rule.
   * Then merges the remaining pool deposits and matches any remaining pool withdrawals to with the merged pool deposit.
   */
  match() {

    while (this.matchSameDay());

    while (this.match30Days());

    this.mergePoolDeposits();

    while (this.matchPool());
  }

  /**
   * Matches the pool withrawals with the pool deposits according to the same day rule and processes the results.
   */
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

  /**
   * Matches the pool withrawals with the pool deposits according to the 30 day rule and processes the results.
   */
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

  /**
   * Matches the pool withrawals with the merged pool deposit and processes the results.
   */
  matchPool() {

    for (let poolWithdrawal of this.poolWithdrawals) {

      if (this.poolDeposits.length > 0) {

        let poolDeposit = this.poolDeposits[0];

        if (poolWithdrawal.action === 'Transfer' || poolWithdrawal.action === 'Fee') {

          this.processTransferFee(poolWithdrawal, poolDeposit);
        }
        else {

          this.matchFound(poolWithdrawal, poolDeposit);
        }

        return true;
      }
      else {

        //the application should have thrown an asset account error before reaching here
        throw Error(`Attempted to withdraw ${this.asset} ${poolWithdrawal.debitAmount} + fee ${poolWithdrawal.debitFee} from balance of ${this.asset} ${this.balance}`);

      }
    }
    return false;
  }

  /**
   * Adds the pool withdrawal debit fee to the pool deposit credit fee.
   * Used to add transfer and miscellaneous fees to the merged pool deposit.
   */
  processTransferFee(poolWithdrawal, poolDeposit) {

    let feeSubunits = Math.round(poolWithdrawal.debitFee * this.asset.subunits);
    poolDeposit.creditFeeSubunits += feeSubunits;
    this.poolWithdrawals.splice(this.poolWithdrawals.indexOf(poolWithdrawal), 1);
    return;
  }

  /**
   * Processes a matched pool withdrawal and pool deposit by creating and adding a closed pool lot to the collection.
   */
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

  /**
   * Merges the pool deposits and sets the date of the resulting merged pool deposit to null.
   */
  mergePoolDeposits() {

    if (this.poolDeposits.length === 0) {
      return;
    }

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

    this.poolDeposits = [mergedPoolDeposit];
  }

  /**
   * Gets the difference in days between two dates.
   * @param {Date} date1 - The first date.
   * @param {Date} date2 - The second date.
   * @param {string} [timeZone] - The tz database time zone.
   * @return {Date} The difference in days between the two dates.
  */
  diffDays(date1, date2, timeZone) {

    date1 = this.convertTZDateOnly(date1, timeZone);
    date2 = this.convertTZDateOnly(date2, timeZone);

    const oneDay = 24 * 60 * 60 * 1000;

    const diffDays = Math.round((date2 - date1) / oneDay);

    return diffDays;
  }

  /**
   * Gets the date in the a particular time zone given a date.
   * @param {Date} date - The given date.
   * @param {string} timeZone - The tz database time zone.
   * @return {Date} The date in the given time zone.
  */
  convertTZDateOnly(date, timeZone) {
    return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleDateString('en-US', { timeZone: timeZone }));
  }
};