/**
 * Creates the fiat accounts sheet if it doesn't already exist.
 * Updates the sheet with the current fiat accounts data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.fiatAccountsSheet = function (sheetName = this.fiatAccountsSheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  let dataTable = this.getFiatTable();
  const headerRows = 1;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [['Wallet', 'Currency', 'Balance']];

    sheet.getRange('A1:C1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.getRange(`A2:A${rowCount}`).setNumberFormat('@');
    sheet.getRange(`B2:B${rowCount}`).setNumberFormat('@');
    sheet.getRange(`C2:C${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);
  }

  let assetColumnIndex = 1;
  let assetLinkTable = [];

  for (let row of dataTable) {
    assetLinkTable.push([row[assetColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.trimSheet(sheet, rowCount, 3);

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 3);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 3);
  ss.setNamedRange(this.fiatAccountsRangeName, namedRange);

  this.writeLinks(ss, assetLinkTable, this.fiatAccountsRangeName, assetColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, 3);
};

/**
 * Returns a table of the current fiat accounts data.
 * The fiat accounts data is collected when the ledger is processed.
 * @return {Array<Array>} The current fiat accounts data.
 */
AssetTracker.prototype.getFiatTable = function () {

  let table = [];

  for (let wallet of this.wallets.values()) {

    for (let fiatAccount of wallet.fiatAccounts.values()) {

      if (fiatAccount.balance !== 0) {

        table.push([
          wallet.name,
          fiatAccount.ticker,
          fiatAccount.balance,
          fiatAccount.asset.rowIndex

        ]);
      }
    }
  }

  if (table.length === 0) {

    return [['', '', '', '']];
  }

  return table.sort(function (a, b) {
    return a[0] > b[0] ? 1 :
      b[0] > a[0] ? -1 :
        a[1] > b[1] ? 1 :
          b[1] > a[1] ? -1 :
            0;
  });
};