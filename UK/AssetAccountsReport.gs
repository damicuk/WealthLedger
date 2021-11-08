/**
 * Creates the asset accounts report if it doesn't already exist.
 * Updates the sheet with the current asset accounts data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.ukAssetAccountsReport = function (sheetName = this.ukAssetAccountsReportName) {

  const assetsRangeName = this.assetsRangeName;

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

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

    sheet.getRange('A3:C').setNumberFormat('@');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('E3:F').setNumberFormat('#,##0.00;(#,##0.00)');

    const formulas = [[
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(B3:B, QUERY(${assetsRangeName}, "SELECT A, E"), 2, FALSE),), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(E3:E),,FILTER(D3:D*E3:E, LEN(A3:A))))`
    ]];

    sheet.getRange('E3:F3').setFormulas(formulas);

    let protection = sheet.protect().setDescription('Essential Data Sheet');
    protection.setWarningOnly(true);

  }

  let dataTable = this.getUKAssetAccountsTable();

  this.writeTable(ss, sheet, dataTable, this.ukAssetAccountsRangeName, 2, 4, 2);

};

/**
 * Returns a table of the current asset accounts data.
 * The asset accounts data is collected when the ledger is processed.
 * @return {Array<Array>} The current asset accounts data.
 */
AssetTracker.prototype.getUKAssetAccountsTable = function () {

  let table = [];

  for (let wallet of this.wallets) {

    let walletName = wallet.name;

    let walletAssetAccounts = Array.from(wallet.assetAccounts.values());
    for (let assetAccount of walletAssetAccounts) {

      let balance = assetAccount.balance;

      if (balance > 0) {

        let ticker = assetAccount.ticker;
        let assetType = assetAccount.asset.assetType;

        table.push([

          walletName,
          ticker,
          assetType,
          balance
        ]);

      }
    }
  }

  table.sort(
    function (a, b) {
      return AssetTracker.abcComparator(a[0], b[0]) !== 0 ?
        AssetTracker.abcComparator(a[0], b[0]) :
        AssetTracker.abcComparator(a[1], b[1]);
    }
  );

  return table;
};