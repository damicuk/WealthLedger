/**
 * Creates the uk accounts report if it doesn't already exist.
 * Updates the sheet with the current asset accounts data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukAccountsReport = function (sheetName = this.ukAccountsReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  let dataTable = this.getUKAccountsTable();
  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    const referenceRangeName = this.assetsRangeName;

    let headers = [
      [
        'Credit', , , ,
        'Calculations', ,
      ],
      [
        'Wallet',
        'Asset',
        'Asset Type',
        'Balance',
        'Current Price',
        'Current Value'
      ]
    ];

    sheet.getRange('A1:F2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:D2').setBackgroundColor('#d0e0e3');
    sheet.getRange('E1:F2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:D1').mergeAcross();
    sheet.getRange('E1:F1').mergeAcross();

    sheet.getRange(`A3:C${rowCount}`).setNumberFormat('@');
    sheet.getRange(`D3:D${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`E3:F${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');

    this.addAssetCondition(sheet, `B3:B${rowCount}`);

    const formulas = [[
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(B3:B, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(E3:E),,FILTER(ROUND(D3:D*E3:E, 2), LEN(A3:A))))`
    ]];

    sheet.getRange('E3:F3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);
  }

  let assetColumnIndex = 1;
  let assetLinkTable = [];

  for (let row of dataTable) {

    assetLinkTable.push([row[assetColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.trimSheet(sheet, rowCount, 6);

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 4);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 6);
  ss.setNamedRange(this.ukAccountsRangeName, namedRange);

  this.writeLinks(ss, assetLinkTable, this.ukAccountsRangeName, assetColumnIndex, this.assetsSheetName, 'A', 'F');

  sheet.autoResizeColumns(1, 6);
};

/**
 * Returns a table of the current accounts data.
 * The asset accounts data is collected when the ledger is processed.
 * @return {Array<Array>} The current asset accounts data.
 */
AssetTracker.prototype.getUKAccountsTable = function () {

  let table = [];

  for (let wallet of this.wallets.values()) {

    let walletName = wallet.name;

    for (let assetAccount of wallet.assetAccounts.values()) {

      let balance = assetAccount.balance;

      if (balance > 0) {

        let ticker = assetAccount.ticker;
        let assetType = assetAccount.asset.assetType;
        let assetRowIndex = assetAccount.asset.rowIndex;

        table.push([

          walletName,
          ticker,
          assetType,
          balance,
          assetRowIndex
        ]);

      }
    }
  }

  if (table.length === 0) {

    return [['', '', '', '', '']];
  }

  return table.sort(
    function (a, b) {
      return AssetTracker.abcComparator(a[0], b[0]) !== 0 ?
        AssetTracker.abcComparator(a[0], b[0]) :
        AssetTracker.abcComparator(a[1], b[1]);
    }
  );
};