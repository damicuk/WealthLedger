/**
 * Creates the closed report if it doesn't already exist.
 * Updates the sheet with the current closed data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} dataTable - The closed data table.
 * @param {Array<Array>} action1LinkTable - The action 1 link table.
 * @param {Array<Array>} action2LinkTable - The action 2 link table.
 * @param {Array<Array>} asset1LinkTable - The asset 1 link table.
 * @param {Array<Array>} asset2LinkTable - The asset 2 link table.
 * @param {Array<Array>} asset3LinkTable - The asset 3 link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.closedReport = function (dataTable, action1LinkTable, action2LinkTable, asset1LinkTable, asset2LinkTable, asset3LinkTable, sheetName = this.closedReportName) {

  const version = '2';

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

    let headers = [
      [
        , ,
        'Costs', , , ,
        'Holdings', , , , , , ,
        'Proceeds', , ,
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
        'Date Time',
        'Action',
        'Asset',
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

    sheet.getRange('A1:X2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:F2').setBackgroundColor('#ead1dc');
    sheet.getRange('G1:J2').setBackgroundColor('#d0e0e3');
    sheet.getRange('K1:L2').setBackgroundColor('#fce5cd');
    sheet.getRange('M1:P2').setBackgroundColor('#ead1dc');
    sheet.getRange('Q1:X2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:F1').mergeAcross();
    sheet.getRange('G1:J1').mergeAcross();
    sheet.getRange('K1:L1').mergeAcross();
    sheet.getRange('M1:P1').mergeAcross();
    sheet.getRange('Q1:X1').mergeAcross();

    sheet.getRange(`A3:A`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B3:C`).setNumberFormat('@');
    sheet.getRange(`D3:D`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`E3:E`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`F3:H`).setNumberFormat('@');
    sheet.getRange(`I3:I`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`J3:J`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`K3:K`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`L3:M`).setNumberFormat('@');
    sheet.getRange(`N3:N`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`O3:O`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`P3:P`).setNumberFormat('@');

    sheet.getRange(`Q3:Q`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`R3:U`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`V3:V`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`W3:W`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange(`X3:X`).setNumberFormat('@');

    this.addActionCondtion(sheet, `B3:B`);
    this.addAssetCondition(sheet, `C3:C`);
    this.addAssetCondition(sheet, `G3:G`);
    this.addActionCondtion(sheet, `L3:L`);
    this.addAssetCondition(sheet, `M3:M`);
    this.addLongShortCondition(sheet, `X3:X`);

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(I3:I-J3:J, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(Q3:Q=0,,T3:T/Q3:Q), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(Q3:Q=0,,U3:U/Q3:Q), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(D3:D+E3:E, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(N3:N-O3:O, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(U3:U-T3:T, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(T3:T=0,,V3:V/T3:T), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, K3:K, "Y") > 1)+(((DATEDIF(A3:A, K3:K, "Y") = 1)*(DATEDIF(A3:A, K3:K, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('Q3:X3').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 16);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 24);
  ss.setNamedRange(this.closedRangeName, namedRange);

  this.writeLinks(ss, action1LinkTable, this.closedRangeName, 1, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, action2LinkTable, this.closedRangeName, 11, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.closedRangeName, 2, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.closedRangeName, 6, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset3LinkTable, this.closedRangeName, 12, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 24);
};

/**
 * Returns closed data.
 * The closed data is collected when the ledger is processed.
 * @return {Array<Array>} The closed data table and the action and asset link tables.
 */
AssetTracker.prototype.getClosedData = function () {

  let dataTable = [];
  let action1LinkTable = [];
  let action2LinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];
  let asset3LinkTable = [];

  for (let closedLot of this.closedLots) {

    let lot = closedLot.lot;

    let dateBuy = lot.date;
    let lotAction = lot.action;
    let debitAssetBuy = lot.debitAsset.ticker;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditAssetBuy = lot.creditAsset.ticker;
    let creditAssetTypeBuy = lot.creditAsset.assetType;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;

    let dateSell = closedLot.date;
    let closedLotAction = closedLot.action;
    let creditAssetSell = closedLot.creditAsset.ticker;
    let creditAmountSell = closedLot.creditAmount;
    let creditFeeSell = closedLot.creditFee;
    let walletSell = closedLot.walletName;

    let action1RowIndex = lot.rowIndex;
    let action2RowIndex = closedLot.rowIndex;
    let asset1RowIndex = lot.debitAsset.rowIndex;
    let asset2RowIndex = lot.creditAsset.rowIndex;
    let asset3RowIndex = closedLot.creditAsset.rowIndex;

    dataTable.push([

      dateBuy,
      lotAction,
      debitAssetBuy,
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
      creditAmountSell,
      creditFeeSell,
      walletSell,

      action1RowIndex,
      action2RowIndex,
      asset1RowIndex,
      asset2RowIndex,
      asset3RowIndex
    ]);
  }

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[10] - b[10]; });

  for (let row of dataTable) {

    asset3LinkTable.push([row[12], row.splice(-1, 1)[0]]);
    asset2LinkTable.push([row[6], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[2], row.splice(-1, 1)[0]]);
    action2LinkTable.push([row[11], row.splice(-1, 1)[0]]);
    action1LinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, action1LinkTable, action2LinkTable, asset1LinkTable, asset2LinkTable, asset3LinkTable];
};