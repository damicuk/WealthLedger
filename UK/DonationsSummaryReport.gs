/**
 * Creates the donations summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
AssetTracker.prototype.ukDonationsSummaryReport = function () {

  const version = '1';
  const sheetName = this.ukDonationsSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  this.setSheetVersion(sheet, version);

  const referenceRangeName = this.ukClosedPositionsRangeName;

  let headers = [
    [
      'Year',
      'Asset',
      'Asset Type',
      'Amount',
      'Cost Basis',
      'Donation Value'
    ]
  ];

  sheet.getRange('A1:F1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:C').setNumberFormat('@');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('F2:F').setNumberFormat('#,##0.00;(#,##0.00)');

  const formula =
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT 'TOTAL', ' ', '  ', '   ', SUM(Col5), SUM(Col6) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', SUM(Col5) '', SUM(Col6) ''");
{"", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT ' ', '  ', Col3, '   ', SUM(Col5), SUM(Col6) GROUP BY Col3 ORDER BY Col3 LABEL ' ' '', '  ' '', '   ' '', SUM(Col5) '', SUM(Col6) ''");
{"", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT ' ', Col2, Col3, SUM(Col4), SUM(Col5), SUM(Col6) GROUP BY Col2, Col3 ORDER BY Col2, Col3 LABEL ' ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) ''");
{"", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT Col1, ' ', '  ', '   ', SUM(Col5), SUM(Col6) GROUP BY Col1 ORDER BY Col1 LABEL Col1 '', ' ' '', '  ' '', '   ' '', SUM(Col5) '', SUM(Col6) ''");
{"", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT Col1, ' ', Col3, '  ', SUM(Col5), SUM(Col6) GROUP BY Col1, Col3 ORDER BY Col1, Col3 LABEL Col1 '', ' ' '', Col3 '', '  ' '', SUM(Col5) '', SUM(Col6) ''");
{"", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT YEAR(J), F, G, P, S, T")}, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5), SUM(Col6) GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col3, Col2 LABEL Col1 '', Col2 '', Col3 '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 6);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};