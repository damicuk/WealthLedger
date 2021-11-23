/**
 * Creates the open summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.openSummaryReport = function (sheetName = this.openSummaryReportName) {

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

  const referenceRangeName = this.openPositionsRangeName;

  let headers = [
    [
      'Wallet',
      'Asset Type',
      'Asset',
      'Holding Period',
      'Balance',
      'Cost Price',
      'Current Price',
      'Cost Basis',
      'Current Value',
      'Unrealized P/L',
      'Unrealized P/L %'
    ]
  ];

  sheet.getRange('A1:K1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:D').setNumberFormat('@');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('F2:G').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('H2:I').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('J2:J').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('K2:K').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  sheet.clearConditionalFormatRules();
  this.addLongShortCondition(sheet, 'D3:D');

  const formula =
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{
IF(COUNT(QUERY(${referenceRangeName}, "SELECT P"))=0,
QUERY({QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col5), '       ', '        ', '         ' LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', '       ' '', '        ' '', '         ' ''"),
QUERY({QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''"));
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT ' ', Col2, '  ', '   ', '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT ' ', Col2, Col1, '  ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col1 ORDER BY Col2, Col1 OFFSET 1 LABEL ' ' '', '  ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3 ORDER BY Col3 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, Col2, ' ', '  ', '   ', '    ', '     ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2 ORDER BY Col3, Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, Col2, Col1, ' ', SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1 ORDER BY Col3, Col2, Col1  OFFSET 1 LABEL ' ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT ' ', '  ', '   ', Col8, '    ', '     ', '      ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col8 ORDER BY Col8 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT ' ', Col2, '  ', Col8, '   ', '    ', '     ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col8 ORDER BY Col2, Col8 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT ' ', Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col1, Col8 ORDER BY Col2, Col1, Col8 OFFSET 1 LABEL ' ' '', SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, ' ', '  ', Col8, '   ', '    ', '     ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col8 ORDER BY Col3, Col8 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET, ASSET TYPE AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, Col2, ' ', Col8, '  ', '   ', '    ', SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col2, Col3, Col8 ORDER BY Col3, Col2, Col8 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET, ASSET AND HOLDING PERIOD", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0, 0, ""};QUERY(${referenceRangeName}, "SELECT H, I, L, M, O, Q, R, T")}, "SELECT Col3, Col2, Col1, Col8, SUM(Col4), SUM(Col5) / SUM(Col4), SUM(Col6) / SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col7), SUM(Col7) / SUM(Col5) GROUP BY Col3, Col2, Col1, Col8 ORDER BY Col3, Col2, Col1, Col8 OFFSET 1 LABEL SUM(Col4) '', SUM(Col5) / SUM(Col4) '', SUM(Col6) / SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col7) '', SUM(Col7) / SUM(Col5) ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 18);

  let chartRange1 = ss.getRangeByName(this.chartRange1Name);
  let chartRange2 = ss.getRangeByName(this.chartRange2Name);

  let assetTypeValueChart = sheet.newChart().asPieChart()
    .addRange(chartRange1)
    .setNumHeaders(1)
    .setTitle('Asset Type Value')
    .setPosition(1, 15, 30, 30)
    .build();

  sheet.insertChart(assetTypeValueChart);

  let assetValueChart = sheet.newChart().asPieChart()
    .addRange(chartRange2)
    .setNumHeaders(1)
    .setTitle('Asset Value')
    .setPosition(21, 15, 30, 30)
    .build();

  sheet.insertChart(assetValueChart);

  let assetTypePLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange1.offset(0, 0, chartRange1.getHeight(), 1))
    .addRange(chartRange1.offset(0, 2, chartRange1.getHeight(), 1))
    .setNumHeaders(1)
    .setTitle('Asset Type Unrealized P/L %')
    .setPosition(40, 15, 30, 30)
    .build();

  sheet.insertChart(assetTypePLChart);

  let assetPLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange2.offset(0, 0, chartRange2.getHeight(), 1))
    .addRange(chartRange2.offset(0, 2, chartRange2.getHeight(), 1))
    .setNumHeaders(1)
    .setTitle('Asset Unrealized P/L %')
    .setPosition(59, 15, 30, 30)
    .build();

  sheet.insertChart(assetPLChart);

  sheet.autoResizeColumns(1, 11);
};