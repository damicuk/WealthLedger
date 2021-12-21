/**
 * Creates the uk closed summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukClosedSummaryReport = function (sheetName = this.ukClosedSummaryReportName) {

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

  const referenceRangeName = this.ukClosedRangeName;

  let headers = [
    [
      '',
      'Year',
      'Asset Type',
      'Asset',
      'Balance',
      'Cost Price',
      'Sell Price',
      'Cost Basis',
      'Proceeds',
      'Realized P/L',
      'Realized P/L %'
    ]
  ];

  sheet.getRange('A1:K1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:A').setNumberFormat('@');
  sheet.getRange('C2:D').setNumberFormat('@');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('F2:G').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('H2:I').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('J2:J').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('K2:K').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  sheet.getRange('A2:A').setFontColor('#1155cc');

  const formula =
    `IF(COUNT(QUERY(${referenceRangeName}, "SELECT P WHERE O='Trade'"))=0,,
{
QUERY({{"", "", "", "", 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', '  ', Col2, '   ', '    ', '     ', '      ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', '  ', Col2, Col1, SUM(Col5), SUM(Col6) / SUM(Col5), SUM(Col7) / SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col2, Col1 ORDER BY Col2, Col1 OFFSET 1 LABEL ' ' '', '  ' '', SUM(Col5) '', SUM(Col6) / SUM(Col5) '', SUM(Col7) / SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', Col3, '  ', '   ', '    ', '     ', '      ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col3 ORDER BY Col3 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', Col3, Col2, '  ', '   ', '    ', '     ', SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col2, Col3 ORDER BY Col3, Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", "", 0, 0, 0, 0};QUERY(${referenceRangeName}, "SELECT F, G, Year(J), O, P, S, T, U WHERE O='Trade'")}, "SELECT ' ', Col3, Col2, Col1, SUM(Col5), SUM(Col6) / SUM(Col5), SUM(Col7) / SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col8), SUM(Col8) / SUM(Col6) GROUP BY Col3, Col2, Col1 ORDER BY Col3, Col2, Col1 OFFSET 1 LABEL ' ' '', SUM(Col5) '', SUM(Col6) / SUM(Col5) '', SUM(Col7) / SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col8) '', SUM(Col8) / SUM(Col6) ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 18);

  let chartRange3 = ss.getRangeByName(this.ukChartRange3Name);
  let chartRange4 = ss.getRangeByName(this.ukChartRange4Name);
  let chartRange5 = ss.getRangeByName(this.ukChartRange5Name);

  let assetTypeProceedsPLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange3)
    .setNumHeaders(1)
    .setTitle('Asset Type')
    .setPosition(1, 16, 30, 30)
    .build();

  sheet.insertChart(assetTypeProceedsPLChart);

  let assetProceedsPLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange4.offset(0, 1, chartRange4.getHeight(), 3))
    .setNumHeaders(1)
    .setTitle('Asset')
    .setPosition(21, 16, 30, 30)
    .build();

  sheet.insertChart(assetProceedsPLChart);

  let yearProceedsPLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange5)
    .setNumHeaders(1)
    .setTitle('Last 5 Years')
    .setPosition(40, 16, 30, 30)
    .build();

  sheet.insertChart(yearProceedsPLChart);

  sheet.autoResizeColumns(2, 10);

  SpreadsheetApp.flush();
};