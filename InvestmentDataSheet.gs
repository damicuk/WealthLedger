/**
 * Creates the investment data sheet if it doesn't already exist.
 * No data is writen to this sheet.
 * It contains formulas that pull data from other sheets.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.investmentDataSheet = function (sheetName = this.investmentDataSheetName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    this.trimColumns(sheet, 18);

    const assetsRangeName = this.assetsRangeName;
    const openRangeName = this.openRangeName;
    const closedRangeName = this.closedRangeName;
    const incomeRangeName = this.incomeRangeName;

    let headers = [
      [
        'Investment by Date and Asset', , , , , , ,
        'Investment by Asset', , , , , , ,
        'Asset Type: Net Investment vs Current Value', , , ,
      ],
      [
        'Date',
        'Asset',
        'Asset Type',
        'Units',
        'Cost',
        'Inflation', ,
        'Asset',
        'Asset Type',
        'Units',
        'Net Investment',
        'Current Price',
        'Current Value', ,
        'Asset Type',
        'Net Investment',
        'Current Value',
        'Profit'
      ]
    ];

    sheet.getRange('A1:R2').setValues(headers);
    sheet.getRange('A1:2').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:F1').mergeAcross();
    sheet.getRange('H1:M1').mergeAcross();
    sheet.getRange('O1:R1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange(`D3:D`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('E3:F').setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.getRange('G3:I').setNumberFormat('@');
    sheet.getRange(`J3:J`).setNumberFormat('#,##0.0000;(#,##0.0000)');
    sheet.getRange('K3:M').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('N3:O').setNumberFormat('@');
    sheet.getRange('P3:R').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[

      `{
    QUERY({
    QUERY({

    IF(COUNT(QUERY(${openRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    QUERY(${openRangeName}, "SELECT toDate(A), I, J, N, Q LABEL toDate(A) ''"));

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y LABEL toDate(M) '', 0-U '', 0-Y ''")
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

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y LABEL toDate(M) '', 0-U '', 0-Y ''")
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

    IF(COUNT(QUERY(${closedRangeName}, "SELECT *"))=0,{"", "", "", 0, 0},
    {
    QUERY(${closedRangeName}, "SELECT toDate(A), I, J, U, X LABEL toDate(A) ''");
    QUERY(${closedRangeName}, "SELECT toDate(M), I, J, 0-U, 0-Y LABEL toDate(M) '', 0-U '', 0-Y ''")
    });

    IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NULL AND F<>'Fiat'"))=0,{"", "", "", 0, 0},
    QUERY(${incomeRangeName}, "SELECT toDate(A), E, F, 0, 0-J WHERE C IS NULL AND F<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"));

    IF(COUNT(QUERY(${incomeRangeName}, "SELECT * WHERE C IS NOT NULL AND D<>'Fiat'"))=0,{"", "", "", 0, 0},
    QUERY(${incomeRangeName}, "SELECT toDate(A), C, D, 0, 0-J WHERE C IS NOT NULL AND D<>'Fiat' LABEL toDate(A) '', 0 '', 0-J ''"))

    }, "SELECT Col1, Col2, Col3, SUM(Col4), SUM(Col5) WHERE Col2 IS NOT NULL GROUP BY Col1, Col2, Col3 ORDER BY Col1, Col2, Col3 LABEL SUM(Col4) '', SUM(Col5) ''")
    }, "SELECT Col5"), 2))
    }`, , , , , , ,

      `{
    QUERY({QUERY(ARRAYFORMULA(FILTER(A3:E, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col1, Col2"),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(A3:E, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col3"), 8)),
    ARRAYFORMULA(ROUND(QUERY({QUERY(ARRAYFORMULA(FILTER(A3:E, LEN(A3:A))), "SELECT Col2, Col3, SUM(Col4), SUM(Col5) GROUP BY Col2, Col3 ORDER BY Col3, Col2 LABEL SUM(Col4) '', SUM(Col5) ''")}, "SELECT Col4"), 2))
    }`, , , ,

      `IF(ISBLANK(H3),,ArrayFormula(FILTER(IFNA(VLOOKUP(H3:H, QUERY(${assetsRangeName}, "SELECT A, D"), 2, FALSE),), LEN(H3:H))))`,

      `ArrayFormula(FILTER(ROUND(J3:J*L3:L, 2), LEN(H3:H)))`, ,

      `{
    QUERY(ARRAYFORMULA(FILTER(H3:M, LEN(H3:H))), "SELECT Col2, SUM(Col4), SUM(Col6) GROUP BY Col2 ORDER BY Col2 LABEL SUM(Col4) '', SUM(Col6) ''");
    QUERY(ARRAYFORMULA(FILTER(H3:M, LEN(H3:H))), "SELECT 'Total', SUM(Col4), SUM(Col6) LABEL 'Total' '', SUM(Col4) '', SUM(Col6) ''")
    }`, , ,

      `ArrayFormula(IF(ISBLANK(O3:O),,FILTER(Q3:Q-P3:P, LEN(O3:O))))`

    ]];

    sheet.getRange('A3:R3').setFormulas(formulas);


  }

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 18);
};