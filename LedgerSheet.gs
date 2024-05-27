/**
 * Creates a sample ledger sheet.
 * Renames any existing ledger sheet so as not to overwrite it.
 @param {Array<Array>} ledgerDataTable - The ledger data table.
 */
AssetTracker.prototype.ledgerSheet = function (ledgerDataTable) {

  const sheetName = this.ledgerSheetName;

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  const assetList = this.getAssetListFromDataTable(ledgerDataTable);

  const headerRows = 2;
  const footerRows = 1;
  const dataRows = ledgerDataTable.length;
  const rowCount = dataRows + headerRows + footerRows;

  this.trimSheet(sheet, rowCount, 14);

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

  this.addActionCondtion(sheet, 'B3:B');

  if (!sheet.getFilter()) {
    sheet.getRange('A2:N').createFilter();
  }

  sheet.getRange('A3:N').offset(0, 0, dataRows).setValues(ledgerDataTable);

  let dateRule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(false)
    .setHelpText('Input must be a date.')
    .build();
  sheet.getRange('A3:A').setDataValidation(dateRule);

  let actionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Adjust', 'Donation', 'Fee', 'Gift', 'Income', 'Inflation', 'Skip', 'Stop', 'Trade', 'Transfer'])
    .setAllowInvalid(false)
    .build();
  sheet.getRange('B3:B').setDataValidation(actionRule);

  let assetRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(assetList)
    .setAllowInvalid(true)
    .setHelpText(`New assets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('C3:C').setDataValidation(assetRule);
  sheet.getRange('H3:H').setDataValidation(assetRule);

  let positiveNumberRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText(`Input must be a number greater than 0.`)
    .build();
  sheet.getRange('D3:D').setDataValidation(positiveNumberRule);
  sheet.getRange('I3:I').setDataValidation(positiveNumberRule);

  let nonNegativeNumberRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0)
    .setAllowInvalid(false)
    .setHelpText(`Input must be a number greater than or equal to 0.`)
    .build();
  sheet.getRange('E3:E').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('F3:F').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('J3:J').setDataValidation(nonNegativeNumberRule);
  sheet.getRange('K3:K').setDataValidation(nonNegativeNumberRule);

  let walletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Binance', 'Deposit', 'IB', 'Kraken', 'Ledger', 'Rewards'])
    .setAllowInvalid(true)
    .setHelpText(`New wallets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('G3:G').setDataValidation(walletRule);
  sheet.getRange('L3:L').setDataValidation(walletRule);

  let lotMatchingRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(AssetTracker.lotMatchings)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('M3:M').setDataValidation(lotMatchingRule);

  sheet.setColumnWidth(13, 120);

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 1);
  sheet.autoResizeColumns(5, 1);
  sheet.autoResizeColumns(10, 1);
  sheet.autoResizeColumns(14, 1);

  this.setSheetVersion(sheet, this.ledgerSheetVersion);

  return sheet;
};

/**
 * Updates the sheet version to the current version if necessary.
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

    //Future updates to the ledger sheet can be inserted here

    this.setSheetVersion(sheet, this.ledgerSheetVersion);
  }

  this.updateLedgerAssets(sheet);
  this.updateLedgerWallets(sheet);
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

  let assetRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(tickers)
    .setAllowInvalid(true)
    .setHelpText(`New assets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('C3:C').setDataValidation(assetRule);
  sheet.getRange('H3:H').setDataValidation(assetRule);

};

/**
 * Sets data validation on the wallets columns of the ledger sheet.
 * The list of wallet names is collected when the ledger is processed to write the reports.
 * The wallet names are sorted alphabetically.
 * @param {Sheet} sheet - The ledger sheet.
 */
AssetTracker.prototype.updateLedgerWallets = function (sheet) {

  let walletNames = Array.from(this.wallets.keys()).sort(AssetTracker.abcComparator);

  let walletRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(walletNames)
    .setAllowInvalid(true)
    .setHelpText(`New wallets will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('G3:G').setDataValidation(walletRule);
  sheet.getRange('L3:L').setDataValidation(walletRule);

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

    ledgerSheet = this.ledgerSheet();
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

/**
 * Returns the asset list from the given ledger data table.
 * The asset list is the array of alphabetically sorted unique non null/undefined values from column 3 and 7 of the given two dimensional array.
 * @return {Array<string>} The asset list.
 */
AssetTracker.prototype.getAssetListFromDataTable = function (dataTable) {

  const assetsList1 = dataTable.map(function (value, index) { return value[2]; });
  const assetsList2 = dataTable.map(function (value, index) { return value[7]; });
  const assetsList3 = assetsList1.concat(assetsList2);
  const assetsList4 = assetsList3.filter(element => { return element !== null && element !== undefined; });
  const assetsList5 = assetsList4.sort(AssetTracker.abcComparator);
  const assetsList6 = Array.from(new Set(assetsList5));
  return assetsList6;
}