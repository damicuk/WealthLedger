/**
 * Creates the charts data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.chartsDataSheet = function (sheetName = this.chartsDataSheetName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    this.trimColumns(sheet, 17);

    const referenceRangeName1 = this.openRangeName;
    const referenceRangeName2 = this.closedRangeName;

    let headers = [
      [
        'Open', , , , , , ,
        'Closed', , , , , , , , , ,
      ],
      [
        'Chart A', , , 'Chart B', , , , 'Chart C', , , 'Chart D', , , , 'Chart E', , ,
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
        'Asset Type',
        'Asset',
        'Proceeds',
        'Realized P/L',
        'Year',
        'Proceeds',
        'Realized P/L'
      ]
    ];

    sheet.getRange('A1:Q3').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(3);

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('H1:Q1').mergeAcross();

    sheet.getRange('A2:C2').mergeAcross();
    sheet.getRange('D2:G2').mergeAcross();
    sheet.getRange('H2:J2').mergeAcross();
    sheet.getRange('K2:N2').mergeAcross();
    sheet.getRange('O2:Q2').mergeAcross();

    sheet.getRange('A4:A').setNumberFormat('@');
    sheet.getRange('B4:B').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('C4:C').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    sheet.getRange('D4:E').setNumberFormat('@');
    sheet.getRange('F4:F').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('G4:G').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    sheet.getRange('H4:H').setNumberFormat('@');
    sheet.getRange('I4:I').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('J4:J').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

    sheet.getRange('K4:L').setNumberFormat('@');
    sheet.getRange('M4:M').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('N4:N').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

    sheet.getRange('P4:P').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('Q4:Q').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

    const formulas = [[
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0,,QUERY(${referenceRangeName1}, "SELECT J, SUM(R), SUM(S) / SUM(Q) GROUP BY J ORDER BY J LABEL SUM(R) '', SUM(S) / SUM(Q)  ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT N"))=0,,QUERY(${referenceRangeName1}, "SELECT J, I, SUM(R), SUM(S) / SUM(Q) GROUP BY J, I ORDER BY J, I LABEL SUM(R) '', SUM(S) / SUM(Q)  ''"))`, , , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT U WHERE N='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT J, SUM(Y), SUM(Z) WHERE N='Trade' GROUP BY J ORDER BY J LABEL SUM(Y) '', SUM(Z) ''"))`, , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT U WHERE N='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT J, I, SUM(Y), SUM(Z) WHERE N='Trade' GROUP BY J, I ORDER BY J, I LABEL SUM(Y) '', SUM(Z) ''"))`, , , ,
      `IF(COUNT(QUERY(${referenceRangeName2}, "SELECT U WHERE N='Trade'"))=0,,QUERY(${referenceRangeName2}, "SELECT YEAR(M), SUM(Y), SUM(Z) WHERE YEAR(M)>"&YEAR(TODAY())-5&" AND N='Trade' GROUP BY YEAR(M) ORDER BY YEAR(M) LABEL YEAR(M) '', SUM(Y) '', SUM(Z) ''"))`
    ]];

    sheet.getRange('A4:O4').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.chartRange1Name, sheet.getRange('A3:C'));
    ss.setNamedRange(this.chartRange2Name, sheet.getRange('D3:G'));
    ss.setNamedRange(this.chartRange3Name, sheet.getRange('H3:J'));
    ss.setNamedRange(this.chartRange4Name, sheet.getRange('K3:N'));
    ss.setNamedRange(this.chartRange5Name, sheet.getRange('O3:Q'));

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 17);
};