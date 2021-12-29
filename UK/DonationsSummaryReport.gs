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

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    this.trimColumns(sheet, 7);

    const referenceRangeName = this.ukClosedRangeName;

    let headers = [
      [
        '',
        'Year',
        'Asset',
        'Asset Type',
        'Amount',
        'Cost Basis',
        'Donation Value'
      ]
    ];

    sheet.getRange('A1:G1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('@');
    sheet.getRange('C2:D').setNumberFormat('@');
    sheet.getRange('E2:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('F2:F').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('G2:G').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.getRange('A2:A').setFontColor('#1155cc');

    const formula =
      `IF(COUNT(QUERY(${referenceRangeName}, "SELECT P WHERE O='Donation'"))=0,,
{
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', SUM(Col6), SUM(Col7) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', '  ', '   ', Col2, '    ', SUM(Col6), SUM(Col7) GROUP BY Col2 ORDER BY Col2 LABEL ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', '  ', Col1, Col2, SUM(Col5), SUM(Col6), SUM(Col7) GROUP BY Col1, Col2 ORDER BY Col1, Col2 LABEL ' ' '', '  ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', Col3, '  ', '   ', '    ', SUM(Col6), SUM(Col7) GROUP BY Col3 ORDER BY Col3 LABEL ' ' '', Col3 '', '  ' '', '   ' '', '    ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', Col3, '  ', Col2, '   ', SUM(Col6), SUM(Col7) GROUP BY Col3, Col2 ORDER BY Col3, Col2 LABEL ' ' '', Col3 '', '  ' '', Col2 '', '   ' '', SUM(Col6) '', SUM(Col7) ''");
{"", "", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT F, G, YEAR(J), O, P, S, T WHERE O='Donation'")}, "SELECT ' ', Col3, Col1, Col2, SUM(Col5), SUM(Col6), SUM(Col7) GROUP BY Col3, Col1, Col2 ORDER BY Col3, Col1, Col2 LABEL ' ' '', Col3 '', Col1 '', Col2 '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) ''")
})`;

    sheet.getRange('A2').setFormula(formula);

    sheet.hideSheet();

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(2, 6);
};