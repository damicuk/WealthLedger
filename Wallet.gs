/**
 * Wallet (or exchange) with fiat and/or asset accounts.
 */
class Wallet {

  /**
   * Sets the name of the wallet (or exchange) and initializes empty arrays to contain the fiat and asset accounts.
   * @param {string} name - The name of the wallet (or exchange).
   */
  constructor(name) {

    /**
     * The name of the wallet (or exchange) and initializes empty arrays to contain the fiat and asset accounts.
     * @type {string}
     */
    this.name = name;

    /**
     * The fiat accounts.
     * @type {Array<FiatAccount>}
     */
    this.fiatAccounts = [];

    /**
     * The asset accounts.
     * @type {Array<AssetAccount>}
     */
    this.assetAccounts = [];
  }

  /**
   * Returns the fiat account with the given ticker or creates adds and returns a new fiat account with that ticker.
   * @param {string} ticker - The ticker of the fiat account to search for.
   * @return {FiatAccount} The fiat account found or created.
   */
  getFiatAccount(ticker) {

    for (let fiatAccount of this.fiatAccounts) {

      if (fiatAccount.ticker === ticker) {

        return fiatAccount;
      }
    }

    let fiatAccount = new FiatAccount(ticker);

    this.fiatAccounts.push(fiatAccount);

    return fiatAccount;
  }

  /**
   * Returns the asset account with the given ticker or creates adds and returns a new asset account with that ticker.
   * @param {string} ticker - The ticker of the asset account to search for.
   * @return {AssetAccount} The asset account found or created.
   */
  getAssetAccount(ticker) {

    for (let assetAccount of this.assetAccounts) {

      if (assetAccount.ticker === ticker) {

        return assetAccount;
      }
    }

    let assetAccount = new AssetAccount(ticker);

    this.assetAccounts.push(assetAccount);

    return assetAccount;
  }
}