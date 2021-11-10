/**
 * Creates the uk charts data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukChartsDataSheet = function (sheetName = this.ukChartsDataSheetName) {

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

  const referenceRangeName1 = this.ukOpenPoolsRangeName;
  const referenceRangeName2 = this.ukClosedPositionsRangeName;

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
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT K"))=0,,QUERY(${referenceRangeName1}, "SELECT F, SUM(M), SUM(N) / SUM(L) GROUP BY F ORDER BY F LABEL SUM(M) '', SUM(N) / SUM(L)  ''"))`, , ,
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT K"))=0,,QUERY(${referenceRangeName1}, "SELECT E, SUM(M), SUM(N) / SUM(L) GROUP BY E ORDER BY E LABEL SUM(M) '', SUM(N) / SUM(L)  ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT G, SUM(T), SUM(U) WHERE O='Trade' GROUP BY G ORDER BY G LABEL SUM(T) '', SUM(U) ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT F, SUM(T), SUM(U) WHERE O='Trade' GROUP BY F ORDER BY F LABEL SUM(T) '', SUM(U) ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT YEAR(J), SUM(T), SUM(U) WHERE O='Trade' GROUP BY YEAR(J) ORDER BY YEAR(J) LABEL YEAR(J) '', SUM(T) '', SUM(U) ''"))`
  ]];

  sheet.getRange('A4:M4').setFormulas(formulas);

  sheet.hideSheet();

  sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  ss.setNamedRange(this.ukChartRange1Name, sheet.getRange('A3:C'));
  ss.setNamedRange(this.ukChartRange2Name, sheet.getRange('D3:F'));
  ss.setNamedRange(this.ukChartRange3Name, sheet.getRange('G3:I'));
  ss.setNamedRange(this.ukChartRange4Name, sheet.getRange('J3:L'));
  ss.setNamedRange(this.ukChartRange5Name, sheet.getRange('M3:O'));

  this.trimColumns(sheet, 15);

  sheet.autoResizeColumns(1, 15);
};