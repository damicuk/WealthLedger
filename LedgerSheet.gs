/**
 * Creates a sample ledger sheet.
 * Renames any existing ledger sheet so as not to overwrite it.
 */
AssetTracker.prototype.sampleLedger = function () {

  const sheetName = this.ledgerSheetName;

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let headers = [
    [
      , ,
      'Debit', , , , ,
      'Credit', , , , , , ,
    ],
    [
      'Date Time',
      'Action',
      'Asset',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Asset',
      'Ex Rate',
      'Amount',
      'Fee',
      'Wallet',
      'Lot Matching',
      'Comment'
    ]
  ];

  sheet.getRange('A1:N2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);

  sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
  sheet.getRange('C1:G2').setBackgroundColor('#ead1dc');
  sheet.getRange('H1:L2').setBackgroundColor('#d0e0e3');
  sheet.getRange('M1:N2').setBackgroundColor('#c9daf8');

  sheet.getRange('A1:B1').mergeAcross();
  sheet.getRange('C1:G1').mergeAcross();
  sheet.getRange('H1:L1').mergeAcross();
  sheet.getRange('M1:N1').mergeAcross();

  sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('B3:C').setNumberFormat('@');
  sheet.getRange('D3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('G3:H').setNumberFormat('@');
  sheet.getRange('I3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('L3:N').setNumberFormat('@');

  this.setLedgerConditionalFormatRules(sheet);

  let actions = ['Donation', 'Fee', 'Gift', 'Income', 'Split', 'Stop', 'Trade', 'Transfer'];
  this.setValidation(sheet, 'B3:B', actions, false);

  let assets = ['USD', 'ADA', 'BTC'];

  this.setAssetValidation(sheet, 'C3:C', assets);
  this.setAssetValidation(sheet, 'H3:H', assets);

  let wallets = ['Binance', 'Deposit', 'Kraken', 'Ledger', 'Rewards', 'Yoroi'];

  this.setWalletValidation(sheet, 'G3:G', wallets);
  this.setWalletValidation(sheet, 'L3:L', wallets);

  let lotMatchings = ['FIFO', 'LIFO', 'HIFO', 'LOFO'];
  this.setValidation(sheet, 'M3:M', lotMatchings, false);

  if (!sheet.getFilter()) {
    sheet.getRange('A2:N').createFilter();
  }

  let sampleData = [
    ['2019-03-01 12:00:00', 'Transfer', 'USD', , 20000, , , , , , , 'Kraken', , `Leave debit wallet blank when transferring fiat from a bank account.`],
    ['2019-03-02 12:00:00', 'Trade', 'USD', , 7990, 10, 'Kraken', 'BTC', , 2, , , , `Debit amount is debited and credit amount is credited but fees are always debited.`],
    ['2019-03-03 12:00:00', 'Trade', 'USD', , 9990, 10, 'Kraken', 'BTC', , 2, , , , ,],
    ['2019-03-04 12:00:00', 'Trade', 'BTC', , 1, , 'Kraken', 'USD', , 6010, 10, , , ,],
    ['2020-12-01 12:00:00', 'Trade', 'BTC', , 1, , 'Kraken', 'USD', , 20010, 10, , 'LIFO', `Lot matching method applies to the current and following transactions (default in settings).`],
    ['2020-12-02 12:00:00', 'Trade', 'BTC', 20000, 1, , 'Kraken', 'ADA', 0.2, 100000, , , , `Exchange cryptos.`],
    ['2020-12-03 12:00:00', 'Trade', 'ADA', , 50000, , 'Kraken', 'USD', , 12010, 10, , , ,],
    ['2020-12-04 12:00:00', 'Transfer', 'ADA', , 49999.4, 0.6, 'Kraken', , , , , 'Yoroi', , `Transfer amount and fee are always and only entered in the debit column.`],
    ['2020-12-05 12:00:00', 'Transfer', 'BTC', , 0.9995, 0.0005, 'Kraken', , , , , 'Ledger', , ,],
    ['2020-12-06 12:00:00', 'Transfer', 'USD', , 30000, , 'Kraken', , , , , , , `Leave credit wallet blank when transferring fiat to a bank account.`],
    ['2021-02-01 12:00:00', 'Income', , , , , , 'ADA', 1, 10, , 'Rewards', , `Staking reward.`],
    ['2021-02-05 12:00:00', 'Income', , , , , , 'ADA', 1.3, 10, , 'Rewards', , ,],
    ['2021-03-01 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Yoroi', , , , , , , `Donations (e.g. to registered charities) are recorded in the donations report.`],
    ['2021-03-02 12:00:00', 'Donation', 'ADA', 1.1, 500, , 'Yoroi', , , , , , , ,],
    ['2021-03-03 12:00:00', 'Gift', 'ADA', , 500, , 'Yoroi', , , , , , , `Gifts (e.g. to friends or family) are not recorded. The asset simply disappears.`],
    ['2021-03-04 12:00:00', 'Fee', 'ADA', , , 0.17, 'Yoroi', , , , , , , `Miscellaneous fee.`]
  ];

  sheet.getRange('A3:N18').setValues(sampleData);

  this.trimSheet(sheet, 19, 14);

  sheet.autoResizeColumns(1, 1);
  sheet.autoResizeColumns(5, 1);
  sheet.autoResizeColumns(10, 1);
  sheet.autoResizeColumns(14, 1);

  return sheet;
};

/**
 * Checks the version of the ledger sheet.
 * Sets conditional text color formatting of the action column of the ledger sheet if the version is not current.
 * Sets data validation on the action column of the ledger sheet if the version is not current.
 * Sets data validation on the asset columns in the ledger sheet.
 * Sets data validation on the wallets columns in the ledger sheet.
 */
AssetTracker.prototype.updateLedger = function () {

  const sheetName = this.ledgerSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  if (this.getSheetVersion(sheet) !== this.ledgerSheetVersion) {

    //Future updates to the ledger can be inserted here

    this.setSheetVersion(sheet, this.ledgerSheetVersion);
  }

  this.updateLedgerAssets(sheet);
  this.updateLedgerWallets(sheet);
};

/**
 * Sets conditional text color formatting of the action column of the ledger sheet.
 * @param {Sheet} sheet - The ledger sheet.
 */
AssetTracker.prototype.setLedgerConditionalFormatRules = function (sheet) {

  sheet.clearConditionalFormatRules();

  let textColors = [
    ['Donation', '#ff9900', null],
    ['Fee', '#9900ff', null],
    ['Gift', '#ff9900', null],
    ['Income', '#6aa84f', null],
    ['Split', '#ff00ff', null],
    ['Stop', '#ff0000', '#ffbb00'],
    ['Trade', '#1155cc', null],
    ['Transfer', '#ff0000', null],
  ];

  let range = sheet.getRange('B3:B');
  let rules = sheet.getConditionalFormatRules();

  for (let textColor of textColors) {

    let rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(textColor[0])
      .setFontColor(textColor[1])
      .setBackground(textColor[2])
      .setRanges([range])
      .build();

    rules.push(rule);
  }

  sheet.setConditionalFormatRules(rules);
};

/**
 * Sets data validation on the asset columns of the ledger sheet.
 * The list of fiat and asset tickers is collected when the ledger is processed to write the reports.
 * Both fiats and assets are sorted alphabetically.
 * The fiats are listed before the assets.
 * @param {Sheet} sheet - The ledger sheet.
 */
AssetTracker.prototype.updateLedgerAssets = function (sheet) {

  let fiatTickers = Array.from(this.fiatTickers).sort(AssetTracker.abcComparator);
  let assetTickers = Array.from(this.assetTickers).sort(AssetTracker.abcComparator);
  let tickers = fiatTickers.concat(assetTickers);

  this.setAssetValidation(sheet, 'C3:C', tickers);
  this.setAssetValidation(sheet, 'H3:H', tickers);

};

/**
 * Sets data validation on the wallets columns of the ledger sheet.
 * The list of wallet names is collected when the ledger is processed to write the reports.
 * The wallet names are sorted alphabetically.
 * @param {Sheet} sheet - The ledger sheet.
 */
AssetTracker.prototype.updateLedgerWallets = function (sheet) {

  let walletNames = [];
  for (let wallet of this.wallets) {
    walletNames.push(wallet.name);
  }
  walletNames.sort(AssetTracker.abcComparator);

  this.setWalletValidation(sheet, 'G3:G', walletNames);
  this.setWalletValidation(sheet, 'L3:L', walletNames);

};

/**
 * Sets data validation from a list on a range of cells in a sheet.
 * Sets the help text that appears when the user hovers over a cell on which data validation is set.
 * Used specifically to set the data validation on the currency columns in the ledger sheet.
 * @param {Sheet} sheet - The sheet containing the range of cells on which data validation is set.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells on which data validation is set.
 * @param {Array<string>} values - The list of valid values
 */
AssetTracker.prototype.setAssetValidation = function (sheet, a1Notation, values) {

  this.setValidation(sheet, a1Notation, values, true, 'New assets will be added to the data validation dropdown when write reports is run.');

};

/**
 * Sets data validation from a list on a range of cells in a sheet.
 * Sets the help text that appears when the user hovers over a cell on which data validation is set.
 * Used specifically to set the data validation on the wallet columns in the ledger sheet.
 * @param {Sheet} sheet - The sheet containing the range of cells on which data validation is set.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells on which data validation is set.
 * @param {Array<string>} values - The list of valid values
 */
AssetTracker.prototype.setWalletValidation = function (sheet, a1Notation, values) {

  this.setValidation(sheet, a1Notation, values, true, 'New wallets will be added to the data validation dropdown when write reports is run.');

};

/**
 * Returns the range in the ledger sheet that contains the data excluding header rows.
 * If there is no ledger sheet it creates a sample ledger and returns the range from that.
 * Throws a ValidationError if the ledger sheet contains insufficient columns or no data rows
 * @return {Range} The range in the ledger sheet that contains the data excluding header rows.
 */
AssetTracker.prototype.getLedgerRange = function () {

  let ss = SpreadsheetApp.getActive();
  let ledgerSheet = ss.getSheetByName(this.ledgerSheetName);

  if (!ledgerSheet) {

    ledgerSheet = this.sampleLedger();
  }

  if (ledgerSheet.getMaxColumns() < this.ledgerDataColumns) {
    throw new ValidationError('Ledger has insufficient columns.');
  }

  let ledgerRange = ledgerSheet.getDataRange();

  if (ledgerRange.getHeight() < this.ledgerHeaderRows + 1) {
    throw new ValidationError('Ledger contains no data rows.');
  }

  ledgerRange = ledgerRange.offset(this.ledgerHeaderRows, 0, ledgerRange.getHeight() - this.ledgerHeaderRows, this.ledgerDataColumns);

  return ledgerRange;
};