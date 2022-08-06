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

    this.trimColumns(sheet, 70);

    let headers = [
      [, , , , , , , , , , , , , , ,
        'Investments Chart 5', , , , ,
        'Investments Chart 6', , , , ,
        'Investments Chart 7', , ,
        'Investments Chart 8', , , , , , , , , , , , , , , ,
        'Investments Chart 2', , , , ,
        'Investments Chart 3', , , , , ,
        'Investments Chart 4', , , , , , , , ,
        'Investments Chart 1', , , , , ,
      ],
      [
        'Asset List',
        'Price Range Data', , , , , , , , , , , , , ,
        'Selected Asset: Units x Price Range', , , , ,
        'Selected Asset: Cost x Price Range', , , , ,
        'Selected Asset: Net Units x Price Range', , ,
        'Selected Asset: Net Cost x Price Range	', , ,
        'Investment by Date and Asset', , , , , ,
        'Investment by Asset', , , , , , ,
        'Asset Type: Net Investment vs Current Value', , , , ,
        'Selected Asset: Total Units and Net Investment Timeline', , , , , ,
        'Selected Asset: Net Investment vs Current Value', , , ,
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
        'Disposed Cost Basis', ,
        'Price Range',
        'Purchased',
        'Income',
        'Disposed', ,
        'Price Range',
        'Purchased',
        'Income',
        'Disposed', ,
        'Price Range',
        'Net Units', ,
        'Price Range',
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
        'Units',
        'Cost',
        'Date',
        'Total Units',
        'Net Investment', ,
        'Net Investment',
        'Current Value',
        'Profit', ,
        'Date',
        'Asset Type',
        'Cost',
        'Net Investment', , , , , , , ,
      ]
    ];

    sheet.getRange('A1:BR3').setValues(headers);
    sheet.getRange('A1:3').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(3);

    sheet.getRange('B1:N1').mergeAcross();
    sheet.getRange('P1:S1').mergeAcross();
    sheet.getRange('U1:X1').mergeAcross();
    sheet.getRange('Z1:AA1').mergeAcross();
    sheet.getRange('AC1:AD1').mergeAcross();
    sheet.getRange('AF1:AJ1').mergeAcross();
    sheet.getRange('AL1:AQ1').mergeAcross();
    sheet.getRange('AS1:AV1').mergeAcross();
    sheet.getRange('AX1:BB1').mergeAcross();
    sheet.getRange('BD1:BF1').mergeAcross();
    sheet.getRange('BH1:BK1').mergeAcross();
    sheet.getRange('BM1:BR1').mergeAcross();

    sheet.getRange('B2:N2').mergeAcross();
    sheet.getRange('P2:S2').mergeAcross();
    sheet.getRange('U2:X2').mergeAcross();
    sheet.getRange('Z2:AA2').mergeAcross();
    sheet.getRange('AC2:AD2').mergeAcross();
    sheet.getRange('AF2:AJ2').mergeAcross();
    sheet.getRange('AL2:AQ2').mergeAcross();
    sheet.getRange('AS2:AV2').mergeAcross();
    sheet.getRange('AX2:BB2').mergeAcross();
    sheet.getRange('BD2:BF2').mergeAcross();
    sheet.getRange('BH2:BK2').mergeAcross();
    sheet.getRange('BM2:BR2').mergeAcross();

    sheet.getRange('A4:A').setNumberFormat('@');
    sheet.getRange('B4:D').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('E4:E').setNumberFormat('0');
    sheet.getRange('F4:H').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`I4:I`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('J4:J').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`K4:K`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('L4:L').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('M4:M').setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('N4:N').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('O4:O').setNumberFormat('@');
    sheet.getRange('P4:P').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('Q4:S').setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('T4:T').setNumberFormat('@');
    sheet.getRange('U4:X').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('Y4:Y').setNumberFormat('@');
    sheet.getRange('Z4:Z').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AA4:AA').setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AB4:AB').setNumberFormat('@');
    sheet.getRange('AC4:AD').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AE4:AE').setNumberFormat('@');

    sheet.getRange('AF4:AF').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('AG4:AH').setNumberFormat('@');
    sheet.getRange(`AI4:AI`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AJ4:AJ').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AK4:AM').setNumberFormat('@');
    sheet.getRange(`AN4:AN`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AO4:AQ').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AR4:AS').setNumberFormat('@');
    sheet.getRange('AT4:AV').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AW4:AW').setNumberFormat('@');
    sheet.getRange(`AX4:AX`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('AY4:AY').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('AZ4:AZ').setNumberFormat('yyyy-mm-dd');
    sheet.getRange(`BA4:BA`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('BB4:BB').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('BC4:BC').setNumberFormat('@');
    sheet.getRange('BD4:BF').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('BG4:BG').setNumberFormat('@');
    sheet.getRange('BH4:BH').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('BI4:BI').setNumberFormat('@');
    sheet.getRange('BJ4:BK').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('BL4:BL').setNumberFormat('@');
    sheet.getRange('BM4:BM').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('BN4:BR').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas1 = [[
      `QUERY(${assetsRangeName}, "SELECT A WHERE B<>'Fiat Base' AND B<> 'Fiat' ORDER BY A")`,

      `IF(LEN('Investments Report'!$B$1),QUERY(${assetsRangeName}, "SELECT D WHERE A='"&'Investments Report'!$B$1&"' LABEL D ''"),)`,

      `IF(NOT(LEN('Investments Report'!$B$1)),,
    IF(AND(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income')"))=0, COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"'"))=0),,
    QUERY(
    {
    QUERY(${openRangeName}, "SELECT MIN(O) WHERE I='"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MIN(O) ''");
    QUERY(${closedRangeName}, "SELECT MIN(V) WHERE I='"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MIN(V) ''");
    QUERY(${closedRangeName}, "SELECT MIN(W) WHERE I='"&'Investments Report'!$B$1&"' LABEL MIN(W) ''")
    }, "SELECT MIN(Col1) LABEL MIN(Col1) ''")))`,

      `IF(NOT(LEN('Investments Report'!$B$1)),,
    IF(AND(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income')"))=0, COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"'"))=0),,
    QUERY(
    {
    QUERY(${openRangeName}, "SELECT MAX(O) WHERE I='"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MAX(O) ''");
    QUERY(${closedRangeName}, "SELECT MAX(V) WHERE I='"&'Investments Report'!$B$1&"' AND (B = 'Trade' OR B = 'Income') LABEL MAX(V) ''");
    QUERY(${closedRangeName}, "SELECT MAX(W) WHERE I='"&'Investments Report'!$B$1&"' LABEL MAX(W) ''")
    }, "SELECT MAX(Col1) LABEL MAX(Col1) ''")))`
    ]];

    sheet.getRange('A4:D4').setFormulas(formulas1);

    const decileLabels = [[`Single Price`], [`1`], [`2`], [`3`], [`4`], [`5`], [`6`], [`7`], [`8`], [`9`], [`10`]];

    sheet.getRange('E4:E14').setValues(decileLabels);

    const formulas2 = [
      [ //Single Price
        `IF(C4=D4,C4,)`,

        `F4`,

        `TEXTJOIN(" - ", true, F4, G4)`,

        `IF(ISBLANK($F$4),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$4),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$4),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"'"))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 1
        `IF(C4=D4,,C4)`,

        `F6`,

        `TEXTJOIN(" - ", true, F5, G5)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O < "&F6&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O < "&F6&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V < "&F6&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V < "&F6&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O < "&F6&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O < "&F6&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V < "&F6&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V < "&F6&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W < "&F6))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W < "&F6&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 2
        `IF(C4=D4,,C4+0.1*(D4-C4))`,

        `F7`,

        `TEXTJOIN(" - ", true, F6, G6)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F6&" AND O < "&F7&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F6&" AND V < "&F7&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F6&" AND W < "&F7))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F6&" AND W < "&F7&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 3
        `IF(C4=D4,,C4+0.2*(D4-C4))`,

        `F8`,

        `TEXTJOIN(" - ", true, F7, G7)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F7&" AND O < "&F8&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F7&" AND V < "&F8&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F7&" AND W < "&F8))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F7&" AND W < "&F8&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 4
        `IF(C4=D4,,C4+0.3*(D4-C4))`,

        `F9`,

        `TEXTJOIN(" - ", true, F8, G8)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F8&" AND O < "&F9&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F8&" AND V < "&F9&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F8&" AND W < "&F9))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F8&" AND W < "&F9&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 5
        `IF(C4=D4,,C4+0.4*(D4-C4))`,

        `F10`,

        `TEXTJOIN(" - ", true, F9, G9)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F9&" AND O < "&F10&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F9&" AND V < "&F10&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F9&" AND W < "&F10))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F9&" AND W < "&F10&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 6
        `IF(C4=D4,,C4+0.5*(D4-C4))`,

        `F11`,

        `TEXTJOIN(" - ", true, F10, G10)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F10&" AND O < "&F11&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F10&" AND V < "&F11&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F10&" AND W < "&F11))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F10&" AND W < "&F11&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 7
        `IF(C4=D4,,C4+0.6*(D4-C4))`,

        `F12`,

        `TEXTJOIN(" - ", true, F11, G11)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F11&" AND O < "&F12&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F11&" AND V < "&F12&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F11&" AND W < "&F12))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F11&" AND W < "&F12&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 8
        `IF(C4=D4,,C4+0.7*(D4-C4))`,

        `F13`,

        `TEXTJOIN(" - ", true, F12, G12)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F12&" AND O < "&F13&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F12&" AND V < "&F13&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F12&" AND W < "&F13))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F12&" AND W < "&F13&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 9
        `IF(C4=D4,,C4+0.8*(D4-C4))`,

        `F14`,

        `TEXTJOIN(" - ", true, F13, G13)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F13&" AND O < "&F14&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F13&" AND O < "&F14&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F13&" AND V < "&F14&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F13&" AND V < "&F14&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F13&" AND O < "&F14&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F13&" AND O < "&F14&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F13&" AND V < "&F14&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F13&" AND V < "&F14&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F13&" AND W < "&F14))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F13&" AND W < "&F14&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ],

      [ //Decile 10
        `IF(C4=D4,,C4+0.9*(D4-C4))`,

        `IF(C4=D4,,D4)`,

        `TEXTJOIN(" - ", true, F14, G14)`,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F14&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F14&" AND B = 'Trade' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F14&" AND B = 'Trade'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F14&" AND B = 'Trade' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F14&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${openRangeName}, "SELECT SUM(N), SUM(Q) WHERE I = '"&'Investments Report'!$B$1&"' AND O >= "&F14&" AND B = 'Income' LABEL SUM(N) '', SUM(Q) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F14&" AND B = 'Income'"))=0,
    {0, 0},
    QUERY(${closedRangeName}, "SELECT SUM(U), SUM(X) WHERE I = '"&'Investments Report'!$B$1&"' AND V >= "&F14&" AND B = 'Income' LABEL SUM(U) '', SUM(X) ''"))

    }, "SELECT SUM(Col1), SUM(Col2) LABEL SUM(Col1) '', SUM(Col2) ''")
    )`, ,

        `IF(ISBLANK($F$5),,
    IF(COUNT(QUERY(${closedRangeName}, "SELECT * WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F14))=0,{0, 0},
    QUERY(${closedRangeName}, "SELECT 0-SUM(U), 0-SUM(Y) WHERE I = '"&'Investments Report'!$B$1&"' AND W >= "&F14&" LABEL 0-SUM(U) '', 0-SUM(Y) ''")))`
      ]
    ];

    sheet.getRange('F4:M14').setFormulas(formulas2);

    const formulas3 = [[

      `ARRAYFORMULA(IF(LEN(H4:H),H4:H,))`,

      `ARRAYFORMULA(IF(LEN(I4:I),I4:I,))`,

      `ARRAYFORMULA(IF(LEN(K4:K),K4:K,))`,

      `ARRAYFORMULA(IF(LEN(M4:M),M4:M,))`, ,

      `ARRAYFORMULA(IF(LEN(H4:H),H4:H,))`,

      `ARRAYFORMULA(IF(LEN(J4:J),J4:J,))`,

      `ARRAYFORMULA(IF(LEN(L4:L),L4:L,))`,

      `ARRAYFORMULA(IF(LEN(N4:N),N4:N,))`, ,

      `ARRAYFORMULA(IF(LEN(H4:H),H4:H,))`,

      `ARRAYFORMULA(IF(LEN(I4:I),I4:I+K4:K+M4:M,))`, ,

      `ARRAYFORMULA(IF(LEN(H4:H),H4:H,))`,

      `ARRAYFORMULA(IF(LEN(J4:J),J4:J+L4:L+N4:N,))`, ,

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
    QUERY({QUERY(ARRAYFORMULA(FILTER(AF4:AJ, LEN(AF4:AF))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col1, Col2"),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(AF4:AJ, LEN(AF4:AF))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col3"), 8)),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(AF4:AJ, LEN(AF4:AF))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col4"), 2))
    }`, , , ,

      `IF(ISBLANK(AL4),,ArrayFormula(FILTER(IFNA(VLOOKUP(AL4:AL, QUERY(${assetsRangeName}, "SELECT A, D"), 2, FALSE),), LEN(AL4:AL))))`,

      `ArrayFormula(FILTER(ROUND(AN4:AN*AP4:AP, 2), LEN(AL4:AL)))`, ,

      `{
    QUERY(ARRAYFORMULA(FILTER(AL4:AQ, LEN(AL4:AL))), "SELECT Col2, SUM(Col4), SUM(Col6) GROUP BY Col2 ORDER BY Col2 LABEL SUM(Col4) '', SUM(Col6) ''");
    QUERY(ARRAYFORMULA(FILTER(AL4:AQ, LEN(AL4:AL))), "SELECT 'Total', SUM(Col4), SUM(Col6) LABEL 'Total' '', SUM(Col4) '', SUM(Col6) ''")
    }`, , ,

      `ArrayFormula(IF(ISBLANK(AS4:AS),,FILTER(AU4:AU-AT4:AT, LEN(AS4:AS))))`, ,

      `QUERY(ARRAYFORMULA(FILTER(AF4:AJ, LEN(AF4:AF))), "SELECT Col4, Col5, Col1 WHERE Col2='"&'Investments Report'!$B$1&"' ORDER BY Col1")`, , ,

      `ARRAYFORMULA(IF(LEN(AX4:AX),ROUND(SUMIF(ROW(AX4:AX),"<="&ROW(AX4:AX),AX4:AX),8),))`,

      `ARRAYFORMULA(IF(LEN(AY4:AY),ROUND(SUMIF(ROW(AY4:AY),"<="&ROW(AY4:AY),AY4:AY),8),))`, ,

      `QUERY(ARRAYFORMULA(FILTER(AL4:AQ, LEN(AL4:AL))), "SELECT Col4, Col6 WHERE Col1='"&'Investments Report'!$B$1&"'")`, ,

      `BE4-BD4`, ,

      `QUERY(
    {
    QUERY(FILTER(AF4:AJ, LEN(AF4:AF)), "SELECT Col1, Col3, SUM(Col5) WHERE Col5<>0 GROUP BY Col1, Col3 ORDER BY Col1, Col3 LABEL SUM(Col5) ''");
    QUERY(FILTER(AF4:AJ, LEN(AF4:AF)), "SELECT Col1, ' Total ', SUM(Col5) WHERE Col5<>0 GROUP BY Col1 ORDER BY Col1 LABEL ' Total ' '', SUM(Col5) ''")
    },
    "SELECT * ORDER BY Col1, Col2")`, , ,

      `ARRAYFORMULA(
        IF(LEN(BJ4:BJ),
            MMULT(
              N(ROW(BI4:BI)>=TRANSPOSE(ROW(BI4:BI)))*N(BI4:BI=TRANSPOSE(BI4:BI)),
              N(BJ4:BJ)
           ),
         )
    )`
    ]];

    sheet.getRange('P4:BK4').setFormulas(formulas3);

    const pivotFormula = `QUERY(FILTER(BH4:BK, LEN(BH4:BH)), "SELECT Col1, SUM(Col4) GROUP BY Col1 PIVOT Col2 ORDER BY Col1 LABEL Col1 'Date'")`;

    sheet.getRange('BM3').setFormula(pivotFormula);

    // sheet.hideSheet();

    // sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.investmentsAssetsRangeName, sheet.getRange('A4:A'));
    ss.setNamedRange(this.investmentsChartRange1Name, sheet.getRange('BM3:ZZ'));
    ss.setNamedRange(this.investmentsChartRange2Name, sheet.getRange('AS3:AV'));
    ss.setNamedRange(this.investmentsChartRange3Name, sheet.getRange('AZ3:BB'));
    ss.setNamedRange(this.investmentsChartRange4Name, sheet.getRange('BD3:BF4'));
    ss.setNamedRange(this.investmentsChartRange5Name, sheet.getRange('P3:S'));
    ss.setNamedRange(this.investmentsChartRange6Name, sheet.getRange('U3:X'));
    ss.setNamedRange(this.investmentsChartRange7Name, sheet.getRange('Z3:AA'));
    ss.setNamedRange(this.investmentsChartRange8Name, sheet.getRange('AC3:AD'));

    this.setSheetVersion(sheet, version);
  }

  // SpreadsheetApp.flush();
  // sheet.autoResizeColumns(1, 70);
};