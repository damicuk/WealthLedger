/**
 * Creates the wallets report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.walletsReport = function (sheetName = this.walletsReportName) {

  const version = '2';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    const referenceRangeName1 = this.openRangeName;
    const referenceRangeName2 = this.fiatAccountsRangeName;

    sheet.getRange('A1:2').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(1);

    sheet.getRange('A2:B').setNumberFormat('@');
    sheet.getRange(2, 2, sheet.getMaxRows(), sheet.getMaxColumns()).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange('A1').setFormula(
      `IF(AND(COUNT(QUERY(${referenceRangeName1}, "SELECT L"))=0, COUNT(QUERY(QUERY(${referenceRangeName2}, "SELECT SUM(C) GROUP BY B, A"), "SELECT * WHERE Col1 <> 0"))=0),,
TRANSPOSE(
QUERY(
{
IF(COUNT(QUERY(${referenceRangeName1}, "SELECT L"))=0,{"", "", "", 0},QUERY(${referenceRangeName1}, "SELECT G, H, K, SUM(L) GROUP BY G, H, K ORDER BY H, G, K LABEL SUM(L) ''"));

IF(COUNT(QUERY(QUERY(${referenceRangeName2}, "SELECT SUM(C) GROUP BY B, A"), "SELECT * WHERE Col1 <> 0"))=0,{"", "", "", 0},
QUERY(QUERY(${referenceRangeName2}, "SELECT B, ' Fiat ', A, SUM(C) GROUP BY B, A ORDER BY B, A LABEL ' Fiat ' '', SUM(C) ''"), "SELECT * WHERE Col4 <> 0"))
}, "SELECT Col1, Col2, SUM(Col4) WHERE Col1 IS NOT NULL GROUP BY Col1, Col2 PIVOT Col3 ORDER BY Col2, Col1 LABEL Col1 'Wallet'")))`
    );

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  let dataRange = sheet.getDataRange();
  let dataRangeWidth = dataRange.getWidth();
  if (dataRangeWidth >= 2) {
    sheet.autoResizeColumns(2, dataRange.getWidth() - 1);
  }
};