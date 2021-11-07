/**
 * The main class that processes the Ledger sheet fetches the current crypto prices and writes the reports.
 */
var AssetTracker = class AssetTracker {

  /**
   * Initializes class with empty arrays of wallets, income, closed, and donated lots, user properties, and input and output sheet names.
   */
  constructor() {

    /**
     * The ticker of the base currency.
     * * @type {string}
     */
    this.baseCurrency;

    /**
     * Maps asset ticker to object containing asset properties: type, decimalPlaces, price.
     * @type {Array<Obeject>}
     */
    this.assets = new Map();

    /**
     * The set of asset types defined by the user (not the default asset types).
     * @type {Set}
     */
    this.userDefinedAssetTypes = new Set();


    /**
     * Collection of all Lots.
     * @type {Array<Obeject>}
     */
    this.lots = [];

    /**
     * Collection of Wallets.
     * @type {Array<Wallet>}
     */
    this.wallets = [];

    /**
     * Collection of Lots gained as income.
     * @type {Array<Obeject>}
     */
    this.incomeLots = [];

    /**
     * Collection of ClosedLots.
     * @type {Array<ClosedLot>}
     */
    this.closedLots = [];

    /**
     * Collection of DonatedLots.
     * @type {Array<Obeject>}
     */
    this.donatedLots = [];

    /**
     * Collection of AssetPools.
     * @type {Array<AssetPool>}
     */
    this.assetPools = [];

    /**
     * The number of decimal places to round exrate calculation.
     * @type {number}
     */
    this.exRateDecimalPlaces = 7;

    //get user properties
    let userProperties = PropertiesService.getUserProperties();

    /**
     * The API key used to connect to CryptoCompare to retrieve crypto prices.
     * @type {string}
     */
    this.ccApiKey = userProperties.getProperty('ccApiKey');

    /**
     * The API key used to connect to CoinMarketCap to retrieve crypto prices.
     * @type {string}
     */
    this.cmcApiKey = userProperties.getProperty('cmcApiKey');

    /**
     * The current lot matching method.
     * Options are FIFO, LIFO, HIFO, LOFO.
     * Initialized to default FIFO.
     * @type {string}
     */
    this.lotMatching = 'FIFO';

    /**
     * The number of header rows in the ledger sheet.
     * @type {number}
     */
    this.ledgerHeaderRows = 2;

    /**
     * The number of data columns in the ledger sheet.
     * @type {number}
     */
    this.ledgerDataColumns = 13;

    /**
     * The number of header rows in the assets sheet.
     * @type {number}
     */
    this.assetsHeaderRows = 1;

    /**
     * The number of data columns in the assets sheet.
     * @type {number}
     */
    this.assetsDataColumns = 6;

    /**
     * The number of header rows in an api price sheet
     * @type {number}
     */
    this.apiPriceSheetHeaderRows = 1;

    /**
     * The number of data columns in an api price sheet
     * @type {number}
     */
    this.apiPriceSheetDataColumns = 3;

    this.ledgerSheetName = 'Ledger';
    this.ledgerSheetVersion = '1';
    this.assetsSheetName = 'Assets';
    this.assetsSheetVersion = '1';

    this.ccApiName = 'CryptoCompare';
    this.cmcApiName = 'CoinMarketCap';
    this.validApiNames = [this.ccApiName, this.cmcApiName];

    this.fiatAccountsSheetName = 'Fiat Accounts Data';
    this.fiatAccountsRangeName = 'FiatAccounts';

    this.openPositionsReportName = 'Open Positions Report';
    this.closedPositionsReportName = 'Closed Positions Report';
    this.donationsReportName = 'Donations Report';
    this.incomeReportName = 'Income Report';
    this.openSummaryReportName = 'Open Summary Report';
    this.closedSummaryReportName = 'Closed Summary Report';
    this.incomeSummaryReportName = 'Income Summary Report';
    this.donationsSummaryReportName = 'Donations Summary Report';
    this.walletsReportName = 'Wallets Report';

    this.defaultReportNames = [
      this.openPositionsReportName,
      this.closedPositionsReportName,
      this.donationsReportName,
      this.incomeReportName,
      this.openSummaryReportName,
      this.closedSummaryReportName,
      this.incomeSummaryReportName,
      this.donationsSummaryReportName,
      this.walletsReportName
    ];

    this.assetsRangeName = 'Assets';
    this.openPositionsRangeName = 'OpenPositions';
    this.closedPositionsRangeName = 'ClosedPositions';
    this.donationsRangeName = 'Donations';
    this.incomeRangeName = 'Income';

    this.ukOpenPoolsReportName = 'UK Open Pools Report';
    this.ukAssetAccountsReportName = 'UK Asset Accounts Report';
    this.ukClosedPositionsReportName = 'UK Closed Positions Report';
    this.ukIncomeReportName = 'UK Income Report';
    this.ukOpenSummaryReportName = "UK Open Summary Report";
    this.ukClosedSummaryReportName = "UK Closed Summary Report";
    this.ukIncomeSummaryReportName = 'UK Income Summary Report';
    this.ukDonationsSummaryReportName = 'UK Donations Summary Report';
    this.ukWalletsReportName = 'UK Wallets Report';

    this.ukReportNames = [
      this.ukOpenPoolsReportName,
      this.ukAssetAccountsReportName,
      this.ukClosedPositionsReportName,
      this.ukIncomeReportName,
      this.ukOpenSummaryReportName,
      this.ukClosedSummaryReportName,
      this.ukIncomeSummaryReportName,
      this.ukDonationsSummaryReportName,
      this.ukWalletsReportName
    ];

    this.ukOpenPoolsRangeName = 'UKOpenPools';
    this.ukAssetAccountsRangeName = 'UKAssetAccounts';
    this.ukClosedPositionsRangeName = 'UKClosedPositions';
  }

  /**
   * Gets the type of the asset specified by the ticker.
   * @param {string} ticker - The asset ticker.
   * @return {string} The type of the asset specified by the ticker.
   */
  getAssetType(ticker) {
    let asset = this.assets.get(ticker);
    return asset ? asset.assetType : null;
  }

  /**
   * Determines whether the ticker is a key in the assets map.
   * @param {string} ticker - The asset ticker.
   * @return {boolean} Whether the ticker is a key in the assets map.
   */
  isValid(ticker) {
    return this.assets.has(ticker);
  }

  /**
   * Array of lot matching options used to determine the order in which lots are withdrawn.
   * FIFO First in first out.
   * LIFO Last in first out.
   * HIFO Highest cost first out.
   * LOFO Lowest cost first out.
   * @type {Array<string>}
   * @static
   */
  static get lotMatchings() {

    return ['FIFO', 'LIFO', 'HIFO', 'LOFO'];
  }

  /**
   * Comparator used to sort items alphabetically.
   * @param {string} a - The first item to be compared.
   * @param {string} b - The second item to be compared.
   * @return {number} Used to determine the sort order.
   * @static
   */
  static abcComparator(a, b) {
    return a > b ? 1 :
      b > a ? -1 :
        0;
  }

  /**
   * Apportions an integer amount to an array or integers as equitably as possible.
   * e.g. used to apportion fees amoungst lots of cryptocurrency in proportion to the size of the lots.
   * @param {number} integerAmount - The integer amount to divide and apportion.
   * @param {Array<number>} integerArray - The array of integers which determines the distribution of the divided amount.
   * @return {Array<number>} The array of integers that sum to the orignal integer amount, divided as equitably as possible.
   * @static
   */
  static apportionInteger(integerAmount, integerArray) {

    let total = integerArray.reduce((a, b) => a + b, 0);
    let resultArray = [];
    let totalError = -integerAmount;
    let originalIndex = 0;
    for (let integer of integerArray) {

      let float;
      if (total > 0) {
        float = (integer / total) * integerAmount;
      }
      else {
        float = integerAmount / integerArray.length;
      }
      let rounded = Math.round(float);
      let error = rounded - float;

      resultArray.push([rounded, error, originalIndex++]);

      //how much does the total apportioned amount differ from the original input amount?
      totalError += rounded;
    }

    if (totalError < 0) { //negative error means we have to add values
      resultArray.sort(function (a, b) { // sort by error desc (most negative first)
        return a[1] - b[1];
      });
      for (let i = 0; i < -totalError; i++) {
        resultArray[i][0] += 1;
      }
    }
    else if (totalError > 0) { //positive error means we have to subtract values
      resultArray.sort(function (a, b) { //sort by error asc (most positive first)
        return b[1] - a[1];
      });
      for (let i = 0; i < totalError; i++) {
        resultArray[i][0] -= 1;
      }
    }
    resultArray.sort(function (a, b) { //sort back to original order (original index desc)
      return a[2] - b[2];
    });

    //extract the first column with the adjusted rounded values
    let returnArray = [];
    for (let row of resultArray) {
      returnArray.push(row[0]);
    }

    return returnArray;
  }

  /**
   * Set of fiat currency tickers used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get fiatTickers() {

    let fiatTickers = new Set();
    for (let wallet of this.wallets) {
      let walletFiatAccounts = Array.from(wallet.fiatAccounts.values());
      for (let fiatAccount of walletFiatAccounts) {
        fiatTickers.add(fiatAccount.ticker);
      }
    }
    return fiatTickers;
  }

  /**
   * Set of asset tickers used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get assetTickers() {

    let assetTickers = new Set();
    for (let wallet of this.wallets) {
      let walletAssetAccounts = Array.from(wallet.assetAccounts.values());
      for (let assetAccount of walletAssetAccounts) {
        assetTickers.add(assetAccount.ticker);
      }
    }
    return assetTickers;
  }

  /**
   * Set of asset tickers with positive balances used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get currentAssetTickers() {

    let assetTickers = new Set();
    for (let wallet of this.wallets) {
      let walletAssetAccounts = Array.from(wallet.assetAccounts.values());
      for (let assetAccount of walletAssetAccounts) {
        if (assetAccount.balance > 0) {
          assetTickers.add(assetAccount.ticker);
        }
      }
    }
    return assetTickers;
  }

  /**
   * Returns the wallet with the given name or creates adds and returns a new wallet with that name.
   * @param {string} name - The name of the wallet to search for.
   * @return {Wallet} The wallet found or created.
   */
  getWallet(name) {

    for (let wallet of this.wallets) {
      if (wallet.name === name) {
        return wallet;
      }
    }

    let wallet = new Wallet(name);
    this.wallets.push(wallet);
    return wallet;

  }

  /**
    * Returns the asset pool with the given asset or creates adds and returns a new asset pool with that asset.
    * @param {Asset} asset - The asset of the asset pool to search for.
    * @return {AssetPool} The asset pool found or created.
    */
  getAssetPool(asset) {

    for (let assetPool of this.assetPools) {

      if (assetPool.asset === asset) {

        return assetPool;
      }
    }

    let assetPool = new AssetPool(asset);

    this.assetPools.push(assetPool);

    return assetPool;
  }

  /**
   * Wraps the lots that have been sold or exchanged in a ClosedLot objects and adds it to the closedLots collection.
   * The credited amount and fees are assigned to the closed lots in proportion to the size of the lots.
   * @param {lots} lots - The lots that have been sold or exchanged.
   * @param {Date} date - The date of the sale or exchange.
   * @param {string} creditCurrency - The ticker of the fiat or cryptocurrency credited for the lots sold or exchanged.
   * @param {number} creditExRate - The exchange rate of the currency of the lots to the accounting currency at the time of the sale or exchange.
   * @param {number} creditAmount - The amount of the fiat or cryptocurrency credited for the lots sold or exchanged.
   * @param {number} creditFee - The fee in the credited currency for transaction.
   * @param {string} creditWalletName - The name of the wallet (or exchange) where transaction takes place.
   */
  closeLots(lots, date, creditCurrency, creditExRate, creditAmount, creditFee, creditWalletName) {

    let creditAmountSubunits = Math.round(creditAmount * creditCurrency.subunits);
    let creditFeeSubunits = Math.round(creditFee * creditCurrency.subunits);

    //apportion the fee to withdrawal lots
    let lotSubunits = [];
    for (let lot of lots) {
      lotSubunits.push(lot.subunits);
    }
    let apportionedCreditAmountSubunits = AssetTracker.apportionInteger(creditAmountSubunits, lotSubunits);
    let apportionedCreditFeeSubunits = AssetTracker.apportionInteger(creditFeeSubunits, lotSubunits);
    let index = 0;
    for (let lot of lots) {

      let closedLot = new ClosedLot(lot,
        date,
        creditCurrency,
        creditExRate,
        (apportionedCreditAmountSubunits[index] / creditCurrency.subunits),
        (apportionedCreditFeeSubunits[index++] / creditCurrency.subunits),
        creditWalletName);

      this.closedLots.push(closedLot);
    }
  }

  /**
   * Creates a sample assets sheet.
   * Renames any existing assets sheet so as not to overwrite it.
   * Creates a sample ledger sheet.
   * Renames any existing ledger sheet so as not to overwrite it.
   * Validates and processes the asset sheet.
   * Creates the api price sheets if they don't already exist.
   * Updates the prices in the api price sheets if necessary.
   */
  createSampleSheets() {

    this.assetsSheet();
    this.ledgerSheet();

  }

  /**
   * Saves a set of key value pairs as user properties.
   * Validates apiKeys setting if attempting to change the existing value.
   * Sends message to the error handler if the api key validation fails.
   * Displays toast on success.
   * @param {Object.<string, string>} settings - The key value pairs to save as user properties .
   */
  saveSettings(settings) {

    let userProperties = PropertiesService.getUserProperties();

    if (settings.ccApiKey && settings.ccApiKey !== userProperties.ccApiKey) {

      let apiKeyValid = this.validateApiKey('CryptoCompare', settings.ccApiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid CryptoCompare key');
        return;
      }
    }

    if (settings.cmcApiKey && settings.cmcApiKey !== userProperties.cmcApiKey) {

      let apiKeyValid = this.validateApiKey('CoinMarketCap', settings.cmcApiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid CoinMarketCap key');
        return;
      }
    }

    userProperties.setProperties(settings);
    SpreadsheetApp.getActive().toast('Settings saved');
  }
};