/**
 * Creates a sample assets sheet.
 * Renames any existing assets sheet so as not to overwrite it.
 */
AssetTracker.prototype.sampleAssets = function () {

  const sheetName = this.assetSheetName;

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let headers = [
    [
      'Asset',
      'Asset Type',
      'Decimal Places',
      'Current Price',
      'API',
      'Date Time',
      'URL',
      'XPATH'
    ]
  ];

  sheet.getRange('A1:H1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('0');
  sheet.getRange('D2:D').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('E2:E').setNumberFormat('@');
  sheet.getRange('F2:F').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('G2:H').setNumberFormat('@');

  let assetFormula = `=REGEXMATCH(TO_TEXT(A2), "^\\w{2,9}$")`;
  let assetHelpText = `Input must be between 2 and 9 alphanumeric characters [A-Za-z0-9_].`;
  this.setValidation(sheet, 'A2:A', assetFormula, false, assetHelpText);

  let decimalPlacesFormula = `=REGEXMATCH(TO_TEXT(C2), "^[012345678]$")`;
  let decimalPlacesHelpText = `Input must be an integer between 0 and 8`;
  this.setValidation(sheet, 'C2:C', decimalPlacesFormula, false, decimalPlacesHelpText);

  let assetTypes = ['Crypto', 'Fiat', 'Fiat Base', 'Forex', 'Stablecoin', 'Stock'];
  this.setValidation(sheet, 'B2:B', assetTypes, false);

  let apiOptions = ['CryptoCompare', 'CoinMarketCap'];
  this.setValidation(sheet, 'E2:E', apiOptions, false);

  let dataTable = [
    ['USD', 'Fiat Base', '2', '1', , ,],
    ['ADA', 'Crypto', '6', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A3), "USD"))', , ,],
    ['ALGO', 'Crypto', '8', , 'CryptoCompare', ,],
    ['BTC', 'Crypto', '8', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A5), "USD"))', , ,],
    ['SOL', 'Crypto', '8', , 'CryptoCompare', ,],
    [, , , , , ,]
  ];

  this.writeTable(ss, sheet, dataTable, this.assetsRangeName, 1, 6, 2);

  if (!sheet.getFilter()) {
    sheet.getRange('A1:H').createFilter();
  }

  sheet.hideColumns(6, 3);

  this.trimSheet(sheet, 7, 8);

  sheet.autoResizeColumns(1, 5);
}
