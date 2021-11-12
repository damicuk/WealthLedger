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

    sheet.getRange('A1:I1').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B2:E').setNumberFormat('@');
    sheet.getRange('F2:F').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('G2:G').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('H2:H').setNumberFormat('@');
    sheet.getRange('I2:I').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[
      `IF(ISBLANK(A2),,ArrayFormula(FILTER(IF(ISBLANK(F2:F),G2:G,ROUND(F2:F*G2:G, 2)), LEN(A2:A))))`
    ]];

    sheet.getRange('I2:I2').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getIncomeTable();

  this.writeTable(ss, sheet, dataTable, this.incomeRangeName, 1, 8, 1);

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
    let sourceAsset;
    let sourceAssetType;
    if (incomeLot.sourceAsset) {
      sourceAsset = incomeLot.sourceAsset.ticker;
      sourceAssetType = incomeLot.sourceAsset.assetType;
    }
    let incomeAsset = incomeLot.incomeAsset.ticker;
    let incomeAssetType = incomeLot.incomeAsset.assetType;
    let exRate = incomeLot.exRate;
    let amount = incomeLot.amount;
    let wallet = incomeLot.walletName;

    table.push([

      date,
      sourceAsset,
      sourceAssetType,
      incomeAsset,
      incomeAssetType,
      exRate,
      amount,
      wallet
    ]);
  }

  return this.sortTable(table, 0);
};
