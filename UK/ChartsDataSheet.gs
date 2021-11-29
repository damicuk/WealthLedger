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
      'Open Positions', , , , , , ,
      'Closed Positions', , , , , , , , , ,
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

  sheet.getRange('A1:Q3').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
  sheet.setFrozenRows(3);

  sheet.getRange('A1:G1').mergeAcross();
  sheet.getRange('H1:Q1').mergeAcross();

  sheet.getRange('A2:C2').mergeAcross();
  sheet.getRange('D2:G2').mergeAcross();
  sheet.getRange('H2:J2').mergeAcross();
  sheet.getRange('K2:M2').mergeAcross();
  sheet.getRange('O2:P2').mergeAcross();

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
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT K"))=0,,QUERY(${referenceRangeName1}, "SELECT F, SUM(M), SUM(N) / SUM(L) GROUP BY F ORDER BY F LABEL SUM(M) '', SUM(N) / SUM(L)  ''"))`, , ,
    `IF(COUNT(QUERY(${referenceRangeName1}, "SELECT K"))=0,,QUERY(${referenceRangeName1}, "SELECT F, E, SUM(M), SUM(N) / SUM(L) GROUP BY F, E ORDER BY F, E LABEL SUM(M) '', SUM(N) / SUM(L)  ''"))`, , , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT G, SUM(T), SUM(U) WHERE O='Trade' GROUP BY G ORDER BY G LABEL SUM(T) '', SUM(U) ''"))`, , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT G, F, SUM(T), SUM(U) WHERE O='Trade' GROUP BY G, F ORDER BY G, F LABEL SUM(T) '', SUM(U) ''"))`, , , ,
    `IF(ISBLANK(INDEX(${referenceRangeName2}, 1, 1)),,QUERY(${referenceRangeName2}, "SELECT YEAR(J), SUM(T), SUM(U) WHERE O='Trade' AND YEAR(J)>"&YEAR(TODAY())-5&" GROUP BY YEAR(J) ORDER BY YEAR(J) LABEL YEAR(J) '', SUM(T) '', SUM(U) ''"))`
  ]];

  sheet.getRange('A4:O4').setFormulas(formulas);

  sheet.hideSheet();

  sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  ss.setNamedRange(this.ukChartRange1Name, sheet.getRange('A3:C'));
  ss.setNamedRange(this.ukChartRange2Name, sheet.getRange('D3:G'));
  ss.setNamedRange(this.ukChartRange3Name, sheet.getRange('H3:J'));
  ss.setNamedRange(this.ukChartRange4Name, sheet.getRange('K3:N'));
  ss.setNamedRange(this.ukChartRange5Name, sheet.getRange('O3:Q'));

  this.trimColumns(sheet, 17);

  sheet.autoResizeColumns(1, 17);
};