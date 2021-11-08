/**
 * Creates the closed summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukClosedSummaryReport = function (sheetName = this.ukClosedSummaryReportName) {

  const version = '1';

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
      'Balance',
      'Cost Price',
      'Sell Price',
      'Cost Basis',
      'Proceeds',
      'Realized P/L',
      'Realized P/L %',
      'Crypto (chart)',
      'Proceeds (chart)'

    ]
  ];

  sheet.getRange('A1:L1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:C').setNumberFormat('@');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E2:F').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('G2:H').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('I2:I').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('J2:J').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('K2:K').setNumberFormat('@');
  sheet.getRange('L2:L').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{
QUERY({{"", "", "", "", 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', '  ', Col2, '   ', '    ', '     ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");{"", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', Col1, Col2, SUM(Col5), SUM(Col6) / SUM(Col5), SUM(Col7) / SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col1, Col2 ORDER BY Col1, Col2 OFFSET 1 LABEL ' ' '', SUM(Col5) '', SUM(Col6) / SUM(Col5) '', SUM(Col7) / SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT Col3, ' ', '  ', '   ', '    ', '     ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col3 ORDER BY Col3 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT Col3, ' ', Col2, '  ', '   ', '    ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col2, Col3 ORDER BY Col3, Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");{"", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT Col3, Col1, Col2, SUM(Col5), SUM(Col6) / SUM(Col5), SUM(Col7) / SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col1, Col2, Col3 ORDER BY Col3, Col1, Col2 OFFSET 1 LABEL SUM(Col5) '', SUM(Col6) / SUM(Col5) '', SUM(Col7) / SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''")
})`, , , , , , , , , ,
    `=IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,QUERY({QUERY(${referenceRangeName}, "SELECT F, O, T WHERE O='Trade'")}, "SELECT Col1, SUM(Col3) GROUP BY Col1 ORDER BY Col1 LABEL SUM(Col3) ''"))`
  ]];

  sheet.getRange('A2:K2').setFormulas(formulas);

  sheet.hideColumns(11, 2);

  this.trimColumns(sheet, 19);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('K2:L1000'))
    .setNumHeaders(0)
    .setTitle('Proceeds')
    .setPosition(1, 13, 30, 30)
    .build();

  sheet.insertChart(chart);

  sheet.autoResizeColumns(1, 12);
};