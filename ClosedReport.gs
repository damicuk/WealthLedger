/**
 * Creates the closed report if it doesn't already exist.
 * Updates the sheet with the current closed data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.closedReport = function (sheetName = this.closedReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  let dataTable = this.getClosedTable();
  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

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

    sheet.getRange('A1:AB2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
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

    sheet.getRange(`A3:A${rowCount}`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B3:D${rowCount}`).setNumberFormat('@');
    sheet.getRange(`E3:E${rowCount}`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`F3:F${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`G3:G${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`H3:J${rowCount}`).setNumberFormat('@');
    sheet.getRange(`K3:K${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`L3:L${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`M3:M${rowCount}`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`N3:P${rowCount}`).setNumberFormat('@');
    sheet.getRange(`Q3:Q${rowCount}`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`R3:R${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`S3:S${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`T3:T${rowCount}`).setNumberFormat('@');

    sheet.getRange(`U3:U${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`V3:Y${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`Z3:Z${rowCount}`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`AA3:AA${rowCount}`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange(`AB3:AB${rowCount}`).setNumberFormat('@');

    this.addActionCondtion(sheet, `B3:B${rowCount}`);
    this.addAssetCondition(sheet, `C3:C${rowCount}`);
    this.addAssetCondition(sheet, `I3:I${rowCount}`);
    this.addActionCondtion(sheet, `N3:N${rowCount}`);
    this.addAssetCondition(sheet, `O3:O${rowCount}`);
    this.addLongShortCondition(sheet, `AB3:AB${rowCount}`);

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

  let action1ColumnIndex = 1;
  let action2ColumnIndex = 13;
  let asset1ColumnIndex = 2;
  let asset2ColumnIndex = 8;
  let asset3ColumnIndex = 14;

  let action1LinkTable = [];
  let action2LinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];
  let asset3LinkTable = [];

  for (let row of dataTable) {

    asset3LinkTable.push([row[asset3ColumnIndex], row.splice(-1, 1)[0]]);
    asset2LinkTable.push([row[asset2ColumnIndex], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[asset1ColumnIndex], row.splice(-1, 1)[0]]);
    action2LinkTable.push([row[action2ColumnIndex], row.splice(-1, 1)[0]]);
    action1LinkTable.push([row[action1ColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.trimSheet(sheet, rowCount, 28);

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 20);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 28);
  ss.setNamedRange(this.closedRangeName, namedRange);

  this.writeLinks(ss, action1LinkTable, this.closedRangeName, action1ColumnIndex, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, action2LinkTable, this.closedRangeName, action2ColumnIndex, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.closedRangeName, asset1ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.closedRangeName, asset2ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset3LinkTable, this.closedRangeName, asset3ColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, 28);
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

    let action1RowIndex = lot.rowIndex;
    let action2RowIndex = closedLot.rowIndex;
    let asset1RowIndex = lot.debitAsset.rowIndex;
    let asset2RowIndex = lot.creditAsset.rowIndex;
    let asset3RowIndex = closedLot.creditAsset.rowIndex;

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

      action1RowIndex,
      action2RowIndex,
      asset1RowIndex,
      asset2RowIndex,
      asset3RowIndex
    ]);
  }

  if (table.length === 0) {

    return [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  return table.sort(function (a, b) { return a[12] - b[12]; });
};

