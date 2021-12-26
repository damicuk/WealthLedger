/**
 * Creates the uk open report if it doesn't already exist.
 * Updates the sheet with the current open pools data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet
 */
AssetTracker.prototype.ukOpenReport = function (sheetName = this.ukOpenReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  let dataTable = this.getUKOpenTable();
  const headerRows = 2;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    const referenceRangeName = this.assetsRangeName;

    let headers = [
      [
        'Buy Debit', , , ,
        'Buy Credit', , , ,
        'Calculations', , , , , , ,
      ],
      [
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',
        'Balance',
        'Cost Price',
        'Current Price',
        'Cost Basis',
        'Current Value',
        'Unrealized P/L',
        'Unrealized P/L %'
      ]
    ];

    sheet.getRange('A1:O2').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(2);

    sheet.getRange('A1:D2').setBackgroundColor('#ead1dc');
    sheet.getRange('E1:H2').setBackgroundColor('#d0e0e3');
    sheet.getRange('I1:O2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:D1').mergeAcross();
    sheet.getRange('E1:H1').mergeAcross();
    sheet.getRange('I1:O1').mergeAcross();

    sheet.getRange(`A3:B${rowCount}`).setNumberFormat('@');
    sheet.getRange(`C3:C${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`D3:D${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`E3:F${rowCount}`).setNumberFormat('@');
    sheet.getRange(`G3:G${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`H3:H${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange(`I3:I${rowCount}`).setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange(`J3:M${rowCount}`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`N3:N${rowCount}`).setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange(`O3:O${rowCount}`).setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');

    this.addAssetCondition(sheet, `A3:A${rowCount}`);
    this.addAssetCondition(sheet, `E3:E${rowCount}`);

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(G3:G-H3:H, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(I3:I=0,,L3:L/I3:I), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,ArrayFormula(FILTER(IFNA(VLOOKUP(E3:E, QUERY(${referenceRangeName}, "SELECT A, D"), 2, FALSE),), LEN(A3:A))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(C3:C+D3:D, LEN(A3:A)))))`,
      `ArrayFormula(IF(ISBLANK(K3:K),,FILTER(ROUND(I3:I*K3:K, 2), LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(K3:K),,FILTER(M3:M-L3:L, LEN(A3:A))))`,
      `ArrayFormula(IF(ISBLANK(K3:K),,FILTER(IF(L3:L=0,,N3:N/L3:L), LEN(A3:A))))`
    ]];

    sheet.getRange('I3:O3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);
  }

  let asset1ColumnIndex = 0;
  let asset2ColumnIndex = 4;

  let asset1LinkTable = [];
  let asset2LinkTable = [];

  for (let row of dataTable) {
    asset2LinkTable.push([row[asset2ColumnIndex], row.splice(-1, 1)[0]]);
    asset1LinkTable.push([row[asset1ColumnIndex], row.splice(-1, 1)[0]]);
  }

  this.trimSheet(sheet, rowCount, 15);

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 8);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 15);
  ss.setNamedRange(this.ukOpenRangeName, namedRange);

  this.writeLinks(ss, asset1LinkTable, this.ukOpenRangeName, asset1ColumnIndex, this.assetsSheetName, 'A', 'F');

  this.writeLinks(ss, asset2LinkTable, this.ukOpenRangeName, asset2ColumnIndex, this.assetsSheetName, 'A', 'F');

  SpreadsheetApp.flush();

  sheet.autoResizeColumns(1, 15);
};

/**
 * Returns a table of the current open data.
 * The open data is collected when the ledger is processed.
 * @return {Array<Array>} The current open data.
 */
AssetTracker.prototype.getUKOpenTable = function () {

  let table = [];

  for (let assetPool of this.assetPools.values()) {

    let poolDeposits = assetPool.poolDeposits;

    if (poolDeposits.length > 0) {

      let poolDeposit = poolDeposits[0];

      let debitAsset = poolDeposit.debitAsset.ticker;
      let debitAssetType = poolDeposit.debitAsset.assetType;
      let debitAmount = poolDeposit.debitAmount;
      let debitFee = poolDeposit.debitFee;
      let creditAsset = poolDeposit.creditAsset.ticker;
      let creditAssetType = poolDeposit.creditAsset.assetType;
      let creditAmount = poolDeposit.creditAmount;
      let creditFee = poolDeposit.creditFee;

      let asset1RowIndex = poolDeposit.debitAsset.rowIndex;
      let asset2RowIndex = poolDeposit.creditAsset.rowIndex;

      table.push([

        debitAsset,
        debitAssetType,
        debitAmount,
        debitFee,
        creditAsset,
        creditAssetType,
        creditAmount,
        creditFee,
        asset1RowIndex,
        asset2RowIndex
      ]);

    }
  }

  if (table.length === 0) {

    return [['', '', '', '', '', '', '', '', '', '']];
  }

  return table.sort(function (a, b) { return AssetTracker.abcComparator(a[4], b[4]); });
};