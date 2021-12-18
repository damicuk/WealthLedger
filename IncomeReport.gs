/**
 * Creates the income report if it doesn't already exist.
 * Updates the sheet with the current income data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.incomeReport = function (sheetName = this.incomeReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

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

    sheet.getRange('A1:J1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B2:F').setNumberFormat('@');
    sheet.getRange('G2:G').setNumberFormat('#,##0.00000;(#,##0.00000)');
    sheet.getRange('H2:H').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('I2:I').setNumberFormat('@');
    sheet.getRange('J2:J').setNumberFormat('#,##0.00;(#,##0.00)');

    this.addActionCondtion(sheet, 'B2:B');

    const formulas = [[
      `IF(ISBLANK(A2),,ArrayFormula(FILTER(IF(ISBLANK(G2:G),H2:H,ROUND(G2:G*H2:H, 2)), LEN(A2:A))))`
    ]];

    sheet.getRange('J2').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getIncomeTable();

  let linkColumnIndex = 1;
  let linkTable = [];

  for (let row of dataTable) {
    linkTable.push([row[linkColumnIndex], row.splice(-1, 1)]);
  }

  this.writeTable(ss, sheet, dataTable, this.incomeRangeName, 1, 9, 1);

  this.writeLedgerLinks(ss, linkTable, this.incomeRangeName, linkColumnIndex);
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
    let rowIndex = incomeLot.rowIndex;

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
      rowIndex
    ]);
  }

  return this.sortTable(table, 0);
};