/**
 * Creates the uk closed report if it doesn't already exist.
 * Updates the sheet with the current closed data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukClosedReport = function (sheetName = this.ukClosedReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Buy Debit', , , , ,
        'Buy Credit', , , ,
        'Sell Credit', , , , , ,
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

    this.addPoolCondition(sheet, 'A3:A');
    this.addAssetCondition(sheet, 'B3:B');
    this.addAssetCondition(sheet, 'F3:F');
    this.addAssetCondition(sheet, 'K3:K');
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

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getUKClosedTable();

  let asset1ColumnIndex = 1;
  let asset2ColumnIndex = 5;
  let asset3ColumnIndex = 10;

  let asset1LinkTable = [];
  let asset2LinkTable = [];
  let asset3LinkTable = [];

  for (let row of dataTable) {

    asset3LinkTable.push([row[asset3ColumnIndex], row.splice(-1, 1)[0]]);
    asset2LinkTable.push([row[asset2ColumnIndex], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[asset1ColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.writeTable(ss, sheet, dataTable, this.ukClosedRangeName, 2, 15, 7);

  this.writeLinks(ss, asset1LinkTable, this.ukClosedRangeName, asset1ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.ukClosedRangeName, asset2ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset3LinkTable, this.ukClosedRangeName, asset3ColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
};

/**
 * Returns a table of the current closed data.
 * The closed data is collected when the ledger is processed.
 * @return {Array<Array>} The current closed data.
 */
AssetTracker.prototype.getUKClosedTable = function () {

  let table = [];

  for (let assetPool of this.assetPools.values()) {

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

      let asset1RowIndex = poolDeposit.debitAsset.rowIndex;
      let asset2RowIndex = poolDeposit.creditAsset.rowIndex;
      let asset3RowIndex = poolWithdrawal.creditAsset.rowIndex;

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

        action,

        asset1RowIndex,
        asset2RowIndex,
        asset3RowIndex
      ]);
    }
  }

  return this.sortTable(table, 7);
};