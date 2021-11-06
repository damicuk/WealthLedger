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

