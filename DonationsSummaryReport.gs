/**
 * Creates the donations summary report if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 */
AssetTracker.prototype.donationsSummaryReport = function () {

  const sheetName = this.donationsSummaryReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return;

  }

  sheet = ss.insertSheet(sheetName);

  const referenceRangeName = this.donationsRangeName;

  let headers = [
    [
      'Year',
      'Crypto',
      'Amount',
      'Cost Basis',
      'Donation Value'
    ]
  ];

  sheet.getRange('A1:E1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  sheet.getRange('B2:B').setNumberFormat('@');
  sheet.getRange('C2:C').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
  sheet.getRange('D2:D').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('E2:E').setNumberFormat('#,##0.00;(#,##0.00)');

  const formulas = [[
    `IF(ISBLANK(INDEX(${referenceRangeName}, 1, 1)),,{QUERY(${referenceRangeName}, "SELECT YEAR(L), H, SUM(O), SUM(R), SUM(S) GROUP BY YEAR(L), H ORDER BY YEAR(L), H LABEL YEAR(L) '', SUM(O) '', SUM(R) '', SUM(S) ''");
{QUERY(${referenceRangeName}, "SELECT YEAR(L), 'SUBTOTAL', ' ', SUM(R), SUM(S) GROUP BY YEAR(L) ORDER BY YEAR(L) LABEL YEAR(L) '', 'SUBTOTAL' '', ' ' '', SUM(R) '', SUM(S) ''")};
{"","TOTAL","",QUERY(${referenceRangeName}, "SELECT SUM(R), SUM(S) LABEL SUM(R) '', SUM(S) ''")}})`, , , , ,
  ]];

  sheet.getRange('A2:E2').setFormulas(formulas);

  this.trimColumns(sheet, 5);

  sheet.autoResizeColumns(1, sheet.getMaxColumns());
};