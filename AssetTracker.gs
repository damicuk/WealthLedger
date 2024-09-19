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
    this.ledgerDataColumns = 14;

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

    this.ledgerVersion = '4';
    this.reportsVersion = '6';
    this.ledgerSheetName = 'Ledger';
    this.assetsSheetName = 'Assets';

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
   * The sample data for the assets sheet
   * @type {Array<Array>}
   * @static
   */
  static get assetsSampleData() {

    return [
      ['USD', 'Fiat Base', '2', '1', , , `Every asset in the ledger sheet must have an entry in the assets sheet.`],
      ['CAD', 'Fiat', '2', `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A3), "USD"))`, , , `Fiat capital gains are ignored.`],
      ['EUR', 'Forex', '2', `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A4), "USD"))`, , , `Forex is treated as any other asset.`],
      ['ADA', 'Crypto', '6', `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A5), "USD"))`, , , `Use Google Finance to fetch the current price. Alternatively enter a CoinMarketCap ID or use your own method.`],
      ['BTC', 'Crypto', '8', `=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A6), "USD"))`, , , ,],
      ['USDC', 'Stablecoin', '2', '1', , , ,],
      ['AAPL', 'Stock', '0', `=GOOGLEFINANCE(A8)`, , , ,],
      ['AMZN', 'Stock', '0', `=GOOGLEFINANCE(A9)`, , , ,],
      ['GE', 'Stock', '0', , , , `Current price is not needed for assets no longer held.`]
    ];
  }

  /**
   * The sample data for the ledger sheet
   * @type {Array<Array>}
   * @static
   */
  static get ledgerSampleData() {

    return [
      ['2019-03-01 00:00:00', 'Inflation', , , , , , , , 254.202, , , , ,],
      ['2019-03-01 12:00:00', 'Transfer', , , , , , 'USD', , 20000, , 'Kraken', , `Leave debit wallet blank when transferring fiat from a bank account.`],
      ['2019-03-02 12:00:00', 'Trade', 'USD', , 7990, 10, 'Kraken', 'BTC', , 2, , , , `Debit amount is debited and credit amount is credited but fees are always debited.`],
      ['2019-03-03 12:00:00', 'Trade', 'USD', , 9990, 10, 'Kraken', 'BTC', , 2, , , , ,],
      ['2019-03-03 13:00:00', 'Trade', 'BTC', , 1, , 'Kraken', 'USD', , 6010, 10, , , ,],
      ['2020-12-01 00:00:00', 'Inflation', , , , , , , , 260.474, , , , `Specify inflation index not percentage. Only affects investment report. Time is ignored.`],
      ['2020-12-01 12:00:00', 'Trade', 'BTC', , 1, , 'Kraken', 'USD', , 20010, 10, , , ,],
      ['2020-12-02 12:00:00', 'Trade', 'BTC', 20000, 1, , 'Kraken', 'ADA', , 100000, , , , `Exchange assets.`],
      ['2020-12-03 12:00:00', 'Trade', 'ADA', , 50000, , 'Kraken', 'USD', , 12010, 10, , , ,],
      ['2020-12-04 12:00:00', 'Transfer', 'ADA', , 49999.4, 0.6, 'Kraken', , , , , 'Ledger', , `Transfer from one wallet to another.`],
      ['2020-12-05 12:00:00', 'Transfer', 'BTC', , 0.9995, 0.0005, 'Kraken', , , , , 'Ledger', , ,],
      ['2020-12-06 12:00:00', 'Transfer', 'USD', , 30000, , 'Kraken', , , , , , , `Leave credit wallet blank when transferring fiat to a bank account.`],
      ['2021-02-01 00:00:00', 'Inflation', , , , , , , , 263.014, , , , ,],
      ['2021-02-01 12:00:00', 'Income', , , , , , 'ADA', 1, 10, , 'Rewards', , `Staking reward.`],
      ['2021-02-05 12:00:00', 'Income', , , , , , 'ADA', 1.3, 10, , 'Rewards', , ,],
      ['2021-03-01 00:00:00', 'Inflation', , , , , , , , 264.877, , , , ,],
      ['2021-03-01 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Ledger', , , , , , , `Donation (e.g. to a registered charity).`],
      ['2021-03-02 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Ledger', , , , , , , `To track donations unhide the donations summary report.`],
      ['2021-03-03 12:00:00', 'Gift', 'ADA', 1.1, 500, , 'Ledger', , , , , , , `Gift given (e.g. to friends or family).`],
      ['2021-03-04 12:00:00', 'Gift', 'USD', , 40000, 10, , 'BTC', , '1', , 'Ledger', , `Gift received. The debit amount and fee are the inherited cost basis.`],
      ['2021-03-05 12:00:00', 'Fee', 'ADA', , , 0.17, 'Ledger', , , , , , , `Miscellaneous fee.`],
      ['2021-04-01 00:00:00', 'Inflation', , , , , , , , 267.054, , , , ,],
      ['2021-04-01 12:00:00', 'Transfer', , , , , , 'USD', , 30000, , 'IB', , ,],
      ['2021-04-01 12:00:00', 'Trade', 'USD', , 9990, 10, 'IB', 'AAPL', , 80, , , , ,],
      ['2021-04-01 12:00:00', 'Trade', 'USD', , 9990, 10, 'IB', 'AMZN', , 3, , , , ,],
      ['2021-04-01 12:00:00', 'Trade', 'USD', , 9990, 10, 'IB', 'GE', , 760, , , , ,],
      ['2021-08-01 00:00:00', 'Inflation', , , , , , , , 273.567, , , , ,],
      ['2021-08-02 00:00:00', 'Adjust', 'GE', , 665, , , , , , , , , `The amount held is decreased by the debit amount (reverse split).`],
      ['2021-08-03 12:00:00', 'Trade', 'GE', , 95, , 'IB', 'USD', , 9010, 10, , , ,],
      ['2021-08-31 12:00:00', 'Income', 'AAPL', , , , , 'USD', , 18.40, , 'IB', , `Dividend. The debit asset is the source of the dividend.`],
      ['2021-08-31 12:00:00', 'Income', , , , , , 'USD', , 20, , 'IB', , `Fiat interest.`],
      ['2022-06-01 00:00:00', 'Inflation', , , , , , , , 296.311, , , , ,],
      ['2022-06-06 00:00:00', 'Adjust', , , , , , 'AMZN', , 57, , , , `The amount held is increased by the credit amount (forward split).`]
    ];
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
   * Creates sample assets and ledger sheets
   * Shows a warning dialog if the spreadsheet locale is not English.
   * Renames any existing assets sheet so as not to overwrite it.
   * Creates a sample assets sheet.
   * Renames any existing ledger sheet so as not to overwrite it.
   * Creates a sample ledger sheet.
   */
  createSampleSheets() {

    if (!this.checkLocale()) {
      return;
    }

    this.assetsSheet(AssetTracker.assetsSampleData);
    this.ledgerSheet(AssetTracker.ledgerSampleData);

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

  /**
   * Checks the version of the assets and ledger sheets are both current.
   * @return {boolean} Whether the version of the assets and ledger sheets are both current.
   */
  ledgerVersionCurrent() {

    let ss = SpreadsheetApp.getActive();
    let assetsSheet = ss.getSheetByName(this.assetsSheetName);
    let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

    if (assetsSheet && this.getSheetVersion(assetsSheet) === this.ledgerVersion && ledgerSheet && this.getSheetVersion(ledgerSheet) === this.ledgerVersion) {

      return true;
    }
    else {

      return false;
    }
  }

  /**
   * Checks the version of all the reports sheets are current.
   * @return {boolean} Whether the version of all the reports sheets are current.
   */
  reportsVersionCurrent() {

    let ss = SpreadsheetApp.getActive();

    for (let reportName of this.reportNames) {

      let reportSheet = ss.getSheetByName(reportName);

      if (!reportSheet || this.getSheetVersion(reportSheet) !== this.reportsVersion) {

        return false;
      }
    }

    return true;
  }

  /**
   * Checks whether there are no reports sheets.
   * @return {boolean} Whether there are no reports sheets.
   */
  noReports() {

    let ss = SpreadsheetApp.getActive();

    for (let reportName of this.reportNames) {

      let reportSheet = ss.getSheetByName(reportName);

      if (reportSheet) {

        return false;
      }
    }

    return true;
  }
};