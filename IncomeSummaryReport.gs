/**
 * Creates the income summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
AssetTracker.prototype.incomeSummaryReport = function () {

  const sheetName = this.incomeSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.incomeRangeName;

  let headers = [
    [
      'Year',
      'Crypto',
      'Amount',
      'Income Value'
    ]
  ];

  sheet.getRange('A1:D1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{QUERY(${referenceRangeName}, "SELECT YEAR(A), D, SUM(G), SUM(I) GROUP BY D, YEAR(A) ORDER BY YEAR(A), D LABEL YEAR(A) '', SUM(G) '', SUM(I) ''");
{QUERY(${referenceRangeName}, "SELECT YEAR(A), 'SUBTOTAL', ' ', SUM(I) GROUP BY YEAR(A) ORDER BY YEAR(A) LABEL YEAR(A) '', 'SUBTOTAL' '', ' ' '', SUM(I) ''")};
{"","TOTAL","",QUERY(${referenceRangeName}, "SELECT SUM(I) LABEL SUM(I) ''")}})`, , , ,
  ]];

  sheet.getRange('A2:D2').setFormulas(formulas);

  this.trimColumns(sheet, 4);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};