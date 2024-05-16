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
     * Collection of inflation records.
     * @type {Array<Obeject>}
     */
    this.inflationRecords = [];

    /**
     * Collection of ClosedLots.
     * @type {Array<ClosedLot>}
     */
    this.closedLots = [];

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
    this.assetsDataColumns = 6;

    this.ledgerSheetName = 'Ledger';
    this.ledgerSheetVersion = '1';
    this.assetsSheetName = 'Assets';
    this.assetsSheetVersion = '3';

    this.cmcApiName = 'CoinMarketCap';

    this.validApiNames = [this.cmcApiName, this.ccApiName,];

    this.inflationSheetName = 'Inflation Data';
    this.fiatAccountsSheetName = 'Fiat Accounts Data';
    this.openReportName = 'Open Report';
    this.closedReportName = 'Closed Report';
    this.incomeReportName = 'Income Report';
    this.chartsDataSheetName = 'Charts Data';
    this.openSummaryReportName = 'Open Summary Report';
    this.closedSummaryReportName = 'Closed Summary Report';
    this.incomeSummaryReportName = 'Income Summary Report';
    this.donationsSummaryReportName = 'Donations Summary Report';
    this.walletsReportName = 'Wallets Report';
    this.investmentDataSheetName = 'Investment Data';
    this.investmentReportName = 'Investment Report';

    this.reportNames = [
      this.inflationSheetName,
      this.fiatAccountsSheetName,
      this.openReportName,
      this.closedReportName,
      this.incomeReportName,
      this.chartsDataSheetName,
      this.openSummaryReportName,
      this.closedSummaryReportName,
      this.incomeSummaryReportName,
      this.donationsSummaryReportName,
      this.walletsReportName,
      this.investmentDataSheetName,
      this.investmentReportName
    ];

    this.inflationRangeName = 'Inflation';
    this.fiatAccountsRangeName = 'FiatAccounts';

    this.assetsRangeName = 'Assets';
    this.openRangeName = 'Open';
    this.closedRangeName = 'Closed';
    this.incomeRangeName = 'Income';

    this.chartRange1Name = 'Chart1';
    this.chartRange2Name = 'Chart2';
    this.chartRange3Name = 'Chart3';
    this.chartRange4Name = 'Chart4';

    this.investmentRange1Name = 'InvestmentRange1';
    
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

      wallet = new Wallet(name, this);
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

      assetPool = new AssetPool(asset, this);
      this.assetPools.set(asset.ticker, assetPool);
    }

    return assetPool;
  }

  /**
   * Creates a sample assets sheet.
   * Shows a warning dialog if the spreadsheet locale is not English.
   * Renames any existing assets sheet so as not to overwrite it.
   * Creates a sample ledger sheet.
   * Renames any existing ledger sheet so as not to overwrite it.
   * Validates and processes the asset sheet.
   * Creates the api price sheets if they don't already exist.
   * Updates the prices in the api price sheets if necessary.
   */
  createSampleSheets() {

    if (!this.checkLocale()) {
      return;
    }

    this.assetsSheet();
    this.ledgerSheet();

    SpreadsheetApp.getActive().toast('Sample sheets complete', 'Finished', 10);
  }

  /**
   * Deletes all the output sheets.
   * Displays toast on completion.
   */
  deleteReports() {

    this.deleteSheets(this.reportNames);

    SpreadsheetApp.getActive().toast('Reports deleted', 'Finished', 10);
  }

  /**
   * Displays the settings dialog
   */
  showSettingsDialog() {

    let html = HtmlService.createTemplateFromFile('SettingsDialog').evaluate()
      .setWidth(480)
      .setHeight(100);
    SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
  }

  /**
   * Saves a set of key value pairs as user properties.
   * Saves a set of key value pairs as document properties.
   * Validates apiKeys setting if attempting to change the existing value.
   * Sends message to the error handler if the api key validation fails.
   * Displays toast on success.
   * @param {Object.<string, string>} userSettings - The key value pairs to save as user properties.
   */
  saveSettings(userSettings) {

    let userProperties = PropertiesService.getUserProperties();

    if (userSettings.cmcApiKey && userSettings.cmcApiKey !== userProperties.cmcApiKey) {

      let apiKeyValid = this.validateApiKey(userSettings.cmcApiKey);

      if (!apiKeyValid) {

        this.handleError('settings', 'Invalid CoinMarketCap key');
        return;
      }
    }

    userProperties.setProperties(userSettings);

    SpreadsheetApp.getActive().toast('Settings saved');
  }

  /**
   * Shows a warning dialog if the spreadsheet locale is not English.
   * Sets the spreadsheet locale to United States if the user confirms.
   * @return {boolean} Whether the original spreadsheet local was English.
   */
  checkLocale() {

    let ss = SpreadsheetApp.getActive();
    let locale = ss.getSpreadsheetLocale();

    if (locale.slice(0, 3) !== 'en_') {

      let ui = SpreadsheetApp.getUi();
      let message = `To perform the requested action the spreadsheet locale must be English.\nE.g. Australia, Canada, United Kingdom, United States.\n\nYou can change the spreadsheet locale in the spreadsheet menu (File - Setting).\nRun the command again with an English spreadsheet locale.\n\nDo you want to change the spreadsheet locale to United States?`;
      let result = ui.alert(`Warning`, message, ui.ButtonSet.YES_NO);

      if (result === ui.Button.YES) {
        ss.setSpreadsheetLocale('en_US');
        //Toast fails
        SpreadsheetApp.getActive().toast('Spreadsheet locale set to United States');
      }
      else {
        SpreadsheetApp.getActive().toast('Action canceled');
      }
      return false;
    }
    return true;
  }
};