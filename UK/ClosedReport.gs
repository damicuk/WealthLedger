/**
 * Creates the uk closed report if it doesn't already exist.
 * Updates the sheet with the current closed data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} The uk closed data table.
 * @param {Array<Array>} The asset 1 link table.
 * @param {Array<Array>} The asset 2 link table.
 * @param {Array<Array>} The asset 3 link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukClosedReport = function (dataTable, asset1LinkTable, asset2LinkTable, asset3LinkTable, sheetName = this.ukClosedReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  this.trimSheet(sheet, rowCount, 22);

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

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

    sheet.getRange('A1:V2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:E2').setBackgroundColor('#ead1dc');
    sheet.getRange('F1:I2').setBackgroundColor('#d0e0e3');
    sheet.getRange('J1:O2').setBackgroundColor('#d9ead3');
    sheet.getRange('P1:V2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:E1').mergeAcross();
    sheet.getRange('F1:I1').mergeAcross();
    sheet.getRange('J1:O1').mergeAcross();
    sheet.getRange('P1:V1').mergeAcross();

    sheet.getRange(`A3:A${rowCount}`).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(`B3:C${rowCount}`).setNumberFormat('@');
    sheet.getRange(`D3:D${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`E3:E${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`F3:G${rowCount}`).setNumberFormat('@');
    sheet.getRange(`H3:H${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`I3:I${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');

    sheet.getRange(`J3:J${rowCount}`).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(`K3:L${rowCount}`).setNumberFormat('@');
    sheet.getRange(`M3:M${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`N3:N${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`O3:O${rowCount}`).setNumberFormat('@');

    sheet.getRange(`P3:P${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`Q3:T${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`U3:U${rowCount}`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`V3:V${rowCount}`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    this.addPoolCondition(sheet, `A3:A${rowCount}`);
    this.addAssetCondition(sheet, `B3:B${rowCount}`);
    this.addAssetCondition(sheet, `F3:F${rowCount}`);
    this.addAssetCondition(sheet, `K3:K${rowCount}`);
    this.addActionCondtion(sheet, `O3:O${rowCount}`);

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

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 15);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 22);
  ss.setNamedRange(this.ukClosedRangeName, namedRange);

  this.writeLinks(ss, asset1LinkTable, this.ukClosedRangeName, 1, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.ukClosedRangeName, 5, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset3LinkTable, this.ukClosedRangeName, 10, this.assetsSheetName, 'A', 'F');

  sheet.autoResizeColumns(1, 22);
};

/**
 * Returns uk closed data.
 * The uk closed data is collected when the ledger is processed.
 * @return {Array<Array>} The uk closed data table and the asset link tables.
 */
AssetTracker.prototype.getUKClosedData = function () {

  let dataTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];
  let asset3LinkTable = [];

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

      dataTable.push([

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

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[7] - b[7]; });

  for (let row of dataTable) {

    asset3LinkTable.push([row[10], row.splice(-1, 1)[0]]);
    asset2LinkTable.push([row[5], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, asset1LinkTable, asset2LinkTable, asset3LinkTable];
};