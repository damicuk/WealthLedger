/**
 * Creates the closed summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.closedSummaryReport = function (sheetName = this.closedSummaryReportName) {

  const version = '4';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    let charts = sheet.getCharts();

    for (let chart of charts) {
      sheet.removeChart(chart);
    }

    this.trimColumns(sheet, 19);

    const referenceRangeName = this.closedRangeName;

    let headers = [
      [
        '',
        'Year',
        'Asset Type',
        'Asset',
        'Holding Period',
        'Balance',
        'Cost Price',
        'Sell Price',
        'Cost Basis',
        'Proceeds',
        'Realized P/L',
        'Realized P/L %'
      ]
    ];

    sheet.getRange('A1:L1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('@');
    sheet.getRange('C2:E').setNumberFormat('@');
    sheet.getRange('F2:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('G2:H').setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('I2:J').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('K2:K').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('L2:L').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    sheet.getRange('A2:A').setFontColor('#1155cc');

    this.addLongShortCondition(sheet, 'E3:E');

    const formula =
      `IF(COUNT(QUERY(${referenceRangeName}, "SELECT U WHERE N='Trade'"))=0,,
{
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', '       ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', '       ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', '  ', Col2, '   ', '    ', '     ', '      ', '       ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2 ORDER BY Col2 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', '       ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', '  ', Col2, Col1, '   ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col1 ORDER BY Col2, Col1 LABEL ' ' '', '  ' '', '   ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, '  ', '   ', '    ', '     ', '      ', '       ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3 ORDER BY Col3 LABEL Col3 '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', '       ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET TYPE", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, Col2, '  ', '   ', '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2 ORDER BY Col3, Col2 LABEL Col3 '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND ASSET", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, Col2, Col1, '  ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1 ORDER BY Col3, Col2, Col1 LABEL Col3 '', ' ' '', '  ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR, ASSET AND PROFIT/LOSS", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade' AND Z>=0")}, "SELECT ' ', Col3, Col2, Col1, '  ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1 ORDER BY Col3, Col2, Col1 LABEL Col3 '', ' ' '', '  ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade' AND Z<0")}, "SELECT ' ', Col3, Col2, Col1, '  ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1 ORDER BY Col3, Col2, Col1 LABEL Col3 '', ' ' '', '  ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''")
}, "SELECT * ORDER BY Col2, Col3, Col4, Col11 DESC");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', '  ', '   ', '    ', Col8, '     ', '      ', '       ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col8 ORDER BY Col8 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', '       ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', '  ', Col2, '   ', Col8, '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col8 ORDER BY Col2, Col8 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', '  ', Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col1, Col8 ORDER BY Col2, Col1, Col8 LABEL ' ' '', '  ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, '  ', '   ', Col8, '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col8 ORDER BY Col3, Col8 LABEL Col3 '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR, ASSET TYPE AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, Col2, '  ', Col8, '   ', '    ', '     ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col3, Col8 ORDER BY Col3, Col2, Col8 LABEL Col3 '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR, ASSET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade'")}, "SELECT ' ', Col3, Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1, Col8 ORDER BY Col3, Col2, Col1, Col8 LABEL ' ' '', Col3 '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", "", ""};
{"BY YEAR, ASSET, HOLDING PERIOD AND PROFIT/LOSS", "", "", "", "", "", "", "", "", "", "", ""};
QUERY({
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade' AND Z>=0")}, "SELECT ' ', Col3, Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1, Col8 ORDER BY Col3, Col2, Col1, Col8 LABEL ' ' '', Col3 '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
QUERY({QUERY(${referenceRangeName}, "SELECT I, J, YEAR(M), U, X, Y, Z, AB WHERE N='Trade' AND Z<0")}, "SELECT ' ', Col3, Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1, Col8 ORDER BY Col3, Col2, Col1, Col8 LABEL ' ' '', Col3 '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''")
}, "SELECT * ORDER BY Col2, Col3, Col4, Col5, Col11 DESC")
})`;

    sheet.getRange('A2').setFormula(formula);

    let chartRange3 = ss.getRangeByName(this.chartRange3Name);
    let chartRange4 = ss.getRangeByName(this.chartRange4Name);

    let assetTypeProceedsPLChart = sheet.newChart().asColumnChart()
      .addRange(chartRange3)
      .setNumHeaders(1)
      .setTitle('Asset Type')
      .setPosition(1, 16, 30, 30)
      .build();

    sheet.insertChart(assetTypeProceedsPLChart);

    let yearProceedsPLChart = sheet.newChart().asColumnChart()
      .addRange(chartRange4)
      .setNumHeaders(1)
      .setTitle('Last 5 Years')
      .setPosition(21, 16, 30, 30)
      .build();

    sheet.insertChart(yearProceedsPLChart);

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(2, 11);
};