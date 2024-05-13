/**
 * Creates the income report if it doesn't already exist.
 * Updates the sheet with the current income data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} dataTable - The income data table.
 * @param {Array<Array>} actionLinkTable - The action link table.
 * @param {Array<Array>} asset1LinkTable - The asset 1 link table.
 * @param {Array<Array>} asset2LinkTable - The asset 2 link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.incomeReport = function (dataTable, actionLinkTable, asset1LinkTable, asset2LinkTable, sheetName = this.incomeReportName) {

  const version = '2';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 1;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  this.trimSheet(sheet, rowCount, 10);

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

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

    sheet.getRange(`A2:A`).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(`B2:F`).setNumberFormat('@');
    sheet.getRange(`G2:G`).setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange(`H2:H`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`I2:I`).setNumberFormat('@');
    sheet.getRange(`J2:J`).setNumberFormat('#,##0.00;(#,##0.00)');

    this.addActionCondtion(sheet, `B2:B`);
    this.addAssetCondition(sheet, `C3:C`);
    this.addAssetCondition(sheet, `E3:E`);

    const formulas = [[
      `IF(ISBLANK(A2),,ArrayFormula(FILTER(IF(ISBLANK(G2:G),H2:H,ROUND(G2:G*H2:H, 2)), LEN(A2:A))))`
    ]];

    sheet.getRange('J2').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 9);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 10);
  ss.setNamedRange(this.incomeRangeName, namedRange);

  this.writeLinks(ss, actionLinkTable, this.incomeRangeName, 1, this.ledgerSheetName, 'A', 'M');

  this.writeLinks(ss, asset1LinkTable, this.incomeRangeName, 2, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.incomeRangeName, 4, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 10);
};


/**
 * Returns income data.
 * The income data is collected when the ledger is processed.
 * @return {Array<Array>} The income data table and the action and asset link tables.
 */
AssetTracker.prototype.getIncomeData = function () {

  let dataTable = [];
  let actionLinkTable = [];
  let asset1LinkTable = [];
  let asset2LinkTable = [];

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

    dataTable.push([

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

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '', '', '', '', '', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[0] - b[0]; });

  for (let row of dataTable) {
    asset2LinkTable.push([row[4], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[2] !== null ? row[2] : '', row.splice(-1, 1)[0]]);
    actionLinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, actionLinkTable, asset1LinkTable, asset2LinkTable];
};