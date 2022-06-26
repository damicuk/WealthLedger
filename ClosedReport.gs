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

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  this.trimSheet(sheet, rowCount, 34);

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    let headers = [
      [
        , ,
        'Buy Debit', , , , , ,
        'Buy Credit', , , , ,
        'Other Asset Fee', , ,
        , ,
        'Sell Credit', , , , ,
        'Other Asset Fee', , ,
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
        'Asset',
        'Ex Rate',
        'Fee',
        'Date Time',
        'Action',
        'Asset',
        'Asset Type',
        'Ex Rate',
        'Amount',
        'Fee',
        'Wallet',
        'Asset',
        'Ex Rate',
        'Fee',
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

    sheet.getRange('A1:AH2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:B2').setBackgroundColor('#fce5cd');
    sheet.getRange('C1:H2').setBackgroundColor('#ead1dc');
    sheet.getRange('I1:L2').setBackgroundColor('#d0e0e3');
    sheet.getRange('M1:O2').setBackgroundColor('#d9ead3');
    sheet.getRange('P1:Q2').setBackgroundColor('#fce5cd');
    sheet.getRange('R1:W2').setBackgroundColor('#d0e0e3');
    sheet.getRange('X1:Z2').setBackgroundColor('#d9ead3');
    sheet.getRange('AA1:AH2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:B1').mergeAcross();
    sheet.getRange('C1:H1').mergeAcross();
    sheet.getRange('I1:L1').mergeAcross();
    sheet.getRange('M1:O1').mergeAcross();
    sheet.getRange('P1:Q1').mergeAcross();
    sheet.getRange('R1:W1').mergeAcross();
    sheet.getRange('X1:Z1').mergeAcross();
    sheet.getRange('AA1:AH1').mergeAcross();

    sheet.getRange(`A3:A`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B3:D`).setNumberFormat('@');
    sheet.getRange(`E3:E`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`F3:F`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`G3:G`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`H3:J`).setNumberFormat('@');
    sheet.getRange(`K3:K`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`L3:L`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`M3:M`).setNumberFormat('@');
    sheet.getRange(`N3:N`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`O3:O`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`P3:P`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`Q3:S`).setNumberFormat('@');
    sheet.getRange(`T3:T`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`U3:U`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`V3:V`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`W3:W`).setNumberFormat('@');

    sheet.getRange(`X3:X`).setNumberFormat('@');
    sheet.getRange(`Y3:Y`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`Z3:Z`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`AA3:AA`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`AB3:AE`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`AF3:AF`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`AG3:AG`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange(`AH3:AH`).setNumberFormat('@');

    this.addActionCondtion(sheet, `B3:B`);
    this.addAssetCondition(sheet, `C3:C`);
    this.addAssetCondition(sheet, `I3:I`);
    this.addActionCondtion(sheet, `Q3:Q`);
    this.addAssetCondition(sheet, `R3:R`);
    this.addLongShortCondition(sheet, `AH3:AH`);

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(K3:K-L3:L, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(AA3:AA=0,,AD3:AD/AA3:AA), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(AA3:AA=0,,AE3:AE/AA3:AA), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(E3:E, ROUND((F3:F+G3:G)*E3:E, 2), F3:F+G3:G), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(T3:T, ROUND((U3:U-V3:V)*T3:T, 2), U3:U-V3:V), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(AE3:AE-AD3:AD, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(AD3:AD=0,,AF3:AF/AD3:AD), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, P3:P, "Y") > 1)+(((DATEDIF(A3:A, P3:P, "Y") = 1)*(DATEDIF(A3:A, P3:P, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('AA3:AH3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 26);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 34);
  ss.setNamedRange(this.closedRangeName, namedRange);

  this.writeLinks(ss, action1LinkTable, this.closedRangeName, 1, this.ledgerSheetName, 'A', 'P');

  this.writeLinks(ss, action2LinkTable, this.closedRangeName, 16, this.ledgerSheetName, 'A', 'P');

  this.writeLinks(ss, asset1LinkTable, this.closedRangeName, 2, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.closedRangeName, 8, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset3LinkTable, this.closedRangeName, 17, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 34);
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
    let debitAssetTypeBuy = lot.debitAsset.assetType;
    let debitExRateBuy = lot.debitAsset === this.fiatBase ? '' : lot.debitExRate;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditAssetBuy = lot.creditAsset.ticker;
    let creditAssetTypeBuy = lot.creditAsset.assetType;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;

    let otherAssetBuy = '';
    let otherExRateBuy = '';
    let otherFeeBuy = '';

    let dateSell = closedLot.date;
    let closedLotAction = closedLot.action;
    let creditAssetSell = closedLot.creditAsset.ticker;
    let creditAssetTypeSell = closedLot.creditAsset.assetType;
    let creditExRateSell = closedLot.creditAsset === this.fiatBase ? '' : closedLot.creditExRate;
    let creditAmountSell = closedLot.creditAmount;
    let creditFeeSell = closedLot.creditFee;
    let walletSell = closedLot.walletName;

    let otherAssetSell = '';
    let otherExRateSell = '';
    let otherFeeSell = '';

    let action1RowIndex = lot.rowIndex;
    let action2RowIndex = closedLot.rowIndex;
    let asset1RowIndex = lot.debitAsset.rowIndex;
    let asset2RowIndex = lot.creditAsset.rowIndex;
    let asset3RowIndex = closedLot.creditAsset.rowIndex;

    dataTable.push([

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

      otherAssetBuy,
      otherExRateBuy,
      otherFeeBuy,

      dateSell,
      closedLotAction,
      creditAssetSell,
      creditAssetTypeSell,
      creditExRateSell,
      creditAmountSell,
      creditFeeSell,
      walletSell,

      otherAssetSell,
      otherExRateSell,
      otherFeeSell,

      action1RowIndex,
      action2RowIndex,
      asset1RowIndex,
      asset2RowIndex,
      asset3RowIndex
    ]);
  }

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[15] - b[15]; });

  for (let row of dataTable) {

    asset3LinkTable.push([row[17], row.splice(-1, 1)[0]]);
    asset2LinkTable.push([row[8], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[2], row.splice(-1, 1)[0]]);
    action2LinkTable.push([row[16], row.splice(-1, 1)[0]]);
    action1LinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, action1LinkTable, action2LinkTable, asset1LinkTable, asset2LinkTable, asset3LinkTable];
};

