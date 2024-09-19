/**
 * Creates the investment data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.investmentDataSheet = function (sheetName = this.investmentDataSheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    this.trimColumns(sheet, 24);

    const inflationRangeName = this.inflationRangeName;
    const openRangeName = this.openRangeName;
    const closedRangeName = this.closedRangeName;
    const incomeRangeName = this.incomeRangeName;

    let headers = [
      [
        'Investment by Date and Asset', , , , , , , ,
        'Investment by Asset', , , , , , , , , ,
        'Investment by Asset Type', , , , , ,
      ],
      [
        'Date',
        'Asset',
        'Asset Type',
        'Units',
        'Nominal Cost',
        'Inflation Factor',
        'Real Cost', ,
        'Asset',
        'Asset Type',
        'Units',
        'Nominal Net Investment',
        'Real Net Investment',
        'Current Price',
        'Current Value',
        'Nominal Profit',
        'Real Profit', ,
        'Asset Type',
        'Nominal Net Investment',
        'Real Net Investment',
        'Current Value',
        'Nominal Profit',
        'Real Profit'
      ]
    ];

    sheet.getRange('A1:X2').setValues(headers);
    sheet.getRange('A1:2').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('I1:Q1').mergeAcross();
    sheet.getRange('S1:X1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange(`D3:D`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`F3:F`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('G3:G').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.getRange('H3:J').setNumberFormat('@');
    sheet.getRange(`K3:K`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('L3:Q').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.getRange('R3:S').setNumberFormat('@');
    sheet.getRange('T3:X').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[

      `{
    QUERY({
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    QUERY(${openRangeName}, "SELECT toDate(A), G, H, L, O LABEL toDate(A) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), G, H, Q, T LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(K), G, H, 0-Q, 0-U LABEL toDate(K) '', 0-Q '', 0-U ''")
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
    QUERY(${openRangeName}, "SELECT toDate(A), G, H, L, O LABEL toDate(A) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), G, H, Q, T LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(K), G, H, 0-Q, 0-U LABEL toDate(K) '', 0-Q '', 0-U ''")
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
    QUERY(${openRangeName}, "SELECT toDate(A), G, H, L, O LABEL toDate(A) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), G, H, Q, T LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(K), G, H, 0-Q, 0-U LABEL toDate(K) '', 0-Q '', 0-U ''")
    });

    IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NULL AND F<>'Fiat'"))=0,{"", "", "", 0, 0},
    QUERY(${incomeRangeName}, "SELECT toDate(A), E, F, 0, 0-J WHERE C IS NULL AND F<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"));

    IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NOT NULL AND D<>'Fiat'"))=0,{"", "", "", 0, 0},
    QUERY(${incomeRangeName}, "SELECT toDate(A), C, D, 0, 0-J WHERE C IS NOT NULL AND D<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"))

    }, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5) WHERE Col2 IS NOT NULL GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col2, Col3 LABEL SUM(Col4) '', SUM(Col5) ''")
    }, "SELECT Col5"), 2))
    }`, , , , ,

      `IF(OR(ISBLANK(A3),ISBLANK(INDEX(${inflationRangeName}, 1, 1))),, ARRAYFORMULA(FILTER(IF(A3:A<INDEX(${inflationRangeName}, 1, 1), INDEX(${inflationRangeName}, 1, 4), VLOOKUP(A3:A, QUERY(${inflationRangeName}, "SELECT toDate(Col1), Col4 LABEL toDate(Col1) ''"), 2, TRUE)), LEN(A3:A))))`,

      `IF(ISBLANK(A3),,ARRAYFORMULA(FILTER(IF(F3:F,E3:E*F3:F,E3:E),LEN(A3:A))))`, ,



      `IF(ISBLANK(A3),,
    {
    QUERY({QUERY(ARRAYFORMULA(FILTER(A3:G, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5), SUM(Col7) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) '', SUM(Col7) ''")}, "SELECT Col1, Col2"),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(A3:G, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5), SUM(Col7) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) '', SUM(Col7) ''")}, "SELECT Col3"), 8)),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(A3:G, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5), SUM(Col7) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) '', SUM(Col7) ''")}, "SELECT Col4, Col5"), 2))
    })`, , , , ,

      `IF(ISBLANK(I3),,ArrayFormula(FILTER(IFNA(VLOOKUP(I3:I, QUERY(${openRangeName}, "SELECT G, N"), 2, FALSE),), LEN(I3:I))))`,

      `IF(ISBLANK(I3),,ArrayFormula(FILTER(ROUND(K3:K*N3:N, 2), LEN(I3:I))))`,
      `IF(ISBLANK(I3),,ARRAYFORMULA(FILTER(O3:O-L3:L, LEN(I3:I))))`,
      `IF(ISBLANK(I3),,ARRAYFORMULA(FILTER(O3:O-M3:M, LEN(I3:I))))`, ,

      `IF(ISBLANK(A3),,{
    QUERY(ARRAYFORMULA(FILTER(I3:Q, LEN(I3:I))), "SELECT Col2, SUM(Col4), SUM(Col5), SUM(Col7) GROUP BY Col2 ORDER BY Col2 LABEL SUM(Col4) '', SUM(Col5) '', SUM(Col7) ''");
    QUERY(ARRAYFORMULA(FILTER(I3:Q, LEN(I3:I))), "SELECT 'Total', SUM(Col4), SUM(Col5), SUM(Col7) LABEL 'Total' '', SUM(Col4) '', SUM(Col5) '', SUM(Col7) ''")
    })`, , , ,

      `IF(ISBLANK(S3:S),,ArrayFormula(FILTER(V3:V-T3:T, LEN(S3:S))))`,
      `IF(ISBLANK(S3:S),,ArrayFormula(FILTER(V3:V-U3:U, LEN(S3:S))))`,

    ]];

    sheet.getRange('A3:X3').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    ss.setNamedRange(this.investmentRange1Name, sheet.getRange('S2:X'));

    this.setSheetVersion(sheet, this.reportsVersion);
  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 24);
};