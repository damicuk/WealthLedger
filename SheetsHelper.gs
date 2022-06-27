/**
 * Sets the currenct cell in named sheet.
 * @param {string} sheetName - The name. of the sheet.
 * @param {number} rowIndex - The row index of the cell in the named sheet.
 * @param {number} columnIndex - The column index of the cell in the named sheet.
 */
AssetTracker.prototype.setCurrentCell = function (sheetName, rowIndex, columnIndex) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    let range = sheet.getRange(rowIndex, columnIndex, 1, 1);
    ss.setCurrentCell(range);
    SpreadsheetApp.flush();
  }
};

/**
 * Deletes the named sheet if it exists.
 * @param {string} sheetName - The name of the sheet to delete.
 */
AssetTracker.prototype.deleteSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    ss.deleteSheet(sheet);
  }
};

/**
 * Deletes any sheet that exists given an array of sheet names.
 * @param {Array<string>} sheetNames - The names of the sheets to delete.
 */
AssetTracker.prototype.deleteSheets = function (sheetNames) {

  for (let sheetName of sheetNames) {

    this.deleteSheet(sheetName);
  }
};

/**
 * Writes version metadata to a sheet with project visibility.
 * Used to determine when to push sheet updates to end users.
 * @param {Sheet} sheet - The sheet to which to add version metadata.
 * @param {string} version - The version to write to the sheet.
 */
AssetTracker.prototype.setSheetVersion = function (sheet, version) {

  let metadataArray = sheet.createDeveloperMetadataFinder().withKey('version').find();
  if (metadataArray.length > 0) {
    metadataArray[0].setValue(version);
  }
  else {
    sheet.addDeveloperMetadata('version', version, SpreadsheetApp.DeveloperMetadataVisibility.PROJECT);
  }
};

/**
 * Reads version metadata from a sheet.
 * Used to determine when to push sheet updates to end users.
 * @param {Sheet} sheet - The sheet from which to read version metadata.
 * @return {string} The version of the sheet.
 */
AssetTracker.prototype.getSheetVersion = function (sheet) {

  let metadataArray = sheet.createDeveloperMetadataFinder().withKey('version').find();
  let metadataValue = metadataArray.length > 0 ? metadataArray[0].getValue() : '';
  return metadataValue;
};

/**
 * Renames a sheet by adding a number to the end of its name.
 * Searches for the first available number starting at 1.
 * @param {string} sheetName - The name of the sheet to be renamed.
 */
AssetTracker.prototype.renameSheet = function (sheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    let i = 1;

    while (Boolean(ss.getSheetByName(`${sheetName} ${i}`))) {
      i++;
    }

    sheet.setName(`${sheetName} ${i}`);

  }
};

/**
 * Resizes a sheet by inserting or deleting rows and columns.
 * @param {number} [neededRows] - The number of rows required.
 * If not provided it resizes to the size of the data keeping at lease one non-frozen row.
 * @param {number} [neededColumns] - The number of columns required.
 * If not provided it resizes to the size of the data keeping at lease one non-frozen column.
 */
AssetTracker.prototype.trimSheet = function (sheet, neededRows, neededColumns) {

  this.trimRows(sheet, neededRows);

  this.trimColumns(sheet, neededColumns);

};

/**
 * Resizes a sheet by inserting or deleting rows.
 * @param {number} [neededRows] - The number of rows required.
 * If not provided it resizes to the size of the data keeping at lease one non-frozen row.
 */
AssetTracker.prototype.trimRows = function (sheet, neededRows) {

  if (!neededRows) {

    let dataRange = sheet.getDataRange();

    neededRows = Math.max(dataRange.getHeight(), sheet.getFrozenRows() + 1);

  }

  const totalRows = sheet.getMaxRows();

  const extraRows = totalRows - neededRows;

  if (extraRows > 0) {

    sheet.deleteRows(neededRows + 1, extraRows);

  }
  else if (extraRows < 0) {

    sheet.insertRowsAfter(totalRows, -extraRows);

  }
};

/**
 * Resizes a sheet by inserting or deleting columns.
 * @param {number} [neededColumns] - The number of columns required.
 * If not provided it resizes to the size of the data keeping at lease one non-frozen column.
 */
