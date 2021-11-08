/**
 * Creates the open summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukOpenSummaryReport = function (sheetName = this.ukOpenSummaryReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  this.setSheetVersion(sheet, version);

  const referenceRangeName1 = this.ukOpenPoolsRangeName;
  const referenceRangeName2 = this.ukAssetAccountsRangeName;

  let headers = [
    [
      'Wallet',
      'Asset',
      'Asset Type',
      'Balance',
      'Cost Price',
      'Current Price',
      'Cost Basis',
      'Current Value',
      'Unrealized P/L',
      'Unrealized P/L %',
      'Asset (chart)',
      'Value (chart)'

    ]
  ];

  sheet.getRange('A1:L1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('A2:C').setNumberFormat('@');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('E2:F').setNumberFormat('#,##0.0000;(#,##0.0000)');
  sheet.getRange('G2:H').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('I2:I').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
  sheet.getRange('J2:J').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
  sheet.getRange('K2:K').setNumberFormat('@');
  sheet.getRange('L2:L').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName1}, 1, 1)),,{
IF(COUNT(QUERY(${referenceRangeName1}, "SELECT I"))=0,
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(Col4), '     ', '      ', '       ' LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', SUM(Col4) '', '     ' '', '      ' '', '       ' '', ' 
    ' ''"),
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT 'TOTAL', ' ', '  ', '   ', '    ', '     ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) LABEL 'TOTAL' '', ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''"));
{"", "", "", "", "", "", "", "", "", ""};
{"BY ASSET TYPE", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT ' ', '  ', Col2, '   ', '    ', '     ', SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col2 ORDER BY Col2 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");{"", "", "", "", "", "", "", "", "", ""};
{"BY ASSET", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", 0, 0, 0, 0};QUERY(${referenceRangeName1}, "SELECT E, F, I, L, M, N")}, "SELECT ' ', Col1, Col2, SUM(Col3), SUM(Col4) / SUM(Col3), SUM(Col5) / SUM(Col3), SUM(Col4), SUM(Col5), SUM(Col6), SUM(Col6) / SUM(Col4) GROUP BY Col1, Col2 ORDER BY Col2, Col1 OFFSET 1 LABEL ' ' '', SUM(Col3) '', SUM(Col4) / SUM(Col3) '', SUM(Col5) / SUM(Col3) '', SUM(Col4) '', SUM(Col5) '', SUM(Col6) '', SUM(Col6) / SUM(Col4) ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};QUERY(${referenceRangeName2}, "SELECT A, B, C, D, E, F")}, "SELECT Col1, ' ', '  ', '   ', '    ', '     ', '      ', SUM(Col6), '       ', '        ' GROUP BY Col1 ORDER BY Col1 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', '      ' '', '       ' '', '        ' ''");
{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET TYPE", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};QUERY(${referenceRangeName2}, "SELECT A, B, C, D, E, F")}, "SELECT Col1, ' ', Col3, '  ', '   ', '    ', '     ', SUM(Col6), '      ', '       ' GROUP BY Col1, Col3 ORDER BY Col1, Col3 OFFSET 1 LABEL ' ' '', '  ' '', '   ' '', '    ' '', '     ' '', SUM(Col6) '', '      ' '', '       ' ''");{"", "", "", "", "", "", "", "", "", ""};
{"BY WALLET AND ASSET", "", "", "", "", "", "", "", "", ""};
QUERY({{"", "", "", 0, 0, 0};QUERY(${referenceRangeName2}, "SELECT A, B, C, D, E, F")}, "SELECT Col1, Col2, Col3, SUM(Col4), ' ', SUM(Col6) / SUM(Col4), '  ', SUM(Col6), '   ', '    ' GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col3, Col2 OFFSET 1 LABEL SUM(Col4) '', ' ' '', SUM(Col6) / SUM(Col4) '', '  ' '', SUM(Col6) '', '   ' '', '    ' ''")
})`, , , , , , , , , ,
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT I"))=0,,QUERY(${referenceRangeName1}, "SELECT E, SUM(M) GROUP BY E ORDER BY E LABEL SUM(M) ''"))`
  ]];

  sheet.getRange('A2:K2').setFormulas(formulas);

  sheet.hideColumns(11, 2);

  this.trimColumns(sheet, 19);

  let pieChartBuilder = sheet.newChart().asPieChart();
  let chart = pieChartBuilder
    .addRange(sheet.getRange('K2:L1000'))
    .setNumHeaders(0)
    .setTitle('Value')
    .setPosition(1, 13, 30, 30)
    .build();

  sheet.insertChart(chart);

  sheet.autoResizeColumns(1, 12);
};
