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
     * Map of tickers to fiat accounts.
     * @type {Map}
     */
    this.fiatAccounts = new Map();

    /**
     * Map of tickers to asset accounts.
     * @type {Map}
     */
    this.assetAccounts = new Map();
  }

  /**
   * Returns the fiat account of the given asset or creates adds and returns a new fiat account of that asset.
   * @param {Asset} asset - The asset to search for.
   * @return {FiatAccount} The fiat account found or created.
   */
  getFiatAccount(asset) {

    let fiatAccount = this.fiatAccounts.get(asset.ticker);

    if (!fiatAccount) {

      fiatAccount = new FiatAccount(asset, this.name);
      this.fiatAccounts.set(asset.ticker, fiatAccount);
    }

    return fiatAccount;
  }

  /**
   * Returns the asset account of the given asset or creates adds and returns a new asset account with that asset.
   * @param {Asset} asset - The asset to search for.
   * @return {AssetAccount} The asset account found or created.
   */
  getAssetAccount(asset) {

    let assetAccount = this.assetAccounts.get(asset.ticker);

    if (!assetAccount) {

      assetAccount = new AssetAccount(asset, this.name);
      this.assetAccounts.set(asset.ticker, assetAccount);
    }

    return assetAccount;
  }
}