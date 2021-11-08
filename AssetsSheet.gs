/**
 * Creates a sample assets sheet.
 * Renames any existing assets sheet so as not to overwrite it.
 */
AssetTracker.prototype.assetsSheet = function () {

  const sheetName = this.assetsSheetName;

  this.renameSheet(sheetName);

  let ss = SpreadsheetApp.getActive();
  sheet = ss.insertSheet(sheetName);

  let headers = [
    [
      'Asset',
      'Asset Type',
      'Decimal Places',
      'Current Price',
      'Timestamp',
      'API',
      'API Asset ID',
      'URL',
      'XPATH',
      'Comment'
    ]
  ];

  sheet.getRange('A1:J1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('0');
  sheet.getRange('D2:D').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('E2:E').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange('F2:I').setNumberFormat('@');

  let dataTable = [
    ['USD', 'Fiat Base', '2', '1', , , , , , ,],
    ['CAD', 'Fiat', '2', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A3), "USD"))', , , , , , `Fiat capital gains are ignored.`],
    ['EUR', 'Forex', '2', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A4), "USD"))', , , , , , `Forex is treated as any other asset.`],
    ['ADA', 'Crypto', '6', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A5), "USD"))', , , , , , ,],
    ['BTC', 'Crypto', '8', '=GOOGLEFINANCE(CONCAT(CONCAT("CURRENCY:", A6), "USD"))', , , , , , ,],
    ['USDC', 'Stablecoin', '2', '1', , , , , , ,],
    ['AAPL', 'Stock', '0', '=GOOGLEFINANCE(A8)', , , , , , ,],
    ['AMZN', 'Stock', '0', '=GOOGLEFINANCE(A9)', , , , , , ,],
    ['GE', 'Stock', '0', '=GOOGLEFINANCE(A10)', , , , , , ,],
    ['NVDA', 'Stock', '0', '=GOOGLEFINANCE(A11)', , , , , , ,],
    [, , , , , , , , , ,]
  ];

  this.writeTable(ss, sheet, dataTable, this.assetsRangeName, 1, 10);

  let assetRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(A2), "^\\w{2,9}$")`)
    .setAllowInvalid(false)
    .setHelpText(`Input must be between 2 and 9 alphanumeric characters [A-Za-z0-9_].`)
    .build();
  sheet.getRange('A2:A').setDataValidation(assetRule);

  let assetTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(Asset.defaultAssetTypes)
    .setAllowInvalid(true)
    .setHelpText(`New asset types will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('B2:B').setDataValidation(assetTypeRule);

  let decimalPlacesRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(C2), "^[012345678]{1}$")`)
    .setAllowInvalid(false)
    .setHelpText(`Input must be an integer between 0 and 8`)
    .build();
  sheet.getRange('C2:C').setDataValidation(decimalPlacesRule);

  let positiveNumberRule = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThan(0)
    .setAllowInvalid(false)
    .setHelpText(`Input must be a number greater than 0.`)
    .build();
  sheet.getRange('D2:D').setDataValidation(positiveNumberRule);

  let apiRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(this.validApiNames)
    .setAllowInvalid(false)
    .build();
  sheet.getRange('F2:F').setDataValidation(apiRule);

  let apiAssetIDRule = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(`=REGEXMATCH(TO_TEXT(G2), "^[\\w\\-]{1,20}$")`)
    .setAllowInvalid(false)
    .setHelpText(`Input must be between 1 and 20 alphanumeric characters [A-Za-z0-9_-].`)
    .build();
  sheet.getRange('G2:G').setDataValidation(apiAssetIDRule);

  if (!sheet.getFilter()) {
    sheet.getRange('A1:J').createFilter();
  }

  this.trimSheet(sheet, 12, 10);

  sheet.setColumnWidths(1, 9, 140);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(10, 250);

  this.setSheetVersion(sheet, this.assetsSheetVersion);

  return sheet;
};

/**
 * Updates the sheet version to the current version if necessary.
 * Sets data validation on the asset type column of the assets sheet.
 * @param {Array<AssetRecord>} assetRecords - The collection of asset records previously read from the assets sheet.
 */
AssetTracker.prototype.updateAssetsSheet = function (assetRecords) {

  const sheetName = this.assetsSheetName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return;
  }

  if (this.getSheetVersion(sheet) !== this.assetsSheetVersion) {

    //Future updates to the assets sheet can be inserted here

    this.setSheetVersion(sheet, this.assetsSheetVersion);
  }

  this.updateAssetsAssetTypes(sheet);
};

/**
 * Sets data validation on the asset type column of the assets sheet.
 * The list of asset types is collected when the ledger is processed to write the reports.
 * Both default and user defined asset types are sorted alphabetically.
 * The default asset types are listed before the user defined asset types.
 * @param {Sheet} sheet - The assets sheet.
 */
AssetTracker.prototype.updateAssetsAssetTypes = function (sheet) {

  let userDefinedAssetTypes = Array.from(this.userDefinedAssetTypes).sort(AssetTracker.abcComparator);
  let assetTypes = Asset.defaultAssetTypes.concat(userDefinedAssetTypes);

  let assetTypeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(assetTypes)
    .setAllowInvalid(true)
    .setHelpText(`New asset types will be added to the data validation dropdown when write reports is run.`)
    .build();
  sheet.getRange('B2:B').setDataValidation(assetTypeRule);
};

/**
 * Returns the range in the asset sheet that contains the data excluding header rows.
 * If there is no asset sheet it creates a sample asset sheet and returns the range from that.
 * Throws a ValidationError if the ledger sheet contains insufficient columns or no data rows.
 * @return {Range} The range in the asset sheet that contains the data excluding header rows.
 */
AssetTracker.prototype.getAssetsRange = function () {

  let ss = SpreadsheetApp.getActive();
  let assetsSheet = ss.getSheetByName(this.assetsSheetName);

  if (!assetsSheet) {

    assetsSheet = this.assetsSheet();
  }

  if (assetsSheet.getMaxColumns() < this.assetsDataColumns) {
    throw new ValidationError('Asset sheet has insufficient columns.');
  }

  let assetsRange = assetsSheet.getDataRange();

  if (assetsRange.getHeight() < this.assetsHeaderRows + 1) {
    throw new ValidationError('Asset sheet contains no data rows.');
  }

  assetsRange = assetsRange.offset(this.assetsHeaderRows, 0, assetsRange.getHeight() - this.assetsHeaderRows, this.assetsDataColumns);

  return assetsRange;
};