/**
 * Adds specific conditional text color formatting to a range of cells in a sheet.
 * Used to format the date column in the uk closed positions report sheet.
 * @param {Sheet} sheet - The sheet containing the range of cells to format.
 * @param {string} a1Notation - The A1 notation used to specify the range of cells to be formatted.
 */
AssetTracker.prototype.addPoolCondition = function (sheet, a1Notation) {

  let range = sheet.getRange(a1Notation);

  let poolRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('POOL')
    .setFontColor("#0000ff")
    .setRanges([range])
    .build();

  let rules = sheet.getConditionalFormatRules();
  rules.push(poolRule);
  sheet.setConditionalFormatRules(rules);
};