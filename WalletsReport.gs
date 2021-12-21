/**
 * Creates the wallets report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.walletsReport = function (sheetName = this.walletsReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {
    if (this.getSheetVersion(sheet) === version) {
      return;
    }
    else {
      sheet.clear();
    }
  }
  else {
    sheet = ss.insertSheet(sheetName);
  }

  this.setSheetVersion(sheet, version);

  const referenceRangeName1 = this.openRangeName;
  const referenceRangeName2 = this.fiatAccountsRangeName;

  sheet.getRange('A1:2').setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(2);
  sheet.setFrozenColumns(1);

  sheet.getRange('A2:B').setNumberFormat('@');
  sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

  sheet.getRange('A1').setFormula(
    `IF(AND(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0, COUNT(QUERY(${referenceRangeName2}, "SELECT C"))=0),,
TRANSPOSE(QUERY(
IF(COUNT(QUERY(${referenceRangeName2}, "SELECT C"))=0,
QUERY(${referenceRangeName1}, "SELECT I, J, M, SUM(N) GROUP BY I, J, M ORDER BY J, I, M LABEL SUM(N) ''"),
IF(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0,
QUERY(QUERY(${referenceRangeName2}, "SELECT B, 'Fiat', A, SUM(C) GROUP BY B, A ORDER BY B, A LABEL 'Fiat' '', SUM(C) ''"), "SELECT * WHERE Col4 <> 0"),
{
QUERY(${referenceRangeName1}, "SELECT I, J, M, SUM(N) GROUP BY I, J, M ORDER BY J, I, M LABEL SUM(N) ''");
QUERY(QUERY(${referenceRangeName2}, "SELECT B, ' Fiat ', A, SUM(C) GROUP BY B, A ORDER BY B, A LABEL ' Fiat ' '', SUM(C) ''"), "SELECT * WHERE Col4 <> 0")
})), "SELECT Col1, Col2, SUM(Col4) GROUP BY Col1, Col2 PIVOT Col3 ORDER BY Col2, Col1 LABEL Col1 'Wallet'")))`
  );

  sheet.autoResizeColumns(1, sheet.getMaxColumns());

  SpreadsheetApp.flush();
};