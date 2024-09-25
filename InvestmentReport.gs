/**
 * Creates the investment report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.investmentReport = function (sheetName = this.investmentReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    this.trimSheet(sheet, 36, 12);

    let investmentRange1Name = ss.getRangeByName(this.investmentRange1Name);

    let chart1 = sheet.newChart().asColumnChart()
      .addRange(investmentRange1Name)
      .setNumHeaders(1)
      .setTitle('Investment by Asset Type')
      .setPosition(1, 1, 0, 0)
      .setOption('height', 754)
      .setOption('width', 1210)
      .build();

    sheet.insertChart(chart1);

    this.setSheetVersion(sheet, this.reportsVersion);
  }

  SpreadsheetApp.flush();
};