/**
* Creates the investments report if it doesn't already exist.
* No data is writen to this sheet.
* It contains formulas that pull data from other sheets.
* @param {string} [sheetName] - The name of the sheet.
*/
AssetTracker.prototype.investmentsReport = function (sheetName = this.investmentsReportName) {

  const version = '1';

  let ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (this.getSheetVersion(sheet) !== version) {

    sheet.clear();

    this.trimColumns(sheet, 26);

    sheet.getRange('A1').setValue('SELECT ASSET:').setFontWeight('bold').setFontColor('red');
    sheet.getRange('B1').setFontWeight('bold').setHorizontalAlignment('center');
    sheet.setColumnWidth(1, 110);

    let investmentsAssetsRange = ss.getRangeByName(this.investmentsAssetsRangeName);
    let investmentsChartRange1 = ss.getRangeByName(this.investmentsChartRange1Name);
    let investmentsChartRange2 = ss.getRangeByName(this.investmentsChartRange2Name);
    let investmentsChartRange3 = ss.getRangeByName(this.investmentsChartRange3Name);
    let investmentsChartRange4 = ss.getRangeByName(this.investmentsChartRange4Name);
    let investmentsChartRange5 = ss.getRangeByName(this.investmentsChartRange5Name);
    let investmentsChartRange6 = ss.getRangeByName(this.investmentsChartRange6Name);
    let investmentsChartRange7 = ss.getRangeByName(this.investmentsChartRange7Name);
    let investmentsChartRange8 = ss.getRangeByName(this.investmentsChartRange8Name);

    let assetRule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(investmentsAssetsRange)
      .setAllowInvalid(false)
      .setHelpText(`Select an asset from the drop-down list.`)
      .build();
    sheet.getRange('B1').setDataValidation(assetRule);

    let chart1 = sheet.newChart().asLineChart()
      .addRange(investmentsChartRange1)
      .setNumHeaders(1)
      .setTitle('Asset Type: Net Investment Timeline')
      .setXAxisTitle('Date')
      .setPosition(3, 1, 14, 0)
      .build();

    sheet.insertChart(chart1);

    let chart2 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange2)
      .setNumHeaders(1)
      .setTitle('Asset Type: Net Investment vs Current Value')
      .setPosition(22, 1, 14, 0)
      .build();

    sheet.insertChart(chart2);

    let chart3 = sheet.newChart().asLineChart()
      .addRange(investmentsChartRange3)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Total Units and Net Investment Timeline')
      .setXAxisTitle('Date')
      .setOption('series', [{}, { targetAxisIndex: 1 }])
      .setPosition(3, 7, 14, 0)
      .build();

    sheet.insertChart(chart3);

    let chart4 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange4)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Net Investment vs Current Value')
      .setOption('useFirstColumnAsDomain', false)
      .setPosition(22, 7, 14, 0)
      .build();

    sheet.insertChart(chart4);

    let chart5 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange5)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Units x Price Range')
      .setXAxisTitle('Price Range')
      .setYAxisTitle('Units')
      .setLegendPosition(Charts.Position.RIGHT)
      .setStacked()
      .setPosition(3, 13, 24, 0)
      .build();

    sheet.insertChart(chart5);

    let chart6 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange6)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Cost x Price Range')
      .setXAxisTitle('Price Range')
      .setYAxisTitle('Cost')
      .setLegendPosition(Charts.Position.RIGHT)
      .setStacked()
      .setPosition(22, 13, 24, 0)
      .build();

    sheet.insertChart(chart6);

    let chart7 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange7)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Net Units x Price Range')
      .setXAxisTitle('Price Range')
      .setYAxisTitle('Units')
      .setLegendPosition(Charts.Position.RIGHT)
      .setStacked()
      .setPosition(3, 19, 34, 0)
      .build();

    sheet.insertChart(chart7);

    let chart8 = sheet.newChart().asColumnChart()
      .addRange(investmentsChartRange8)
      .setNumHeaders(1)
      .setTitle('Selected Asset: Net Cost x Price Range')
      .setXAxisTitle('Price Range')
      .setYAxisTitle('Cost')
      .setLegendPosition(Charts.Position.RIGHT)
      .setStacked()
      .setPosition(22, 19, 34, 0)
      .build();

    sheet.insertChart(chart8);

    this.setSheetVersion(sheet, version);
  }

  SpreadsheetApp.flush();
  // sheet.autoResizeColumn(1);
};