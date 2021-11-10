/**
 * Creates the donations report if it doesn't already exist.
 * Updates the sheet with the current donations data.
 * Trims the sheet to fit the data.
 * @param {string} [sheetName] - The name of the sheet.
 */
AssetTracker.prototype.donationsReport = function (sheetName = this.donationsReportName) {

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {

    sheet = ss.insertSheet(sheetName);

    let headers = [
      [
        'Buy Debit', , , , , , ,
        'Buy Credit', , , ,
        'Donation Debit', , ,
        'Calculations', , , , , , , ,
      ],
      [
        'Date Time',
        'Asset',
        'Asset Type',
        'Ex Rate',
        'Amount',
        'Fee',
        'Wallet',
        'Asset',
        'Asset Type',
        'Amount',
        'Fee',
        'Date Time',
        'Ex Rate',
        'Wallet',
        'Balance',
        'Cost Price',
        'Donation Price',
        'Cost Basis',
        'Donation Value',
        'Notional P/L',
        'Notional P/L %',
        'Holding Period'
      ]
    ];

    sheet.getRange('A1:V2').setValues(headers).setFontWeight('bold').setHorizontalAlignment("center");
    sheet.setFrozenRows(2);

    sheet.getRange('A1:G2').setBackgroundColor('#ead1dc');
    sheet.getRange('H1:K2').setBackgroundColor('#d0e0e3');
    sheet.getRange('L1:N2').setBackgroundColor('#ead1dc');
    sheet.getRange('O1:V2').setBackgroundColor('#c9daf8');

    sheet.getRange('A1:G1').mergeAcross();
    sheet.getRange('H1:K1').mergeAcross();
    sheet.getRange('L1:N1').mergeAcross();
    sheet.getRange('O1:V1').mergeAcross();

    sheet.getRange('A3:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('B3:C').setNumberFormat('@');
    sheet.getRange('D3:D').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('E3:E').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('F3:F').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('G3:I').setNumberFormat('@');
    sheet.getRange('J3:J').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('K3:K').setNumberFormat('#,##0.00000000;(#,##0.00000000);');
    sheet.getRange('L3:L').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('M3:M').setNumberFormat('#,##0.00000;(#,##0.00000);');
    sheet.getRange('N3:N').setNumberFormat('@');
    sheet.getRange('O3:O').setNumberFormat('#,##0.00000000;(#,##0.00000000)');
    sheet.getRange('P3:S').setNumberFormat('#,##0.00;(#,##0.00)');
    sheet.getRange('T3:T').setNumberFormat('[color50]#,##0.00_);[color3](#,##0.00);[blue]#,##0.00_)');
    sheet.getRange('U3:U').setNumberFormat('[color50]0% ▲;[color3]-0% ▼;[blue]0% ▬');
    sheet.getRange('V3:V').setNumberFormat('@');

    sheet.clearConditionalFormatRules();
    this.addLongShortCondition(sheet, 'V3:V');

    const formulas = [[
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(J3:J-K3:K, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(O3:O=0,,R3:R/O3:O), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(O3:O=0,,S3:S/O3:O), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(D3:D, (E3:E+F3:F)*D3:D, E3:E+F3:F), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(M3:M*O3:O, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(S3:S-R3:R, LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF(R3:R=0,,T3:T/R3:R), LEN(A3:A)))))`,
      `IF(ISBLANK(A3),,(ArrayFormula(FILTER(IF((DATEDIF(A3:A, L3:L, "Y") > 1)+(((DATEDIF(A3:A, L3:L, "Y") = 1)*(DATEDIF(A3:A, L3:L, "YD") > 0))=1)>0,"LONG","SHORT"), LEN(A3:A)))))`
    ]];

    sheet.getRange('O3:V3').setFormulas(formulas);

    sheet.protect().setDescription('Essential Data Sheet').setWarningOnly(true);

  }

  let dataTable = this.getDonationsTable();

  this.writeTable(ss, sheet, dataTable, this.donationsRangeName, 2, 14, 8);

};

/**
 * Returns a table of the current donations data.
 * The donations data is collected when the ledger is processed.
 * @return {Array<Array>} The current donations data.
 */
AssetTracker.prototype.getDonationsTable = function () {

  let table = [];

  for (let donatedLot of this.donatedLots) {

    let lot = donatedLot.lot;

    let dateBuy = lot.date;
    let debitAssetBuy = lot.debitAsset.ticker;
    let debitAssetTypeBuy = lot.debitAsset.assetType;
    let debitExRateBuy = lot.debitExRate;
    let debitAmountBuy = lot.debitAmount;
    let debitFeeBuy = lot.debitFee;
    let walletBuy = lot.walletName;

    let creditAssetBuy = lot.creditAsset.ticker;
    let creditAssetTypeBuy = lot.creditAsset.assetType;
    let creditAmountBuy = lot.creditAmount;
    let creditFeeBuy = lot.creditFee;

    let dateDonation = donatedLot.date;
    let exRateDonation = donatedLot.exRate;
    let walletDonation = donatedLot.walletName;

    table.push([

      dateBuy,
      debitAssetBuy,
      debitAssetTypeBuy,
      debitExRateBuy,
      debitAmountBuy,
      debitFeeBuy,
      walletBuy,

      creditAssetBuy,
      creditAssetTypeBuy,
      creditAmountBuy,
      creditFeeBuy,

      dateDonation,
      exRateDonation,
      walletDonation
    ]);
  }

  return this.sortTable(table, 11);
};

