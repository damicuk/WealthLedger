/**
 * Creates the open report if it doesn't already exist.
 * Updates the sheet with the current open data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.openReport = function (sheetName = this.openReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    const referenceRangeName = this.assetsRangeName;

    let headers = [
      [
        , ,
        'Debit', , , , , ,
        'Credit', , , , ,
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

    sheet.getRange('A1:U2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:H2').setBackgroundColor('#ead1dc');
    sheet.getRange('I1:M2').setBackgroundColor('#d0e0e3');
    sheet.getRange('N1:U2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:H1').mergeAcross();
    sheet.getRange('I1:M1').mergeAcross();
    sheet.getRange('N1:U1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:D').setNumberFormat('@');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('G3:G').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('H3:J').setNumberFormat('@');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('L3:L').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('M3:M').setNumberFormat('@');
    sheet.getRange('N3:N').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('O3:R').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('S3:S').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('T3:T').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('U3:U').setNumberFormat('@');

    this.addActionCondtion(sheet, 'B3:B');
    this.addAssetCondition(sheet, 'C3:C');
    this.addAssetCondition(sheet, 'I3:I');
    this.addLongShortCondition(sheet, 'U3:U');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(K3:K-L3:L, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(N3:N=0,,P3:P/N3:N), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(E3:E, ROUND((F3:F+G3:G)*E3:E, 2), F3:F+G3:G), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(I3:I, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(Q3:Q),,FILTER(ROUND(N3:N*Q3:Q, 2), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(Q3:Q),,FILTER(R3:R-P3:P, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(Q3:Q),,FILTER(IF(P3:P=0,,S3:S/P3:P), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, NOW(), "Y") > 1)+(((DATEDIF(A3:A, NOW(), "Y") = 1)*(DATEDIF(A3:A, NOW(), "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('N3:U3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getOpenTable();

  let actionColumnIndex = 1;
  let asset1ColumnIndex = 2;
  let asset2ColumnIndex = 8;

  let actionLinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];

  for (let row of dataTable) {
    asset2LinkTable.push([row[asset2ColumnIndex], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[asset1ColumnIndex], row.splice(-1, 1)[0]]);
    actionLinkTable.push([row[actionColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.writeTable(ss, sheet, dataTable, this.openRangeName, 2, 13, 8);

  this.writeLinks(ss, actionLinkTable, this.openRangeName, actionColumnIndex, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.openRangeName, asset1ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.openRangeName, asset2ColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
};

/**
 * Returns a table of the current open data.
 * The open data is collected when the ledger is processed.
 * @return {Array<Array>} The current open data.
 */
AssetTracker.prototype.getOpenTable = function () {

  let table = [];

  for (let wallet of this.wallets.values()) {

    for (let assetAccount of wallet.assetAccounts.values()) {

      for (let lot of assetAccount.lots) {

        let date = lot.date;
        let action = lot.action;
        let debitAsset = lot.debitAsset.ticker;
        let debitAssetType = lot.debitAsset.assetType;
        let debitExRate = lot.debitAsset === this.fiatBase ? '' : lot.debitExRate;
        let debitAmount = lot.debitAmount;
        let debitFee = lot.debitFee;
        let buyWallet = lot.walletName;

        let creditAsset = lot.creditAsset.ticker;
        let creditAssetType = lot.creditAsset.assetType;
        let creditAmount = lot.creditAmount;
        let creditFee = lot.creditFee;
        let currentWallet = wallet.name;

        let actionRowIndex = lot.rowIndex;
        let asset1RowIndex = lot.debitAsset.rowIndex;
        let asset2RowIndex = lot.creditAsset.rowIndex;

        table.push([

          date,
          action,
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
          currentWallet,

          actionRowIndex,
          asset1RowIndex,
          asset2RowIndex
        ]);
      }
    }
  }

  return this.sortTable(table, 0);
};