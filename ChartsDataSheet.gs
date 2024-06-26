/**
 * Creates the charts data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.chartsDataSheet = function (sheetName = this.chartsDataSheetName) {

  const version = '4';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

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
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0,,QUERY(${referenceRangeName1}, "SELECT J, SUM(R), SUM(S) / SUM(Q) GROUP BY J ORDER BY J LABEL SUM(R) '', SUM(S) / SUM(Q)  ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0,,QUERY(${referenceRangeName1}, "SELECT J, I, SUM(R), SUM(S) / SUM(Q) GROUP BY J, I ORDER BY J, I LABEL SUM(R) '', SUM(S) / SUM(Q)  ''"))`, , , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT U WHERE N='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT J, SUM(Y), SUM(Z) WHERE N='Trade' GROUP BY J ORDER BY J LABEL SUM(Y) '', SUM(Z) ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT U WHERE N='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT YEAR(M), SUM(Y), SUM(Z) WHERE YEAR(M)>"&YEAR(TODAY())-5&" AND N='Trade' GROUP BY YEAR(M) ORDER BY YEAR(M) LABEL YEAR(M) '', SUM(Y) '', SUM(Z) ''"))`
    ]];

    sheet.getRange('A4:K4').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.chartRange1Name, sheet.getRange('A3:C'));
    ss.setNamedRange(this.chartRange2Name, sheet.getRange('D3:G'));
    ss.setNamedRange(this.chartRange3Name, sheet.getRange('H3:J'));
    ss.setNamedRange(this.chartRange4Name, sheet.getRange('K3:M'));

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 13);
};