AssetTracker.prototype.trimColumns = function (sheet, neededColumns) {

  if (!neededColumns) {

    let dataRange = sheet.getDataRange();

    neededColumns = Math.max(dataRange.getWidth(), sheet.getFrozenColumns() + 1);

  }

  const totalColumns = sheet.getMaxColumns();

  const extraColumns = totalColumns - neededColumns;

  if (extraColumns > 0) {

    sheet.deleteColumns(neededColumns + 1, extraColumns);

  }
  else if (extraColumns < 0) {

    sheet.insertColumnsAfter(totalColumns, -extraColumns);

  }
};

/**
 * Writes a column of links to rows of the ledger sheet.
 * @param {Spreadsheet} ss - Spreadsheet object e.g. from SpreadsheetApp.getActive().
 * @param {Array<string,number>} linkTable - An table with the link texts and the row indexes of the ledger sheet to link to.
 * @param {string} rangeName - The name of the named range where the links are to be writen.
 * @param {number} columnIndex - The index of the column of the named range where the links are to be writen.
 * @param {string} sheetName - The name of the sheet to link.
 * @param {string} firstColumn - The first column of the link A1 notation.
 * @param {string} lastColumn - The last column of the link A1 notation.
 */
AssetTracker.prototype.writeLinks = function (ss, linkTable, rangeName, columnIndex, sheetName, firstColumn, lastColumn) {

  let ledgerSheetId = ss.getSheetByName(sheetName).getSheetId();
  let richTextValues = [];
  for (let linkRow of linkTable) {
    let linkText = linkRow[0];
    let rowIndex = linkRow[1];

    richTextValue = SpreadsheetApp.newRichTextValue()
      .setText(linkText)
      .setLinkUrl(`#gid=${ledgerSheetId}&range=${firstColumn}${rowIndex}:${lastColumn}${rowIndex}`)
      .build();

    richTextValues.push([richTextValue]);
  }

  let range = ss.getRangeByName(rangeName);
  range = range.offset(0, columnIndex, range.getHeight(), 1);
  range.setRichTextValues(richTextValues);
};

/**
 * Adds specific conditional text color formatting to a range of cells in a sheet.
 * Used to format the action column of the ledger sheet.
 * @param {Sheet} sheet - The sheet containing the range of cells to format.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted.
 */
AssetTracker.prototype.addActionCondtion = function (sheet, a1Notation) {

  let textColors = [
    ['Donation', '#ff9900', null],
    ['Fee', '#9900ff', null],
    ['Gift', '#ff9900', null],
    ['Income', '#6aa84f', null],
    ['Skip', '#ff0000', '#ffbb00'],
    ['Adjust', '#ff00ff', null],
    ['Stop', '#ff0000', '#ffbb00'],
    ['Trade', '#1155cc', null],
    ['Transfer', '#ff0000', null],
  ];

  let range = sheet.getRange(a1Notation);
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
 * Adds specific conditional text color formatting to a range of cells in a sheet.
 * Used to format the long / short columns in the reports sheets.
 * @param {Sheet} sheet - The sheet containing the range of cells to format.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted.
 */
AssetTracker.prototype.addLongShortCondition = function (sheet, a1Notation) {

  let range = sheet.getRange(a1Notation);

  let shortRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('SHORT')
    .setFontColor("#ff0000")
    .setRanges([range])
    .build();

  let longRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('LONG')
    .setFontColor("#0000ff")
    .setRanges([range])
    .build();

  let rules = sheet.getConditionalFormatRules();
  rules.push(shortRule);
  rules.push(longRule);
  sheet.setConditionalFormatRules(rules);
};

/**
 * Adds specific conditional text color formatting to a range of cells in a sheet.
 * Used to format the long / short columns in the reports sheets.
 * @param {Sheet} sheet - The sheet containing the range of cells to format.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted.
 */
AssetTracker.prototype.addAssetCondition = function (sheet, a1Notation) {

  let range = sheet.getRange(a1Notation);

  let fiatBaseRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(this.fiatBase.ticker)
    .setFontColor("#34a853")
    .setRanges([range])
    .build();

  let rules = sheet.getConditionalFormatRules();
  rules.push(fiatBaseRule);
  sheet.setConditionalFormatRules(rules);
};