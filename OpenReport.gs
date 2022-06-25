/**
 * Creates the open report if it doesn't already exist.
 * Updates the sheet with the current open data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} dataTable - The open data table.
 * @param {Array<Array>} actionLinkTable - The action link table.
 * @param {Array<Array>} asset1LinkTable - The asset 1 link table.
 * @param {Array<Array>} asset2LinkTable - The asset 2 link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.openReport = function (dataTable, actionLinkTable, asset1LinkTable, asset2LinkTable, sheetName = this.openReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  this.trimSheet(sheet, rowCount, 24);

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    const referenceRangeName = this.assetsRangeName;

    let headers = [
      [
        , ,
        'Debit', , , , , ,
        'Credit', , , , ,
        'Third Party Fee', , ,
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
        'Asset',
        'Ex Rate',
        'Fee',
        'Balance',
        'Cost Price',
        'Current Price',
        'Cost Basis',
        'Current Value',
        'Unrealized P/L',
        'Unrealized P/L %',
        'Holding Period'
      ]
    ];

    sheet.getRange('A1:X2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:H2').setBackgroundColor('#ead1dc');
    sheet.getRange('I1:M2').setBackgroundColor('#d0e0e3');
    sheet.getRange('N1:P2').setBackgroundColor('#d9ead3');
    sheet.getRange('Q1:X2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:H1').mergeAcross();
    sheet.getRange('I1:M1').mergeAcross();
    sheet.getRange('N1:P1').mergeAcross();
    sheet.getRange('Q1:X1').mergeAcross();

    sheet.getRange(`A3:A`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B3:D`).setNumberFormat('@');
    sheet.getRange(`E3:E`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`F3:F`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`G3:G`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`H3:J`).setNumberFormat('@');
    sheet.getRange(`K3:K`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`L3:L`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`M3:N`).setNumberFormat('@');
    sheet.getRange(`O3:O`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`P3:P`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`Q3:Q`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`R3:U`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`V3:V`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`W3:W`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange(`X3:X`).setNumberFormat('@');

    this.addActionCondtion(sheet, `B3:B`);
    this.addAssetCondition(sheet, `C3:C`);
    this.addAssetCondition(sheet, `I3:I`);
    this.addLongShortCondition(sheet, `X3:X`);

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(K3:K-L3:L, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(Q3:Q=0,,T3:T/Q3:Q), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(I3:I, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(E3:E, ROUND((F3:F+G3:G)*E3:E, 2), F3:F+G3:G), LEN(A3:A)))))`,
      `ArrayFormula(IF(ISBLANK(S3:S),,FILTER(ROUND(Q3:Q*S3:S, 2), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(S3:S),,FILTER(U3:U-T3:T, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(S3:S),,FILTER(IF(T3:T=0,,V3:V/T3:T), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, NOW(), "Y") > 1)+(((DATEDIF(A3:A, NOW(), "Y") = 1)*(DATEDIF(A3:A, NOW(), "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('Q3:X3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 16);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 24);
  ss.setNamedRange(this.openRangeName, namedRange);

  this.writeLinks(ss, actionLinkTable, this.openRangeName, 1, this.ledgerSheetName, 'A', 'P');

  this.writeLinks(ss, asset1LinkTable, this.openRangeName, 2, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.openRangeName, 8, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 24);
};

/**
 * Returns the open data.
 * The open data is collected when the ledger is processed.
 * @return {Array<Array>} The open data table and the action and asset link tables.
 */
AssetTracker.prototype.getOpenData = function () {

  let dataTable = [];
  let actionLinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];

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

        let firstAsset = '';
        let firstExRate = '';
        let firstFee = '';

        let actionRowIndex = lot.rowIndex;
        let asset1RowIndex = lot.debitAsset.rowIndex;
        let asset2RowIndex = lot.creditAsset.rowIndex;

        dataTable.push([

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

          firstAsset,
          firstExRate,
          firstFee,

          actionRowIndex,
          asset1RowIndex,
          asset2RowIndex
        ]);
      }
    }
  }

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[0] - b[0]; });

  for (let row of dataTable) {
    asset2LinkTable.push([row[8], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[2], row.splice(-1, 1)[0]]);
    actionLinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, actionLinkTable, asset1LinkTable, asset2LinkTable];
};