/**
 * Creates the income summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
AssetTracker.prototype.incomeSummaryReport = function () {

  const version = '1';
  const sheetName = this.incomeSummaryReportName;

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
      'Year',
      'Source Asset',
      'Source Asset Type',
      'Income Asset',
      'Income Asset Type',
      'Amount',
      'Income Value'
    ]
  ];

  sheet.getRange('A1:G1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:E').setNumberFormat('@');
  sheet.getRange('F2:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('G2:G').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(Col7) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT ' ', '  ', Col3, '   ', Col5, '    ', SUM(Col7) GROUP BY Col3, Col5 ORDER BY Col3, Col5 LABEL ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT ' ', Col2, Col3, Col4, Col5, SUM(Col6), SUM(Col7) GROUP BY Col2, Col3, Col4, Col5 ORDER BY Col3, Col2, Col5, Col4 LABEL ' ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT Col1, ' ', '  ', '   ', '    ', SUM(Col6), SUM(Col7) GROUP BY Col1 ORDER BY Col1 LABEL Col1 '', ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BT YEAR AND ASSET TYPE", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT Col1, ' ', Col3, '  ', Col5, '   ', SUM(Col7) GROUP BY Col1, Col3, Col5 ORDER BY Col1, Col3, Col5 LABEL Col1 '', ' ' '', '  ' '', '   ' '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BT YEAR AND ASSET", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(A), B, C, D, E, G, I")}, "SELECT Col1, Col2, Col3, Col4, Col5, SUM(Col6), SUM(Col7) GROUP BY Col1, Col2, Col3, Col4, Col5 ORDER BY Col1, Col3, Col2, Col5, Col4 LABEL Col1 '', SUM(Col6) '', SUM(Col7) ''")
})`, , , , , , ,
  ]];

  sheet.getRange('A2:G2').setFormulas(formulas);

  this.trimColumns(sheet, 7);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};