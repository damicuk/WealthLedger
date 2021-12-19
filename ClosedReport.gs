/**
 * Creates the closed report if it doesn't already exist.
 * Updates the sheet with the current closed data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.closedReport = function (sheetName = this.closedReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        , ,
        'Buy Debit', , , , , ,
        'Buy Credit', , , , ,
        , ,
        'Sell Credit', , , , ,
        'Calculations', , , , , , , ,
      ],
      [
        'Date Time',
        'Action',
        'Asset',
        'Asset Type',
        'Ex Rate',
        'Amount',
        'Fee',
        'Wallet',
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',
        'Date Time',
        'Action',
        'Asset',
        'Asset Type',
        'Ex Rate',
        'Amount',
        'Fee',
        'Wallet',
        'Balance',
        'Cost Price',
        'Sell Price',
        'Cost Basis',
        'Proceeds',
        'Realized P/L',
        'Realized P/L %',
        'Holding Period'
      ]
    ];

    sheet.getRange('A1:AB2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:H2').setBackgroundColor('#ead1dc');
    sheet.getRange('I1:L2').setBackgroundColor('#d0e0e3');
    sheet.getRange('M1:N2').setBackgroundColor('#fce5cd');
    sheet.getRange('O1:T2').setBackgroundColor('#d9ead3');
    sheet.getRange('U1:AB2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:H1').mergeAcross();
    sheet.getRange('I1:L1').mergeAcross();
    sheet.getRange('M1:N1').mergeAcross();
    sheet.getRange('O1:T1').mergeAcross();
    sheet.getRange('U1:AB1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:D').setNumberFormat('@');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('G3:G').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('H3:J').setNumberFormat('@');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('L3:L').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('M3:M').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('N3:P').setNumberFormat('@');
    sheet.getRange('Q3:Q').setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange('R3:R').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('S3:S').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('T3:T').setNumberFormat('@');

    sheet.getRange('U3:U').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('V3:Y').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('Z3:Z').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('AA3:AA').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('AB3:AB').setNumberFormat('@');

    this.addActionCondtion(sheet, 'B3:B');
    this.addActionCondtion(sheet, 'N3:N');
    this.addLongShortCondition(sheet, 'AB3:AB');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(K3:K-L3:L, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(U3:U=0,,X3:X/U3:U), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(U3:U=0,,Y3:Y/U3:U), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(E3:E, ROUND((F3:F+G3:G)*E3:E, 2), F3:F+G3:G), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(Q3:Q, ROUND((R3:R-S3:S)*Q3:Q, 2), R3:R-S3:S), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(Y3:Y-X3:X, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(X3:X=0,,Z3:Z/X3:X), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, M3:M, "Y") > 1)+(((DATEDIF(A3:A, M3:M, "Y") = 1)*(DATEDIF(A3:A, M3:M, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('U3:AB3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getClosedTable();

  let linkColumnIndex1 = 1;
  let linkColumnIndex2 = 13;

  let linkTable1 = [];
  let linkTable2 = [];

  for (let row of dataTable) {

    //First splice off the last column (closed lot)
    linkTable2.push([row[linkColumnIndex2], row.splice(-1, 1)]);

    //Then splice the next last column (lot)
    linkTable1.push([row[linkColumnIndex1], row.splice(-1, 1)]);
  }

  this.writeTable(ss, sheet, dataTable, this.closedRangeName, 2, 20, 8);

  this.writeLedgerLinks(ss, linkTable1, this.closedRangeName, linkColumnIndex1);

  this.writeLedgerLinks(ss, linkTable2, this.closedRangeName, linkColumnIndex2);
};

/**
 * Returns a table of the current closed data.
 * The closed data is collected when the ledger is processed.
 * @return {Array<Array>} The current closed data.
 */
AssetTracker.prototype.getClosedTable = function () {

  let table = [];

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let debitAssetBuy = lot.debitAsset.ticker;
    let debitAssetTypeBuy = lot.debitAsset.assetType;
    let debitExRateBuy = lot.debitAsset === this.fiatBase ? '' : lot.debitExRate;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditAssetBuy = lot.creditAsset.ticker;
    let creditAssetTypeBuy = lot.creditAsset.assetType;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;
    let lotAction = lot.action;

    let dateSell = closedLot.date;
    let creditAssetSell = closedLot.creditAsset.ticker;
    let creditAssetTypeSell = closedLot.creditAsset.assetType;
    let creditExRateSell = closedLot.creditAsset === this.fiatBase ? '' : closedLot.creditExRate;
    let creditAmountSell = closedLot.creditAmount;
    let creditFeeSell = closedLot.creditFee;
    let walletSell = closedLot.walletName;
    let closedLotAction = closedLot.action;

    let lotRowIndex = lot.rowIndex;
    let closedLotRowIndex = closedLot.rowIndex;

    table.push([

      dateBuy,
      lotAction,
      debitAssetBuy,
      debitAssetTypeBuy,
      debitExRateBuy,
      debitAmountBuy,
      debitFeeBuy,
      walletBuy,

      creditAssetBuy,
      creditAssetTypeBuy,
      creditAmountBuy,
      creditFeeBuy,

      dateSell,
      closedLotAction,
      creditAssetSell,
      creditAssetTypeSell,
      creditExRateSell,
      creditAmountSell,
      creditFeeSell,
      walletSell,

      lotRowIndex,
      closedLotRowIndex
    ]);
  }

  return this.sortTable(table, 12);
};

