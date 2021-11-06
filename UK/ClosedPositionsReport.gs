/**
 * Creates the closed positions report if it doesn't already exist.
 * Updates the sheet with the current closed positions data.
 * Trims the sheet to fit the data.
 */
AssetTracker.prototype.ukClosedPositionsReport = function () {

  const sheetName = this.ukClosedPositionsReportName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Buy Debit', , , ,,
        'Buy Credit', , ,,
        'Sell Credit', , , , ,,
        'Calculations', , , , , , ,
      ],
      [
        'Date',
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',

        'Asset',
        'Asset Type',
        'Amount',
        'Fee',

        'Date',
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',
        'Action',

        'Balance',
        'Cost Price',
        'Sell Price',
        'Cost Basis',
        'Proceeds',
        'Realized P/L',
        'Realized P/L %'
      ]
    ];

    sheet.getRange('A1:V2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:E2').setBackgroundColor('#ead1dc');
    sheet.getRange('F1:I2').setBackgroundColor('#d0e0e3');
    sheet.getRange('J1:O2').setBackgroundColor('#d9ead3');
    sheet.getRange('P1:V2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:E1').mergeAcross();
    sheet.getRange('F1:I1').mergeAcross();
    sheet.getRange('J1:O1').mergeAcross();
    sheet.getRange('P1:V1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange('F3:G').setNumberFormat('@');
    sheet.getRange('H3:H').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('I3:I').setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange('J3:J').setNumberFormat('yyyy-mm-dd');
    sheet.getRange('K3:L').setNumberFormat('@');
    sheet.getRange('M3:M').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('N3:N').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('O3:O').setNumberFormat('@');

    sheet.getRange('P3:P').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('Q3:T').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('U3:U').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('V3:V').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    sheet.clearConditionalFormatRules();
    this.addPoolCondition(sheet, 'A3:A');
    this.addActionCondtion(sheet, 'O3:O');

    const formulas = [[
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(H3:H-I3:I, LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(IF(P3:P=0,,S3:S/P3:P), LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(IF(P3:P=0,,T3:T/P3:P), LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(D3:D+E3:E, LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(M3:M-N3:N, LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(T3:T-S3:S, LEN(B3:B)))))`,
      `IF(ISBLANK(B3),,(ArrayFormula(FILTER(IF(S3:S=0,,U3:U/S3:S), LEN(B3:B)))))`
    ]];

    sheet.getRange('P3:V3').setFormulas(formulas);

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getUKClosedPositionsTable();

  this.writeTable(ss, sheet, dataTable, this.ukClosedPositionsRangeName, 2, 15, 7);

};

/**
 * Returns a table of the current closed positions data.
 * The closed positions data is collected when the ledger is processed.
 * @return {Array<Array>} The current closed positions data.
 */
AssetTracker.prototype.getUKClosedPositionsTable = function () {

  let table = [];

  for (let assetPool of this.assetPools) {

    for (let closedPoolLot of assetPool.closedPoolLots) {

      let poolDeposit = closedPoolLot.poolDeposit;
      let poolWithdrawal = closedPoolLot.poolWithdrawal;

      let dateBuy = poolDeposit.date ? poolDeposit.date : 'POOL';
      let debitAssetBuy = poolDeposit.debitAsset.ticker;
      let debitAssetTypeBuy = poolDeposit.debitAsset.assetType;
      let debitAmountBuy = poolDeposit.debitAmount;
      let debitFeeBuy = poolDeposit.debitFee;
      let creditAssetBuy = poolDeposit.creditAsset.ticker;
      let creditAssetTypeBuy = poolDeposit.creditAsset.assetType;
      let creditAmountBuy = poolDeposit.creditAmount;
      let creditFeeBuy = poolDeposit.creditFee;

      let dateSell = poolWithdrawal.date;
      let creditAssetSell = poolWithdrawal.creditAsset.ticker;
      let creditAssetTypeSell = poolWithdrawal.creditAsset.assetType;
      let creditAmountSell = poolWithdrawal.creditAmount;
      let creditFeeSell = poolWithdrawal.creditFee;

      let action = poolWithdrawal.action;

      table.push([

        dateBuy,
        debitAssetBuy,
        debitAssetTypeBuy,
        debitAmountBuy,
        debitFeeBuy,

        creditAssetBuy,
        creditAssetTypeBuy,
        creditAmountBuy,
        creditFeeBuy,

        dateSell,
        creditAssetSell,
        creditAssetTypeSell,
        creditAmountSell,
        creditFeeSell,

        action
      ]);
    }
  }

  return this.sortTable(table, 7);
};
