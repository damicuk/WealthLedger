/**
 * Creates the charts data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.chartsDataSheet = function (sheetName = this.chartsDataSheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = this.insertSheet(sheetName);

    this.trimColumns(sheet, 13);

    const referenceRangeName1 = this.openRangeName;
    const referenceRangeName2 = this.closedRangeName;

    let headers = [
      [
        'Open', , , , , , ,
        'Closed', , , , , ,
      ],
      [
        'Chart A', , , 'Chart B', , , , 'Chart C', , , 'Chart D', , ,
      ],
      [
        'Asset Type',
        'Current Value',
        'Unrealized P/L %',
        'Asset Type',
        'Asset',
        'Current Value',
        'Unrealized P/L %',
        'Asset Type',
        'Proceeds',
        'Realized P/L',
        'Year',
        'Proceeds',
        'Realized P/L'
      ]
    ];

    sheet.getRange('A1:M3').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(3);

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('H1:M1').mergeAcross();

    sheet.getRange('A2:C2').mergeAcross();
    sheet.getRange('D2:G2').mergeAcross();
    sheet.getRange('H2:J2').mergeAcross();
    sheet.getRange('K2:M2').mergeAcross();

    sheet.getRange('A4:A').setNumberFormat('@');
    sheet.getRange('B4:B').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('C4:C').setNumberFormat('0.0%');

    sheet.getRange('D4:E').setNumberFormat('@');
    sheet.getRange('F4:F').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('G4:G').setNumberFormat('0.0%');

    sheet.getRange('H4:H').setNumberFormat('@');
    sheet.getRange('I4:J').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.getRange('L4:M').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT L"))=0,,QUERY(${referenceRangeName1}, "SELECT H, SUM(P), SUM(Q) / SUM(O) GROUP BY H ORDER BY H LABEL SUM(P) '', SUM(Q) / SUM(O)  ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT L"))=0,,QUERY(${referenceRangeName1}, "SELECT H, G, SUM(P), SUM(Q) / SUM(O) GROUP BY H, G ORDER BY H, G LABEL SUM(P) '', SUM(Q) / SUM(O)  ''"))`, , , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT Q WHERE L='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT H, SUM(U), SUM(V) WHERE L='Trade' GROUP BY H ORDER BY H LABEL SUM(U) '', SUM(V) ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT Q WHERE L='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT YEAR(K), SUM(U), SUM(V) WHERE YEAR(K)>"&QUERY(${referenceRangeName2}, "SELECT YEAR(MAX(K))-5 LABEL YEAR(MAX(K))-5 ''")&" AND L='Trade' GROUP BY YEAR(K) ORDER BY YEAR(K) LABEL YEAR(K) '', SUM(U) '', SUM(V) ''"))`
    ]];

    sheet.getRange('A4:K4').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.chartRange1Name, sheet.getRange('A3:C'));
    ss.setNamedRange(this.chartRange2Name, sheet.getRange('D3:G'));
    ss.setNamedRange(this.chartRange3Name, sheet.getRange('H3:J'));
    ss.setNamedRange(this.chartRange4Name, sheet.getRange('K3:M'));

    this.setSheetVersion(sheet, this.reportsVersion);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 13);
};