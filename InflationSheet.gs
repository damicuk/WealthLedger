/**
 * Creates the inflation data sheet if it doesn't already exist.
 * Updates the sheet with the current inflation data.
 * Trims the sheet to fit the data.
 * @param {Array<Array>} dataTable - The inflation data table.
 * @param {Array<Array>} actionLinkTable - The action link table.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.inflationSheet = function (dataTable, actionLinkTable, sheetName = this.inflationSheetName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  const headerRows = 1;
  const dataRows = dataTable.length;
  const rowCount = dataRows + headerRows;

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    this.trimSheet(sheet, rowCount, 4);

    let headers = [
      [
        'Date',
        'Action',
        'Inflation Index',
        'Inflation Factor'
      ]
    ];

    sheet.getRange('A1:D1').setValues(headers).setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setFrozenRows(1);

    sheet.getRange(`A2:A`).setNumberFormat('yyyy-mm-dd');
    sheet.getRange(`B2:B`).setNumberFormat('@');
    sheet.getRange(`C2:C`).setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange(`D2:D`).setNumberFormat('#,##0.0000;(#,##0.0000)');

    this.addActionCondtion(sheet, `B2:B`);

    const formulas = [[
      `IF(ISBLANK(A2),,ARRAYFORMULA(INDEX($C$2:$C,COUNTA($C$2:$C))/FILTER(C2:C, LEN(C2:C))))`
    ]];

    sheet.getRange('D2').setFormulas(formulas);

    sheet.hideSheet();

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

    this.setSheetVersion(sheet, this.reportsVersion);
  }
  else {

    this.trimSheet(sheet, rowCount, 4);
  }

  let dataRange = sheet.getRange(headerRows + 1, 1, dataRows, 3);
  dataRange.setValues(dataTable);

  let namedRange = sheet.getRange(headerRows + 1, 1, dataRows, 4);
  ss.setNamedRange(this.inflationRangeName, namedRange);

  this.writeLinks(ss, actionLinkTable, this.inflationRangeName, 1, this.ledgerSheetName, 'A', 'M');

  SpreadsheetApp.flush();
  sheet.autoResizeColumns(1, 4);
};

/**
 * Returns the inflation data.
 * The inflation data is collected when the ledger is processed.
 * @return {Array<Array>} The inflation data table and the link table.
 */
AssetTracker.prototype.getInflationData = function () {

  let dataTable = [];
  let actionLinkTable = [];

  for (let inflationRecord of this.inflationRecords) {

    let date = inflationRecord.date;
    let inflationIndex = inflationRecord.inflationIndex;
    let actionRowIndex = inflationRecord.rowIndex;

    dataTable.push([

      date,
      'Inflation',
      inflationIndex,
      actionRowIndex
    ]);
  }

  if (dataTable.length === 0) {

    dataTable = [['', '', '', '']];
  }

  dataTable.sort(function (a, b) { return a[0] - b[0]; });

  for (let row of dataTable) {
    actionLinkTable.push([row[1], row.splice(-1, 1)[0]]);
  }

  return [dataTable, actionLinkTable];
};