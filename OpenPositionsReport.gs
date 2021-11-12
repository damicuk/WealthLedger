/**
 * Creates the open positions report if it doesn't already exist.
 * Updates the sheet with the current open positions data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.openPositionsReport = function (sheetName = this.openPositionsReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    const referenceSheetName = this.assetsSheetName;

    let headers = [
      [
        'Buy Debit', , , , , , ,
        'Buy Credit', , , ,
        'Current',
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
        'Wallet',
        'Balance',
        'Cost Price',
        'Cost Basis',
        'Current Price',
        'Current Value',
        'Unrealized P/L',
        'Unrealized P/L %',
        'Holding Period'
      ]
    ];

    sheet.getRange('A1:T2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:G2').setBackgroundColor('#ead1dc');
    sheet.getRange('H1:K2').setBackgroundColor('#d0e0e3');
    sheet.getRange('L1:L2').setBackgroundColor('#d9d2e9');
    sheet.getRange('M1:T2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('H1:K1').mergeAcross();
    sheet.getRange('M1:T1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('G3:I').setNumberFormat('@');
    sheet.getRange('J3:J').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('L3:L').setNumberFormat('@');
    sheet.getRange('M3:M').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('N3:Q').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('R3:R').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('S3:S').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('T3:T').setNumberFormat('@');

    sheet.clearConditionalFormatRules();
    this.addLongShortCondition(sheet, 'T3:T');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(J3:J-K3:K, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(M3:M=0,,O3:O/M3:M), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(D3:D, ROUND((E3:E+F3:F)*D3:D, 2), E3:E+F3:F), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(H3:H, {${referenceSheetName}!A2:A,${referenceSheetName}!D2:D}, 2, FALSE),), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(P3:P),,FILTER(ROUND(M3:M*P3:P, 2), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(P3:P),,FILTER(Q3:Q-O3:O, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(P3:P),,FILTER(IF(O3:O=0,,R3:R/O3:O), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, NOW(), "Y") > 1)+(((DATEDIF(A3:A, NOW(), "Y") = 1)*(DATEDIF(A3:A, NOW(), "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('M3:T3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getOpenPositionsTable();

  this.writeTable(ss, sheet, dataTable, this.openPositionsRangeName, 2, 12, 8);

};

/**
 * Returns a table of the current open positions data.
 * The open positions data is collected when the ledger is processed.
 * @return {Array<Array>} The current open positions data.
 */
AssetTracker.prototype.getOpenPositionsTable = function () {

  let table = [];

  for (let wallet of this.wallets) {

    let walletAssetAccounts = Array.from(wallet.assetAccounts.values());
    for (let assetAccount of walletAssetAccounts) {

      for (let lot of assetAccount.lots) {

        let date = lot.date;
        let debitAsset = lot.debitAsset.ticker;
        let debitAssetType = lot.debitAsset.assetType;
        let debitExRate = lot.debitExRate;
        let debitAmount = lot.debitAmount;
        let debitFee = lot.debitFee;
        let buyWallet = lot.walletName;

        let creditAsset = lot.creditAsset.ticker;
        let creditAssetType = lot.creditAsset.assetType;
        let creditAmount = lot.creditAmount;
        let creditFee = lot.creditFee;

        let currentWallet = wallet.name;

        table.push([

          date,
          debitAsset,
          debitAssetType,
          debitExRate,
          debitAmount,
          debitFee,
          buyWallet,

          creditAsset,
          creditAssetType,
          creditAmount,
          creditFee,

          currentWallet
        ]);
      }
    }
  }

  return this.sortTable(table, 0);
};
