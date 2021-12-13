/**
 * The main class that processes the Ledger sheet fetches the current crypto prices and writes the reports.
 */
var AssetTracker = class AssetTracker {

  /**
   * Initializes class with empty arrays of wallets, income, closed, and donated lots, user properties, and input and output sheet names.
   */
  constructor() {

    /**
     * The fiat base asset.
     * * @type {Asset}
     */
    this.fiatBase = null;

    /**
     * Map of asset ticker to assets.
     * @type {Map}
     */
    this.assets = new Map();

    /**
     * Map of asset ticker to asset pools.
     * @type {Map}
     */
    this.assetPools = new Map();

    /**
     * Map of wallet names to wallets.
     * @type {Map}
     */
    this.wallets = new Map();

    /**
     * The set of asset types defined by the user (not the default asset types).
     * @type {Set}
     */
    this.userDefinedAssetTypes = new Set();

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
     * The number of decimal places to round exrate calculation.
     * @type {number}
     */
    this.exRateDecimalPlaces = 8;

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
    this.assetsDataColumns = 7;

    this.ledgerSheetName = 'Ledger';
    this.ledgerSheetVersion = '1';
    this.assetsSheetName = 'Assets';
    this.assetsSheetVersion = '1';

    this.cmcApiName = 'CoinMarketCap';
    this.ccApiName = 'CryptoCompare';

    this.validApiNames = [this.cmcApiName, this.ccApiName,];

    this.fiatAccountsSheetName = 'Fiat Accounts Data';
    this.fiatAccountsRangeName = 'FiatAccounts';

    this.openPositionsReportName = 'Open Positions Report';
    this.closedPositionsReportName = 'Closed Positions Report';
    this.donationsReportName = 'Donations Report';
    this.incomeReportName = 'Income Report';
    this.chartsDataSheetName = "Charts Data";
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
      this.chartsDataSheetName,
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

    this.chartRange1Name = 'Chart1';
    this.chartRange2Name = 'Chart2';
    this.chartRange3Name = 'Chart3';
    this.chartRange4Name = 'Chart4';
    this.chartRange5Name = 'Chart5';

    this.ukOpenPositionsReportName = 'UK Open Positions Report';
    this.ukAssetAccountsReportName = 'UK Asset Accounts Report';
    this.ukClosedPositionsReportName = 'UK Closed Positions Report';
    this.ukIncomeReportName = 'UK Income Report';
    this.ukChartsDataSheetName = "UK Charts Data";
    this.ukOpenSummaryReportName = "UK Open Summary Report";
    this.ukClosedSummaryReportName = "UK Closed Summary Report";
    this.ukIncomeSummaryReportName = 'UK Income Summary Report';
    this.ukDonationsSummaryReportName = 'UK Donations Summary Report';
    this.ukWalletsReportName = 'UK Wallets Report';

    this.ukReportNames = [
      this.ukOpenPositionsReportName,
      this.ukAssetAccountsReportName,
      this.ukClosedPositionsReportName,
      this.ukIncomeReportName,
      this.ukChartsDataSheetName,
      this.ukOpenSummaryReportName,
      this.ukClosedSummaryReportName,
      this.ukIncomeSummaryReportName,
      this.ukDonationsSummaryReportName,
      this.ukWalletsReportName
    ];

    this.ukOpenPositionsRangeName = 'UKOpenPositions';
    this.ukAssetAccountsRangeName = 'UKAssetAccounts';
    this.ukClosedPositionsRangeName = 'UKClosedPositions';

    this.ukChartRange1Name = 'UKChart1';
    this.ukChartRange2Name = 'UKChart2';
    this.ukChartRange3Name = 'UKChart3';
    this.ukChartRange4Name = 'UKChart4';
    this.ukChartRange5Name = 'UKChart5';
  }

  /**
   * Array of supported accounting models.
   * @type {string[]}
   * @static
   */
  static get accountingModels() {

    return ['US', 'UK'];
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
   * Subtracts the amount of milliseconds to get back to the time 00:00 (midnight) on the same day in that time zone.
   * @param {Date} date - The given date.
   * @param {string} [timeZone] - The tz database time zone.
   * @return {Date} The date at midnight on the day of the given date.
   * @static
   */
  static getMidnight(date, timeZone) {

    let dateTZ = new Date(date.toLocaleString('en-US', { timeZone: timeZone }));

    let dateTime = date.getTime();
    dateTime -= dateTZ.getHours() * 3600000;
    dateTime -= dateTZ.getMinutes() * 60000;
    dateTime -= dateTZ.getMilliseconds();

    return new Date(dateTime);
  };

  /**
  * Gets the difference in days between two dates.
  * @param {Date} date1 - The first date.
  * @param {Date} date2 - The second date.
  * @param {string} [timeZone] - The tz database time zone.
  * @return {Date} The difference in days between the two dates.
  * @static
 */
  static diffDays(date1, date2, timeZone) {

    date1 = AssetTracker.convertTZDateOnly(date1, timeZone);
    date2 = AssetTracker.convertTZDateOnly(date2, timeZone);

    const oneDay = 24 * 60 * 60 * 1000;

    const diffDays = AssetTracker.round((date2 - date1) / oneDay);

    return diffDays;
  }

  /**
   * Gets the date in the a particular time zone given a date.
   * @param {Date} date - The given date.
   * @param {string} timeZone - The tz database time zone.
   * @return {Date} The date in the given time zone.
   * @static
  */
  static convertTZDateOnly(date, timeZone) {
    return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleDateString('en-US', { timeZone: timeZone }));
  }

  /**
   * Apportions an integer amount to an array or integers as equitably as possible.
   * e.g. used to apportion fees amoungst lots of an asset in proportion to the size of the lots.
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
      let rounded = AssetTracker.round(float);
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
   * Rounds a number correctly.
   * Javascript's Math.round() function rounds negative numbers the wrong way.
   * @param {number} num - The number to round.
   * @return {number} The rounded number.
   * @static
   */
  static round(num) {
    return Math.sign(num) * Math.round(Math.abs(num));
  }

  /**
   * The API key used to connect to CryptoCompare to retrieve crypto prices.
   * @type {string}
   */
  get ccApiKey() {

    let userProperties = PropertiesService.getUserProperties();
    return userProperties.getProperty('ccApiKey');
  }

  /**
   * The API key used to connect to CoinMarketCap to retrieve crypto prices.
   * @type {string}
   */
  get cmcApiKey() {

    let userProperties = PropertiesService.getUserProperties();
    return userProperties.getProperty('cmcApiKey');
  }

  /**
   * Gets the accounting model from document properties or sets and returns a default.
   * @return {string} The accounting model.
   */

  /**
   * The accounting model used to determine how to process transactions.
   * @type {string}
   */
  get accountingModel() {

    let documentProperties = PropertiesService.getDocumentProperties();

    let accountingModel = documentProperties.getProperty('accountingModel');

    if (!accountingModel) {

      accountingModel = this.defaultAccountingModel;

      documentProperties.setProperty('accountingModel', accountingModel);
    }
    return accountingModel;
  }

  /**
   * The default accounting model.
   * It's value depends on the spreadsheet locale.
   * @return {string} The accounting model.
   */
  get defaultAccountingModel() {

    let ss = SpreadsheetApp.getActive();
    let locale = ss.getSpreadsheetLocale();

    if (locale === 'en_GB') {
      return 'UK';
    }
    else {
      return 'US';
    }
  }

  /**
   * Set of fiat tickers used by this instance.
   * Only filled once processLedger has completed.
   * @type {Set}
   */
  get fiatTickers() {

    let fiatTickers = new Set();
    for (let wallet of this.wallets.values()) {
      for (let fiatAccount of wallet.fiatAccounts.values()) {
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
    for (let wallet of this.wallets.values()) {
      for (let assetAccount of wallet.assetAccounts.values()) {
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
    for (let wallet of this.wallets.values()) {
      for (let assetAccount of wallet.assetAccounts.values()) {
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

    let wallet = this.wallets.get(name);

    if (!wallet) {

      wallet = new Wallet(name);
      this.wallets.set(name, wallet);
    }

    return wallet;

  }

  /**
    * Returns the asset pool with the given asset or creates adds and returns a new asset pool with that asset.
    * @param {Asset} asset - The asset of the asset pool to search for.
    * @return {AssetPool} The asset pool found or created.
    */
  getAssetPool(asset) {

    let assetPool = this.assetPools.get(asset.ticker);

    if (!assetPool) {

      assetPool = new AssetPool(asset);
      this.assetPools.set(asset.ticker, assetPool);
    }

    return assetPool;
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
   * Displays the settings dialog
   */
  showSettingsDialog() {

    this.accountingModel; //Sets the default if necessary

    let html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
      .setWidth(480)
      .setHeight(250);
    SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
  }

  /**
   * Saves a set of key value pairs as user properties.
   * Saves a set of key value pairs as document properties.
   * Validates apiKeys setting if attempting to change the existing value.
   * Sends message to the error handler if the api key validation fails.
   * Displays toast on success.
   * @param {Object.<string, string>} userSettings - The key value pairs to save as user properties.
   * @param {Object.<string, string>} documentSettings - The key value pairs to save as document properties.
   */
  saveSettings(userSettings, documentSettings) {

    let userProperties = PropertiesService.getUserProperties();

    if (userSettings.ccApiKey && userSettings.ccApiKey !== userProperties.ccApiKey) {

      let apiKeyValid = this.validateApiKey('CryptoCompare', userSettings.ccApiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid CryptoCompare key');
        return;
      }
    }

    if (userSettings.cmcApiKey && userSettings.cmcApiKey !== userProperties.cmcApiKey) {

      let apiKeyValid = this.validateApiKey('CoinMarketCap', userSettings.cmcApiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid CoinMarketCap key');
        return;
      }
    }

    let documentProperties = PropertiesService.getDocumentProperties();

    userProperties.setProperties(userSettings);
    documentProperties.setProperties(documentSettings);
    SpreadsheetApp.getActive().toast('Settings saved');
  }
};