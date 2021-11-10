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

  const referenceRangeName1 = this.openPositionsRangeName;
  const referenceRangeName2 = this.closedPositionsRangeName;

  let headers = [
    [
      'Open Positions', , , , , ,
      'Closed Positions', , , , , , , , ,
    ],
    [
      'Chart A', , , 'Chart B', , , 'Chart C', , , 'Chart D', , , 'Chart E', , ,
    ],
    [
      'Asset Type',
      'Current Value',
      'Unrealized P/L %',
      'Asset',
      'Current Value',
      'Unrealized P/L %',
      'Asset Type',
      'Proceeds',
      'Realized P/L',
      'Asset',
      'Proceeds',
      'Realized P/L',
      'Year',
      'Proceeds',
      'Realized P/L'
    ]
  ];

  sheet.getRange('A1:O3').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(3);

  sheet.getRange('A1:F1').mergeAcross();
  sheet.getRange('G1:O1').mergeAcross();

  sheet.getRange('A2:C2').mergeAcross();
  sheet.getRange('D2:F2').mergeAcross();
  sheet.getRange('G2:I2').mergeAcross();
  sheet.getRange('J2:L2').mergeAcross();
  sheet.getRange('M2:O2').mergeAcross();

  sheet.getRange('A4:A').setNumberFormat('@');
  sheet.getRange('B4:B').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('C4:C').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  sheet.getRange('D4:D').setNumberFormat('@');
  sheet.getRange('E4:E').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('F4:F').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

  sheet.getRange('G4:G').setNumberFormat('@');
  sheet.getRange('H4:H').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('I4:I').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

  sheet.getRange('J4:J').setNumberFormat('@');
  sheet.getRange('K4:K').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('L4:L').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

  sheet.getRange('N4:N').setNumberFormat('#,##0.00;(#,##0.00)');
  sheet.getRange('O4:O').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');

  const formulas = [[
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT P"))=0,,QUERY(${referenceRangeName1}, "SELECT I, SUM(Q), SUM(R) / SUM(O) GROUP BY I ORDER BY I LABEL SUM(Q) '', SUM(R) / SUM(O)  ''"))`, , ,
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT P"))=0,,QUERY(${referenceRangeName1}, "SELECT H, SUM(Q), SUM(R) / SUM(O) GROUP BY H ORDER BY H LABEL SUM(Q) '', SUM(R) / SUM(O)  ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT I, SUM(W), SUM(X) GROUP BY I ORDER BY I LABEL SUM(W) '', SUM(X) ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT H, SUM(W), SUM(X) GROUP BY H ORDER BY H LABEL SUM(W) '', SUM(X) ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT YEAR(L), SUM(W), SUM(X) GROUP BY YEAR(L) ORDER BY YEAR(L) LABEL YEAR(L) '', SUM(W) '', SUM(X) ''"))`
  ]];

  sheet.getRange('A4:M4').setFormulas(formulas);

  sheet.hideSheet();

  sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  ss.setNamedRange(this.chartRange1Name, sheet.getRange('A3:C'));
  ss.setNamedRange(this.chartRange2Name, sheet.getRange('D3:F'));
  ss.setNamedRange(this.chartRange3Name, sheet.getRange('G3:I'));
  ss.setNamedRange(this.chartRange4Name, sheet.getRange('J3:L'));
  ss.setNamedRange(this.chartRange5Name, sheet.getRange('M3:O'));

  this.trimColumns(sheet, 15);

  sheet.autoResizeColumns(1, 15);
};