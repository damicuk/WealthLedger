/**
 * Creates the uk open summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukOpenSummaryReport = function (sheetName = this.ukOpenSummaryReportName) {

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

  const referenceRangeName1 = this.ukOpenRangeName;
  const referenceRangeName2 = this.ukAccountsRangeName;

  let headers = [
    [
      '',
      'Wallet',
      'Asset Type',
      'Asset',
      'Balance',
      'Cost Price',
      'Current Price',
      'Cost Basis',
      'Current Value',
      'Unrealized P/L',
      'Unrealized P/L %'
    ]
  ];

  sheet.getRange('A1:K1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  sheet.getRange('A2:D').setNumberFormat('@');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('F2:G').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('H2:I').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('J2:J').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('K2:K').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  sheet.getRange('A2:A').setFontColor('#1155cc');

  const formula =
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT I"))=0,,
{
IF(COUNT(QUERY(${referenceRangeName1}, "SELECT K"))=0,
QUERY({QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col4), '       ', '        ', '         ' LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col4) '', '       ' '', '        ' '', '         ' ''"),
QUERY({QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''"));
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT ' ', '  ', Col2, '   ', '    ', '     ', '      ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT ' ', '  ', Col2, Col1, SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2, Col1 ORDER BY Col2, Col1 OFFSET 1 LABEL ' ' '', '  ' '', SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};${referenceRangeName2}}, "SELECT ' ', Col1, '  ', '   ', '    ', '     ', '      ', '       ', SUM(Col6), '        ', '         ' GROUP BY Col1 ORDER BY Col1 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col6) '', '       ' '', '        ' '', '         ' ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET TYPE", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};${referenceRangeName2}}, "SELECT ' ', Col1, Col3, '  ', '   ', '    ', '     ', '      ', SUM(Col6), '       ', '        ' GROUP BY Col1, Col3 ORDER BY Col1, Col3 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', '      ' '', SUM(Col6) '', '       ' '', '        ' ''");
{"", "", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET", "", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};${referenceRangeName2}}, "SELECT ' ', Col1, Col3, Col2, SUM(Col4), '  ', SUM(Col6) / SUM(Col4), '   ', SUM(Col6), '    ', '     ' GROUP BY Col1, Col3, Col2 ORDER BY Col1, Col3, Col2 OFFSET 1 LABEL ' ' '', SUM(Col4) '', '  ' '', SUM(Col6) / SUM(Col4) '', '   ' '', SUM(Col6) '', '    ' '', '     ' ''")
})`;

  sheet.getRange('A2').setFormula(formula);

  this.trimColumns(sheet, 18);

  let chartRange1 = ss.getRangeByName(this.ukChartRange1Name);
  let chartRange2 = ss.getRangeByName(this.ukChartRange2Name);

  let assetTypeValueChart = sheet.newChart().asPieChart()
    .addRange(chartRange1)
    .setNumHeaders(1)
    .setTitle('Asset Type Value')
    .setPosition(1, 16, 30, 30)
    .build();

  sheet.insertChart(assetTypeValueChart);

  let assetValueChart = sheet.newChart().asPieChart()
    .addRange(chartRange2.offset(0, 1, chartRange2.getHeight(), 2))
    .setNumHeaders(1)
    .setTitle('Asset Value')
    .setPosition(21, 16, 30, 30)
    .build();

  sheet.insertChart(assetValueChart);

  let assetTypePLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange1.offset(0, 0, chartRange1.getHeight(), 1))
    .addRange(chartRange1.offset(0, 2, chartRange1.getHeight(), 1))
    .setNumHeaders(1)
    .setTitle('Asset Type Unrealized P/L %')
    .setPosition(40, 16, 30, 30)
    .build();

  sheet.insertChart(assetTypePLChart);

  let assetPLChart = sheet.newChart().asColumnChart()
    .addRange(chartRange2.offset(0, 1, chartRange2.getHeight(), 1))
    .addRange(chartRange2.offset(0, 3, chartRange2.getHeight(), 1))
    .setNumHeaders(1)
    .setTitle('Asset Unrealized P/L %')
    .setPosition(59, 16, 30, 30)
    .build();

  sheet.insertChart(assetPLChart);

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(2, 10);
};