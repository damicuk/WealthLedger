/**
 * Creates the uk accounts report if it doesn't already exist.
 * Updates the sheet with the current asset accounts data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} The uk accounts data table.
 * @param {Array<Array>} The asset link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukAccountsReport = function (dataTable, assetLinkTable, sheetName = this.ukAccountsReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  this.trimSheet(sheet, rowCount, 6);

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

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

    sheet.getRange('A1:F2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:D2').setBackgroundColor('#d0e0e3');
    sheet.getRange('E1:F2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:D1').mergeAcross();
    sheet.getRange('E1:F1').mergeAcross();

    sheet.getRange(`A3:C`).setNumberFormat('@');
    sheet.getRange(`D3:D`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`E3:F`).setNumberFormat('#,##0.00;(#,##0.00)');

    this.addAssetCondition(sheet, `B3:B`);

    const formulas = [[
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(B3:B, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(E3:E),,FILTER(ROUND(D3:D*E3:E, 2), LEN(A3:A))))`
    ]];

    sheet.getRange('E3:F3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, version);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 4);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 6);
  ss.setNamedRange(this.ukAccountsRangeName, namedRange);

  this.writeLinks(ss, assetLinkTable, this.ukAccountsRangeName, 1, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 6);
};

/**
 * Returns the uk accounts data.
 * The uk accounts data is collected when the ledger is processed.
 * @return {Array<Array>} The uk accounts data table and the asset link table.
 */
AssetTracker.prototype.getUKAccountsData = function () {

  let dataTable = [];
  let assetLinkTable = [];

  for (let wallet of this.wallets.values()) {

    let walletName = wallet.name;

    for (let assetAccount of wallet.assetAccounts.values()) {

      let balance = assetAccount.balance;

      if (balance > 0) {

        let ticker = assetAccount.ticker;
        let assetType = assetAccount.asset.assetType;
        let assetRowIndex = assetAccount.asset.rowIndex;

        dataTable.push([

          walletName,
          ticker,
          assetType,
          balance,
          assetRowIndex
        ]);

      }
    }
  }

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '', '']];
  }

  dataTable.sort(
    function (a, b) {
      return AssetTracker.abcComparator(a[0], b[0]) !== 0 ?
        AssetTracker.abcComparator(a[0], b[0]) :
        AssetTracker.abcComparator(a[1], b[1]);
    }
  );

  for (let row of dataTable) {

    assetLinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, assetLinkTable];
};