/**
 * Creates the income summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.incomeSummaryReport = function (sheetName = this.incomeSummaryReportName) {

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

  const referenceRangeName = this.incomeRangeName;

  let headers = [
    [
      '',
      'Year',
      'Source Asset',
      'Source Asset Type',
      'Income Asset',
      'Income Asset Type',
      'Amount',
      'Income Value'
    ]
  ];

  sheet.getRange('A1:H1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange('C2:F').setNumberFormat('@');
  sheet.getRange('G2:G').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('H2:H').setNumberFormat('#,##0.00;(#,##0.00)');

  sheet.getRange('A2:A').setFontColor('#1155cc');

  const formula =
    `IF(COUNT(QUERY(${referenceRangeName}, "SELECT H"))=0,,
{
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col7) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col7) ''");
{"", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT ' ', '  ', '   ', Col3, '    ', Col5, '     ', SUM(Col7) GROUP BY Col3, Col5 ORDER BY Col3, Col5 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col7) ''");
{"", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT ' ', '  ', Col2, Col3, Col4, Col5, SUM(Col6), SUM(Col7) GROUP BY Col2, Col3, Col4, Col5 ORDER BY Col2, Col3, Col4, Col5 LABEL ' ' '', '  ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT ' ', Col1, '  ', '   ', '    ', '     ', SUM(Col6), SUM(Col7) GROUP BY Col1 ORDER BY Col1 LABEL Col1 '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", "", ""};
{"BT YEAR AND ASSET TYPE", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT ' ', Col1, '  ', Col3, '   ', Col5, '    ', SUM(Col7) GROUP BY Col1, Col3, Col5 ORDER BY Col1, Col3, Col5 LABEL Col1 '', ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col7) ''");
{"", "", "", "", "", "", "", ""};
{"BT YEAR AND ASSET", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), C, D, E, F, H, J")}, "SELECT ' ', Col1, Col2, Col3, Col4, Col5, SUM(Col6), SUM(Col7) GROUP BY Col1, Col2, Col3, Col4, Col5 ORDER BY Col1, Col2, Col3, Col4, Col5 LABEL ' ' '', Col1 '', SUM(Col6) '', SUM(Col7) ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 8);

  sheet.autoResizeColumns(2, 7);
};