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

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = this.insertSheet(sheetName);

    this.trimSheet(sheet, rowCount, 19);

    const referenceRangeName = this.assetsRangeName;

    let headers = [
      [
        , ,
        'Costs', , , ,
        'Holdings', , , , ,
        'Calculations', , , , , , , ,
      ],
      [
        'Date Time',
        'Action',
        'Asset',
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
        'Current Price',
        'Cost Basis',
        'Current Value',
        'Unrealized P/L',
        'Unrealized P/L %',
        'Holding Period'
      ]
    ];

    sheet.getRange('A1:S2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:F2').setBackgroundColor('#ead1dc');
    sheet.getRange('G1:K2').setBackgroundColor('#d0e0e3');
    sheet.getRange('L1:S2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:F1').mergeAcross();
    sheet.getRange('G1:K1').mergeAcross();
    sheet.getRange('L1:S1').mergeAcross();

    sheet.getRange(`A3:A`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B3:C`).setNumberFormat('@');
    sheet.getRange(`D3:D`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`E3:E`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`F3:H`).setNumberFormat('@');
    sheet.getRange(`I3:I`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`J3:J`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`K3:K`).setNumberFormat('@');
    sheet.getRange(`L3:L`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`M3:P`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`Q3:Q`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`R3:R`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange(`S3:S`).setNumberFormat('@');

    this.addActionCondtion(sheet, `B3:B`);
    this.addAssetCondition(sheet, `C3:C`);
    this.addAssetCondition(sheet, `G3:G`);
    this.addLongShortCondition(sheet, `S3:S`);

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(I3:I-J3:J, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(L3:L=0,,O3:O/L3:L), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(G3:G, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(D3:D+E3:E, LEN(A3:A)))))`,
      `ArrayFormula(IF(ISBLANK(N3:N),,FILTER(ROUND(L3:L*N3:N, 2), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(N3:N),,FILTER(P3:P-O3:O, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(N3:N),,FILTER(IF(O3:O=0,,Q3:Q/O3:O), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, NOW(), "Y") > 1)+(((DATEDIF(A3:A, NOW(), "Y") = 1)*(DATEDIF(A3:A, NOW(), "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('L3:S3').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, this.reportsVersion);
  }
  else {

    this.trimSheet(sheet, rowCount, 19);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 11);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 19);
  ss.setNamedRange(this.openRangeName, namedRange);

  this.writeLinks(ss, actionLinkTable, this.openRangeName, 1, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.openRangeName, 2, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.openRangeName, 6, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 19);
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

        dataTable.push([

          date,
          action,
          debitAsset,
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

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[0] - b[0]; });

  for (let row of dataTable) {
    asset2LinkTable.push([row[6], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[2], row.splice(-1, 1)[0]]);
    actionLinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, actionLinkTable, asset1LinkTable, asset2LinkTable];
};