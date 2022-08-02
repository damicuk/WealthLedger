/**
 * Creates the investments data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.investmentsDataSheet = function (sheetName = this.investmentsDataSheetName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    const assetsRangeName = this.assetsRangeName;
    const openRangeName = this.openRangeName;
    const closedRangeName = this.closedRangeName;
    const incomeRangeName = this.incomeRangeName;

    sheet.clear();

    this.trimColumns(sheet, 52);

    let headers = [
      [
        'Asset List',
        'Price Range Data', , , , , , , , , , , , , , , ,
        'Investment by Date and Asset', , , , , ,
        'Investment by Asset', , , , , , ,
        'Asset Type: Net Investment vs Current Value', , , , ,
        'Selected Asset: Net Investment vs Current Value', , , ,
        'Selected Asset: Total Units and Net Investment Timeline', , , , , ,
        'Investment by Date and Asset Type', , , , ,
        'Asset Type: Net Investment Timeline', , , , , ,
      ],
      [
        ,
        'Current Price',
        'Min Price',
        'Max Price',
        'Decile',
        'Price From',
        'Price To',
        'Price Range',
        'Purchased Units',
        'Purchased Cost Basis',
        'Income Units',
        'Income Cost Basis',
        'Disposed Units',
        'Disposed Cost Basis',
        'Net Units',
        'Net Cost Basis', ,
        'Date',
        'Asset',
        'Asset Type',
        'Units',
        'Cost', ,
        'Asset',
        'Asset Type',
        'Units',
        'Net Investment',
        'Current Price',
        'Current Value', ,
        'Asset Type',
        'Net Investment',
        'Current Value',
        'Profit', ,
        'Net Investment',
        'Current Value',
        'Profit', ,
        'Date',
        'Units',
        'Cost',
        'Total Units',
        'Net Investment', ,
        'Date',
        'Asset Type',
        'Cost',
        'Net Investment', , , , , , , ,
      ]
    ];

    sheet.getRange('A1:BD2').setValues(headers);
    sheet.getRange('A1:2').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('B1:P1').mergeAcross();
    sheet.getRange('R1:V1').mergeAcross();
    sheet.getRange('X1:AC1').mergeAcross();
    sheet.getRange('AE1:AH1').mergeAcross();
    sheet.getRange('AJ1:AL1').mergeAcross();
    sheet.getRange('AN1:AR1').mergeAcross();
    sheet.getRange('AT1:AW1').mergeAcross();
    sheet.getRange('AY1:BD1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('@');
    sheet.getRange('B3:D').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('E3:E').setNumberFormat('0');
    sheet.getRange('F3:H').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`I3:I`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('J3:J').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`K3:K`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('L3:L').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`M3:M`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('N3:N').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`O3:O`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('P3:P').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('Q3:Q').setNumberFormat('@');
    sheet.getRange('R3:R').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('S3:T').setNumberFormat('@');
    sheet.getRange(`U3:U`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('V3:V').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('W3:Y').setNumberFormat('@');
    sheet.getRange(`Z3:Z`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AA3:AC').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AD3:AE').setNumberFormat('@');
    sheet.getRange('AF3:AH').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AI3:AI').setNumberFormat('@');
    sheet.getRange('AJ3:AL').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AM3:AM').setNumberFormat('@');
    sheet.getRange('AN3:AN').setNumberFormat('yyyy-mm-dd');
    sheet.getRange(`AO3:AO`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AP3:AP').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`AQ3:AQ`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AR3:AR').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AS3:AS').setNumberFormat('@');
    sheet.getRange('AT3:AT').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('AU3:AU').setNumberFormat('@');
    sheet.getRange('AV3:AW').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AX3:AX').setNumberFormat('@');
    sheet.getRange('AY3:AY').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('AZ3:BD').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas1 = [[
      `QUERY(${assetsRangeName}, "SELECT A WHERE B<>'Fiat Base' AND B<> 'Fiat' ORDER BY A")`,

      `IF(LEN('Asset Explorer'!$B$1),QUERY(${assetsRangeName}, "SELECT D WHERE A='"&'Asset Explorer'!$B$1&"' LABEL D ''"),)`,

      `IF(NOT(LEN('Asset Explorer'!$B$1)),,
IF(AND(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income')"))=0, COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"'"))=0),,
QUERY(
{
QUERY(${openRangeName}, "SELECT MIN(O) WHERE I='"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MIN(O) ''");
QUERY(${closedRangeName}, "SELECT MIN(V) WHERE I='"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MIN(V) ''");
QUERY(${closedRangeName}, "SELECT MIN(W) WHERE I='"&'Asset Explorer'!$B$1&"' LABEL MIN(W) ''")
}, "SELECT MIN(Col1) LABEL MIN(Col1) ''")))`,

      `IF(NOT(LEN('Asset Explorer'!$B$1)),,
IF(AND(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income')"))=0, COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"'"))=0),,
QUERY(
{
QUERY(${openRangeName}, "SELECT MAX(O) WHERE I='"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MAX(O) ''");
QUERY(${closedRangeName}, "SELECT MAX(V) WHERE I='"&'Asset Explorer'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MAX(V) ''");
QUERY(${closedRangeName}, "SELECT MAX(W) WHERE I='"&'Asset Explorer'!$B$1&"' LABEL MAX(W) ''")
}, "SELECT MAX(Col1) LABEL MAX(Col1) ''")))`
    ]];

    sheet.getRange('A3:D3').setFormulas(formulas1);

    const decileLabels = [[`Single Price`], [`1`], [`2`], [`3`], [`4`], [`5`], [`6`], [`7`], [`8`], [`9`], [`10`]];

    sheet.getRange('E3:E13').setValues(decileLabels);

    const formulas2 = [
      [ //Single Price
        `IF(C3=D3,C3,)`,

        `F3`,

        `TEXTJOIN(" - ", true, F3, G3)`,

        `IF(ISBLANK($F$3),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$3),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$3),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"'"))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$3),,I3+K3+M3)`,

        `IF(ISBLANK($F$3),,J3+L3+N3)`

      ],
      [ //Decile 1
        `IF(C3=D3,,C3)`,

        `F5`,

        `TEXTJOIN(" - ", true, F4, G4)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O < "&F5&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O < "&F5&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V < "&F5&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V < "&F5&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O < "&F5&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O < "&F5&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V < "&F5&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V < "&F5&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W < "&F5))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W < "&F5&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I4+K4+M4)`,

        `IF(ISBLANK($F$4),,J4+L4+N4)`
      ],

      [ //Decile 2
        `IF(C3=D3,,C3+0.1*(D3-C3))`,

        `F6`,

        `TEXTJOIN(" - ", true, F5, G5)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F5&" AND O < "&F6&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F5&" AND O < "&F6&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F5&" AND V < "&F6&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F5&" AND V < "&F6&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F5&" AND O < "&F6&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F5&" AND O < "&F6&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F5&" AND V < "&F6&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F5&" AND V < "&F6&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F5&" AND W < "&F6))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F5&" AND W < "&F6&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I5+K5+M5)`,

        `IF(ISBLANK($F$4),,J5+L5+N5)`
      ],

      [ //Decile 3
        `IF(C3=D3,,C3+0.2*(D3-C3))`,

        `F7`,

        `TEXTJOIN(" - ", true, F6, G6)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F6&" AND W < "&F7))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F6&" AND W < "&F7&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I6+K6+M6)`,

        `IF(ISBLANK($F$4),,J6+L6+N6)`
      ],

      [ //Decile 4
        `IF(C3=D3,,C3+0.3*(D3-C3))`,

        `F8`,

        `TEXTJOIN(" - ", true, F7, G7)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F7&" AND W < "&F8))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F7&" AND W < "&F8&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I7+K7+M7)`,

        `IF(ISBLANK($F$4),,J7+L7+N7)`
      ],

      [ //Decile 5
        `IF(C3=D3,,C3+0.4*(D3-C3))`,

        `F9`,

        `TEXTJOIN(" - ", true, F8, G8)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F8&" AND W < "&F9))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F8&" AND W < "&F9&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I8+K8+M8)`,

        `IF(ISBLANK($F$4),,J8+L8+N8)`
      ],

      [ //Decile 6
        `IF(C3=D3,,C3+0.5*(D3-C3))`,

        `F10`,

        `TEXTJOIN(" - ", true, F9, G9)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F9&" AND W < "&F10))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F9&" AND W < "&F10&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I9+K9+M9)`,

        `IF(ISBLANK($F$4),,J9+L9+N9)`
      ],

      [ //Decile 7
        `IF(C3=D3,,C3+0.6*(D3-C3))`,

        `F11`,

        `TEXTJOIN(" - ", true, F10, G10)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F10&" AND W < "&F11))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F10&" AND W < "&F11&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I10+K10+M10)`,

        `IF(ISBLANK($F$4),,J10+L10+N10)`
      ],

      [ //Decile 8
        `IF(C3=D3,,C3+0.7*(D3-C3))`,

        `F12`,

        `TEXTJOIN(" - ", true, F11, G11)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F11&" AND W < "&F12))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F11&" AND W < "&F12&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I11+K11+M11)`,

        `IF(ISBLANK($F$4),,J11+L11+N11)`
      ],

      [ //Decile 9
        `IF(C3=D3,,C3+0.8*(D3-C3))`,

        `F13`,

        `TEXTJOIN(" - ", true, F12, G12)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F12&" AND W < "&F13))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F12&" AND W < "&F13&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I12+K12+M12)`,

        `IF(ISBLANK($F$4),,J12+L12+N12)`
      ],

      [ //Decile 10
        `IF(C3=D3,,C3+0.9*(D3-C3))`,

        `IF(C3=D3,,D3)`,

        `TEXTJOIN(" - ", true, F13, G13)`,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F13&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F13&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F13&" AND B = 'Trade'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F13&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F13&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Asset Explorer'!$B$1&"' AND O >= "&F13&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F13&" AND B = 'Income'"))=0,
{0, 0},
QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Asset Explorer'!$B$1&"' AND V >= "&F13&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

}, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
)`, ,

        `IF(ISBLANK($F$4),,
IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F13))=0,{0, 0},
QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Asset Explorer'!$B$1&"' AND W >= "&F13&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`, ,

        `IF(ISBLANK($F$4),,I13+K13+M13)`,

        `IF(ISBLANK($F$4),,J13+L13+N13)`
      ]
    ];

    sheet.getRange('F3:P13').setFormulas(formulas2);

    const formulas3 = [[
      `{
QUERY({
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
QUERY(${openRangeName}, "SELECT toDate(A), I, J, N, Q LABEL toDate(A) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE N='Trade'"))=0,{"", "", "", 0, 0},
{
QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X WHERE N='Trade' LABEL toDate(A) ''");
QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y WHERE N='Trade' LABEL toDate(M) '', 0-U '', 0-Y ''")
});

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NULL AND F<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), E, F, 0, 0-J WHERE C IS NULL AND F<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"));

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NOT NULL AND D<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), C, D, 0, 0-J WHERE C IS NOT NULL AND D<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"))

}, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5) WHERE Col2 IS NOT NULL GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col2, Col3 LABEL SUM(Col4) '', SUM(Col5) ''")
}, "SELECT Col1, Col2, Col3"),
ARRAYFORMULA(ROUND(QUERY({
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
QUERY(${openRangeName}, "SELECT toDate(A), I, J, N, Q LABEL toDate(A) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE N='Trade'"))=0,{"", "", "", 0, 0},
{
QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X WHERE N='Trade' LABEL toDate(A) ''");
QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y WHERE N='Trade' LABEL toDate(M) '', 0-U '', 0-Y ''")
});

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NULL AND F<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), E, F, 0, 0-J WHERE C IS NULL AND F<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"));

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NOT NULL AND D<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), C, D, 0, 0-J WHERE C IS NOT NULL AND D<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"))

}, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5) WHERE Col2 IS NOT NULL GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col2, Col3 LABEL SUM(Col4) '', SUM(Col5) ''")
}, "SELECT Col4"), 8)),
ARRAYFORMULA(ROUND(QUERY({
QUERY({

IF(COUNT(QUERY(${openRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
QUERY(${openRangeName}, "SELECT toDate(A), I, J, N, Q LABEL toDate(A) ''"));

IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE N='Trade'"))=0,{"", "", "", 0, 0},
{
QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X WHERE N='Trade' LABEL toDate(A) ''");
QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y WHERE N='Trade' LABEL toDate(M) '', 0-U '', 0-Y ''")
});

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NULL AND F<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), E, F, 0, 0-J WHERE C IS NULL AND F<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"));

IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NOT NULL AND D<>'Fiat'"))=0,{"", "", "", 0, 0},
QUERY(${incomeRangeName}, "SELECT toDate(A), C, D, 0, 0-J WHERE C IS NOT NULL AND D<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"))

}, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5) WHERE Col2 IS NOT NULL GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col2, Col3 LABEL SUM(Col4) '', SUM(Col5) ''")
}, "SELECT Col5"), 2))
}`, , , , , ,

      `{
QUERY({QUERY(ARRAYFORMULA(FILTER(R3:V, LEN(R3:R))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col1, Col2"),
ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(R3:V, LEN(R3:R))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col3"), 8)),
ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(R3:V, LEN(R3:R))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col4"), 2))
}`, , , ,

      `IF(ISBLANK(X3),,ArrayFormula(FILTER(IFNA(VLOOKUP(X3:X, QUERY(${assetsRangeName}, "SELECT A, D"), 2, FALSE),), LEN(X3:X))))`,

      `ArrayFormula(FILTER(ROUND(Z3:Z*AB3:AB, 2), LEN(X3:X)))`, ,

      `{
QUERY(ARRAYFORMULA(FILTER(X3:AC, LEN(X3:X))), "SELECT Col2, SUM(Col4), SUM(Col6) GROUP BY Col2 ORDER BY Col2 LABEL SUM(Col4) '', SUM(Col6) ''");
QUERY(ARRAYFORMULA(FILTER(X3:AC, LEN(X3:X))), "SELECT 'Total', SUM(Col4), SUM(Col6) LABEL 'Total' '', SUM(Col4) '', SUM(Col6) ''")
}`, , ,

      `ArrayFormula(IF(ISBLANK(AE3:AE),,FILTER(AG3:AG-AF3:AF, LEN(AE3:AE))))`, ,

      `QUERY(ARRAYFORMULA(FILTER(X3:AC, LEN(X3:X))), "SELECT Col4, Col6 WHERE Col1='"&'Asset Explorer'!$B$1&"'")`, ,

      `AK3-AJ3`, ,

      `QUERY(ARRAYFORMULA(FILTER(R3:V, LEN(R3:R))), "SELECT Col1, Col4, Col5 WHERE Col2='"&'Asset Explorer'!$B$1&"' ORDER BY Col1")`, , ,

      `ARRAYFORMULA(IF(LEN(AO3:AO),ROUND(SUMIF(ROW(AO3:AO),"<="&ROW(AO3:AO),AO3:AO),8),))`,

      `ARRAYFORMULA(IF(LEN(AP3:AP),ROUND(SUMIF(ROW(AP3:AP),"<="&ROW(AP3:AP),AP3:AP),8),))`, ,

      `QUERY(
{
QUERY(FILTER(R3:V, LEN(R3:R)), "SELECT Col1, Col3, SUM(Col5) WHERE Col5<>0 GROUP BY Col1, Col3 ORDER BY Col1, Col3 LABEL SUM(Col5) ''");
QUERY(FILTER(R3:V, LEN(R3:R)), "SELECT Col1, 'Total', SUM(Col5) WHERE Col5<>0 GROUP BY Col1 ORDER BY Col1 LABEL 'Total' '', SUM(Col5) ''")
},
"SELECT * ORDER BY Col1, Col2")`, , ,

      `ARRAYFORMULA(
     IF(LEN(AV3:AV),
        MMULT(
           N(ROW(AU3:AU)>=TRANSPOSE(ROW(AU3:AU)))*N(AU3:AU=TRANSPOSE(AU3:AU)),
           N(AV3:AV)
        ),
     )
)`
    ]];

    sheet.getRange('R3:AW3').setFormulas(formulas3);

    const pivotFormula = `QUERY(FILTER(AT3:AW, LEN(AT3:AT)), "SELECT Col1, SUM(Col4) GROUP BY Col1 PIVOT Col2 LABEL Col1 'Date'")`;

    sheet.getRange('AY2').setFormula(pivotFormula);

    // sheet.hideSheet();

    // sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.investmentsRange2Name, sheet.getRange('R3:V'));
    // ss.setNamedRange(this.chartRange2Name, sheet.getRange('D3:G'));
    // ss.setNamedRange(this.chartRange3Name, sheet.getRange('H3:J'));
    // ss.setNamedRange(this.chartRange4Name, sheet.getRange('K3:N'));
    // ss.setNamedRange(this.chartRange5Name, sheet.getRange('O3:Q'));

    this.setSheetVersion(sheet, version);
  }

  // SpreadsheetApp.flush();
  // sheet.autoResizeColumns(1, 52);
};