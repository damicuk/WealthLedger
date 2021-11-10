/**
 * Creates the closed positions report if it doesn't already exist.
 * Updates the sheet with the current closed positions data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.closedPositionsReport = function (sheetName = this.closedPositionsReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Buy Debit', , , , , , ,
        'Buy Credit', , , ,
        'Sell Credit', , , , , , ,
        'Calculations', , , , , , , ,
      ],
      [
        'Date Time',
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

    sheet.getRange('A1:Z2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:G2').setBackgroundColor('#ead1dc');
    sheet.getRange('H1:K2').setBackgroundColor('#d0e0e3');
    sheet.getRange('L1:R2').setBackgroundColor('#d9ead3');
    sheet.getRange('S1:Z2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('H1:K1').mergeAcross();
    sheet.getRange('L1:R1').mergeAcross();
    sheet.getRange('S1:Z1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('G3:I').setNumberFormat('@');
    sheet.getRange('J3:J').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('L3:L').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('M3:N').setNumberFormat('@');
    sheet.getRange('O3:O').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('P3:P').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('Q3:Q').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('R3:R').setNumberFormat('@');
    sheet.getRange('S3:S').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('T3:W').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('X3:X').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('Y3:Y').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('Z3:Z').setNumberFormat('@');

    sheet.clearConditionalFormatRules();
    this.addLongShortCondition(sheet, 'Z3:Z');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(J3:J-K3:K, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(S3:S=0,,V3:V/S3:S), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(S3:S=0,,W3:W/S3:S), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(D3:D, (E3:E+F3:F)*D3:D, E3:E+F3:F), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(O3:O, (P3:P-Q3:Q)*O3:O, P3:P-Q3:Q), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(W3:W-V3:V, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(V3:V=0,,X3:X/V3:V), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, L3:L, "Y") > 1)+(((DATEDIF(A3:A, L3:L, "Y") = 1)*(DATEDIF(A3:A, L3:L, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('S3:Z3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getClosedPositionsTable();

  this.writeTable(ss, sheet, dataTable, this.closedPositionsRangeName, 2, 18, 8);

};

/**
 * Returns a table of the current closed positions data.
 * The closed positions data is collected when the ledger is processed.
 * @return {Array<Array>} The current closed positions data.
 */
AssetTracker.prototype.getClosedPositionsTable = function () {

  let table = [];

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let debitAssetBuy = lot.debitAsset.ticker;
    let debitAssetTypeBuy = lot.debitAsset.assetType;
    let debitExRateBuy = lot.debitExRate;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditAssetBuy = lot.creditAsset.ticker;
    let creditAssetTypeBuy = lot.creditAsset.assetType;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;

    let dateSell = closedLot.date;
    let creditAssetSell = closedLot.creditAsset.ticker;
    let creditAssetTypeSell = closedLot.creditAsset.assetType;
    let creditExRateSell = closedLot.creditExRate;
    let creditAmountSell = closedLot.creditAmount;
    let creditFeeSell = closedLot.creditFee;
    let walletSell = closedLot.walletName;

    table.push([

      dateBuy,
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
      creditAssetSell,
      creditAssetTypeSell,
      creditExRateSell,
      creditAmountSell,
      creditFeeSell,
      walletSell
    ]);
  }

  return this.sortTable(table, 11);
};

