/**
 * Creates the income report if it doesn't already exist.
 * Updates the sheet with the current income data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.incomeReport = function (sheetName = this.incomeReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  let dataTable = this.getIncomeTable();
  const headerRows = 1;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Date Time',
        'Action',
        'Source Asset',
        'Source Asset Type',
        'Income Asset',
        'Income Asset Type',
        'Ex Rate',
        'Amount',
        'Wallet',
        'Income Value'
      ]
    ];

    sheet.getRange('A1:J1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.getRange(`A2:A${rowCount}`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B2:F${rowCount}`).setNumberFormat('@');
    sheet.getRange(`G2:G${rowCount}`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`H2:H${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`I2:I${rowCount}`).setNumberFormat('@');
    sheet.getRange(`J2:J${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');

    this.addActionCondtion(sheet, `B2:B${rowCount}`);
    this.addAssetCondition(sheet, `C3:C${rowCount}`);
    this.addAssetCondition(sheet, `E3:E${rowCount}`);

    const formulas = [[
      `IF(ISBLANK(A2),,ArrayFormula(FILTER(IF(ISBLANK(G2:G),H2:H,ROUND(G2:G*H2:H, 2)), LEN(A2:A))))`
    ]];

    sheet.getRange('J2').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let actionColumnIndex = 1;
  let asset1ColumnIndex = 2;
  let asset2ColumnIndex = 4;

  let actionLinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];

  for (let row of dataTable) {
    asset2LinkTable.push([row[asset2ColumnIndex], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[asset1ColumnIndex] !== null ? row[asset1ColumnIndex] : '', row.splice(-1, 1)[0]]);
    actionLinkTable.push([row[actionColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.trimSheet(sheet, rowCount, 10);

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 9);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 10);
  ss.setNamedRange(this.incomeRangeName, namedRange);

  this.writeLinks(ss, actionLinkTable, this.incomeRangeName, actionColumnIndex, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.incomeRangeName, asset1ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.incomeRangeName, asset2ColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, 10);
};


/**
 * Returns a table of the current income data.
 * The income data is collected when the ledger is processed.
 * @return {Array<Array>} The current income data.
 */
AssetTracker.prototype.getIncomeTable = function () {

  let table = [];

  for (let incomeLot of this.incomeLots) {

    let date = incomeLot.date;
    let sourceAsset = incomeLot.sourceAsset ? incomeLot.sourceAsset.ticker : null;
    let sourceAssetType = incomeLot.sourceAsset ? incomeLot.sourceAsset.assetType : null;
    let incomeAsset = incomeLot.incomeAsset.ticker;
    let incomeAssetType = incomeLot.incomeAsset.assetType;
    let exRate = incomeLot.incomeAsset === this.fiatBase ? '' : incomeLot.exRate;
    let amount = incomeLot.amount;
    let wallet = incomeLot.walletName;
    let actionRowIndex = incomeLot.rowIndex;
    let asset1RowIndex = incomeLot.sourceAsset ? incomeLot.sourceAsset.rowIndex : null;
    let asset2RowIndex = incomeLot.incomeAsset.rowIndex;

    table.push([

      date,
      'Income',
      sourceAsset,
      sourceAssetType,
      incomeAsset,
      incomeAssetType,
      exRate,
      amount,
      wallet,
      actionRowIndex,
      asset1RowIndex,
      asset2RowIndex
    ]);
  }

  if (table.length === 0) {

    return [['', '', '', '', '', '', '', '', '', '', '', '']];
  }

  return table.sort(function (a, b) { return a[0] - b[0]; });
};