/**
 * Asset account.
 * Calculation are done in integer amounts of subunits to avoid computational rounding errors.
 */
var AssetAccount = class AssetAccount {

  /**
   * Sets the asset and initializes an empty array to contain the asset lots.
   * @param {Asset} asset - The asset.
   * @param {Wallet} wallet - The wallet to which the asset account belongs.
   */
  constructor(asset, wallet) {

    /**
     * The asset.
     * @type {Asset}
     */
    this.asset = asset;

    /**
    * The wallet to which the asset account belongs.
    * @type {Wallet}
    */
    this.wallet = wallet;

    /**
     * The asset lots.
     * @type {Array<Lot>}
     */
    this.lots = [];
  }

  /**
   * The asset ticker.
   * @type {string}
   */
  get ticker() {

    return this.asset.ticker;

  }

  /**
   * The balance in the account in subunits.
   * @type {number}
   */
  get subunits() {

    let subunits = 0;
    for (let lot of this.lots) {

      subunits += lot.subunits; //adding two integers - no need to round

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
   * Deposits a single asset lot into the account.
   * @param {Lot|Array<Lot>} lot - The single lot or array of lots to deposit into the account.
   */
  deposit(lot) {

    if (Array.isArray(lot)) {

      this.lots.push(...lot);
    }
    else {

      this.lots.push(lot);
    }
  }


  /**
   * Withdraws an amount of asset from the account.
   * If necessary the last lot to be withdrawn is split.
   * The fee is assigned to the withdrawn lots in proportion to their size.
   * Throws an error if the amount requested is greater than the balance in the account.
   * @param {number} amount - The amount of asset to withdraw.
   * @param {number} fee - The fee which is also withdrawn from the account.
   * @param {string} lotMatching - The lot matching method used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
   * @return {Array<Lot>} The collection of lots withdrawn.
   */
  withdraw(amount, fee, lotMatching, rowIndex) {

    let amountSubunits = AssetTracker.round(amount * this.asset.subunits);
    let feeSubunits = AssetTracker.round(fee * this.asset.subunits);
    let neededSubunits = amountSubunits + feeSubunits;

    if (neededSubunits > this.subunits) {

      throw new AssetAccountError(`Ledger row ${rowIndex}: Attempted to withdraw ${this.ticker} ${amount} + fee ${fee ? fee : 0} from ${this.wallet.name} balance of ${this.balance}.`, rowIndex, 'debitAmount');

    }

    this.lots.sort(this.lotComparator(lotMatching));

    let keepLots = [];
    let withdrawLots = [];
    for (let lot of this.lots) {

      if (neededSubunits > 0) {  //need more

        if (lot.subunits <= neededSubunits) { //want full lot
          withdrawLots.push(lot);
          neededSubunits -= lot.subunits;
        }
        else {  //need to split lot
          let splitLots = lot.split(neededSubunits);
          withdrawLots.push(splitLots[0]);
          keepLots.push(splitLots[1]);
          neededSubunits = 0;
        }

      }
      else {  //keep the remaining lots

        keepLots.push(lot);

      }
    }

    //apportion the fee to withdrawal lots
    this.apportionFeeSubunits(feeSubunits, withdrawLots);

    this.lots = keepLots;
    return withdrawLots;
  }

  /**
   * Apportions fee subunits equitably between lots.
   * The fee subunits are assigned to the lots in proportion to each lot's subunits.
   * Throws an error if the fee subunits are greater than the total lots' subunits.
   * @param {number} fee subunit - The fee subunits to assign to the lots.
   * @param {Array<Lot>} lots - The collection of lots.
   */
  apportionFeeSubunits(feeSubunits, lots) {

    let lotsSubunits = [];
    for (let lot of lots) {
      lotsSubunits.push(lot.subunits);
    }
    let apportionedFeeSubunits = AssetTracker.apportionInteger(feeSubunits, lotsSubunits);
    let index = 0;
    for (let lot of lots) {
      lot.creditFeeSubunits += apportionedFeeSubunits[index++];
    }
  }

  /**
   * Apportions fee equitably between the lots of the account.
   * The fee is assigned to the lots in proportion to the lot size.
   * Throws an error if the fee is greater than the balance in the account.
   * @param {number} fee - The fee to assign to the lots of this account.
   * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
   */
  apportionFee(fee, rowIndex) {

    let feeSubunits = AssetTracker.round(fee * this.asset.subunits);

    if (feeSubunits > this.subunits) {

      throw new AssetAccountError(`Ledger row ${rowIndex}: Attempted to withdraw fee ${this.ticker} ${fee} from ${this.wallet.name} balance of ${this.balance}.`, rowIndex, 'debitFee');

    }

    this.apportionFeeSubunits(feeSubunits, this.lots);
  }

  /**
   * Removes any lots with zero subunits.
   * Used when misc fee or split sets lot subunits to zero.
   */
  removeZeroSubunitLots() {

    let keepLots = [];
    let withdrawLots = [];

    for (let lot of this.lots) {

      if (lot.subunits > 0) {
        keepLots.push(lot);
      }
      else {
        withdrawLots.push(lot);
      }
    }

    this.lots = keepLots;
    return withdrawLots;
  }

  /**
   * Adjusts the account subunits by the ajust subunits
   * @param {number} adjustSubunits - The subunits by which to adjust the account subunits.
   */
  adjust(adjustSubunits) {

    let lotSubunits = [];
    for (let lot of this.lots) {
      lotSubunits.push(lot.subunits);
    }

    let lotAdjustSubunits = AssetTracker.apportionInteger(adjustSubunits, lotSubunits);

    let index = 0;
    for (let lot of this.lots) {

      lot.creditAmountSubunits += lotAdjustSubunits[index++];
    }
  }

  /**
   * Given a lot matching method string returns a comparator function used to sort lots.
   * @param {string} lotMatching - The lot matching method used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * Throw an error with any other input.
   * @return {function} The comparator function used to sort lots.
   */
  lotComparator(lotMatching) {

    if (lotMatching === 'FIFO') {

      return function (lot1, lot2) {
        return lot1.date - lot2.date;
      };
    }
    else if (lotMatching === 'LIFO') {

      return function (lot1, lot2) {
        return lot2.date - lot1.date;
      };
    }
    else if (lotMatching === 'LOFO') {

      return function (lot1, lot2) {
        return (lot1.costBasisSubunits / lot1.subunits) - (lot2.costBasisSubunits / lot2.subunits);
      };
    }
    else if (lotMatching === 'HIFO') {

      return function (lot1, lot2) {
        return (lot2.costBasisSubunits / lot2.subunits) - (lot1.costBasisSubunits / lot1.subunits);
      };
    }
    else {
      throw Error(`Lot Matching Method (${lotMatching}) not recognized.`);
    }
  }
};