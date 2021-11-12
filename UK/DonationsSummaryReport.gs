/**
 * Creates the uk donations summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukDonationsSummaryReport = function (sheetName = this.ukDonationsSummaryReportName) {

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
    `=IF(COUNT(QUERY(${referenceRangeName}, "SELECT O WHERE O='Donation'"))=0,,
{
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT 'TOTAL', ' ', '  ', '   ', SUM(Col6), SUM(Col7) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', '  ', Col2, '   ', SUM(Col6), SUM(Col7) GROUP BY Col2 ORDER BY Col2 LABEL ' ' '', '  ' '', '   ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', Col1, Col2, SUM(Col5), SUM(Col6), SUM(Col7) GROUP BY Col1, Col2 ORDER BY Col1, Col2 LABEL ' ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT Col3, ' ', '  ', '   ', SUM(Col6), SUM(Col7) GROUP BY Col3 ORDER BY Col3 LABEL Col3 '', ' ' '', '  ' '', '   ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT Col3, ' ', Col2, '  ', SUM(Col6), SUM(Col7) GROUP BY Col3, Col2 ORDER BY Col3, Col2 LABEL Col3 '', ' ' '', Col2 '', '  ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT Col3, Col1, Col2, SUM(Col5), SUM(Col6), SUM(Col7) GROUP BY Col3, Col1, Col2 ORDER BY Col3, Col1, Col2 LABEL Col3 '', Col1 '', Col2 '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 6);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};