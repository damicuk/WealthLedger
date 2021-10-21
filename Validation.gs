/**
 * Retrieves and validates the api price records.
 * Retrieves and validates the asset records.
 * Retrieves and validates the ledger records.
 * Uses the error handler to handle any ValidatioError.
 * Displays toast on success.
 */
AssetTracker.prototype.validateLedger = function () {

  if (!this.validateApiPriceSheet(this.ccApiName)) {
    return;
  }

  if (!this.validateApiPriceSheet(this.cmcApiName)) {
    return;
  }

  if (!this.validateProcessAssetsSheet()) {
    return;
  }

  let results = this.validateLedgerSheet();
  let success = results[0];
  if (!success) {
    return;
  }

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
};

/**
 * Retrieves and validates the asset records from the asset sheet.
 * Throws a ValidationError on failure.
 * Processes the asset records.
 * Adds to the Map of assets.
 * Sets the base currency.
 * @return {boolean} Whether validation completed successfully.
 */
AssetTracker.prototype.validateProcessAssetsSheet = function () {

  let assetRecords;
  try {
    assetRecords = this.getAssetRecords();
    this.validateAssetRecords(assetRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, this.assetsSheetName, error.rowIndex, AssetRecord.getColumnIndex(error.columnName));
      return false;
    }
    else {
      throw error;
    }
  }

  this.processAssets(assetRecords);

  return true;

}

/**
 * Retrieves and validates the ledger records from the ledger sheet.
 * Throws a ValidationError on failure.
 * @return {[boolean, LedgerRecord[]]} Whether validation completed successfully and the ledger records.
 */
AssetTracker.prototype.validateLedgerSheet = function () {

  let success = true;
  let ledgerRecords;
  try {
    ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, this.ledgerSheetName, error.rowIndex, LedgerRecord.getColumnIndex(error.columnName));
      success = false;
    }
    else {
      throw error;
    }
  }
  return [success, ledgerRecords];
}

/**
 * Retrieves and validates the api price records from the named api price sheet.
 * Uses the error handler to handle any ValidatioError.
 * @param {string} sheetName - The name of the api price sheet to validate. 
 * @return {boolean} Whether validation completed successfully.
 */
AssetTracker.prototype.validateApiPriceSheet = function (sheetName) {

  let apiPriceRecords;
  try {
    apiPriceRecords = this.getApiPriceRecords(sheetName);
    this.validateApiPriceRecords(apiPriceRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      let message = `${sheetName} ${error.message}`;
      this.handleError('validation', message, sheetName, error.rowIndex, ApiPriceRecord.getColumnIndex(error.columnName));
      return false;
    }
    else {
      throw error;
    }
  }
  return true;
}

/**
 * Validates a set of api price records and throws a ValidationError on failure.
 * @param {ApiPriceRecord[]} apiPriceRecords - The colection of api price records to validate.
 */
AssetTracker.prototype.validateApiPriceRecords = function (apiPriceRecords) {

  let rowIndex = this.apiPriceSheetHeaderRows + 1;
  for (let apiPriceRecord of apiPriceRecords) {
    this.validateApiPriceRecord(apiPriceRecord, rowIndex++);
  }
};

/**
 * Validates an api price record and throws a ValidationError on failure.
 * @param {ApiPriceRecord} apiPriceRecord - The api price record to validate.
 * @param {number} rowIndex - The index of the row in the api price sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.validateApiPriceRecord = function (apiPriceRecord, rowIndex) {

  let ticker = apiPriceRecord.ticker;
  if (ticker !== '' && !Asset.tickerRegExp.test(ticker)) {
    throw new ValidationError(`row ${rowIndex}: Asset (${ticker}) format is invalid (2-9 alphanumeric characters [A-Za-z0-9_]).`, rowIndex, 'ticker');
  }
}

/**
 * Validates a set of asset records and throws a ValidationError on failure.
 * @param {AssetRecord[]} assetRecords - The colection of asset records to validate.
 */
AssetTracker.prototype.validateAssetRecords = function (assetRecords) {

  let rowIndex = this.assetsHeaderRows + 1;
  let tickers = new Set();
  let fiatBase;
  for (let assetRecord of assetRecords) {
    let ticker = assetRecord.ticker;
    let assetType = assetRecord.assetType;

    this.validateAssetRecord(assetRecord, tickers, fiatBase, rowIndex++);

    if (assetType === 'Fiat Base') {
      fiatBase = ticker;
    }
    tickers.add(ticker);
  }
  if (!fiatBase) {
    throw new ValidationError(`Fiat Base has not been declared in the Assets sheet. One asset must have asset type of 'Fiat Base'.`);
  }
};

/**
 * Validates an asset record and throws a ValidationError on failure.
 * @param {AssetRecord} assetRecord - The asset record to validate.
 * @param {string[]} tickers - The collection of asset tickers already declared.
 * @param {string} fiatBase - Fiat base if already declared. 
 * @param {number} rowIndex - The index of the row in the sasset sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.validateAssetRecord = function (assetRecord, tickers, fiatBase, rowIndex) {

  let ticker = assetRecord.ticker;
  let assetType = assetRecord.assetType;
  let decimalPlaces = assetRecord.decimalPlaces;
  let currentPrice = assetRecord.currentPrice;

  if (ticker === '') {
    throw new ValidationError(`Assets row ${rowIndex}: Asset is missing.`, rowIndex, 'ticker');
  }
  else if (tickers.has(ticker)) {
    throw new ValidationError(`Assets row ${rowIndex}: Duplicate entry for (${ticker}). An asset can only be declared once`, rowIndex, 'ticker');
  }
  else if (!Asset.tickerRegExp.test(ticker)) {
    throw new ValidationError(`Assets row ${rowIndex}: Asset (${ticker}) format is invalid (2-9 alphanumeric characters [A-Za-z0-9_]).`, rowIndex, 'ticker');
  }
  else if (assetType === '') {
    throw new ValidationError(`Assets row ${rowIndex}: Asset type is missing.`, rowIndex, 'assetType');
  }
  else if (!Asset.assetTypeRegExp.test(assetType)) {
    throw new ValidationError(`Assets row ${rowIndex}: Asset type (${assetType}) format is invalid (1-20 alphanumeric characters [A-Za-z0-9_-]). Spaces between characters allowed.`, rowIndex, 'assetType');
  }
  else if (assetType === 'Fiat Base' && fiatBase) {
    throw new ValidationError(`Assets row ${rowIndex}: Fiat Base has already been declared (${fiatBase}). Only one asset can be Fiat Base.`, rowIndex, 'assetType');
  }
  else if (decimalPlaces === '') {
    throw new ValidationError(`Assets row ${rowIndex}: Decimal places is missing.`, rowIndex, 'decimalPlaces');
  }
  else if (!Asset.decimalPlacesRegExp.test(decimalPlaces)) {
    throw new ValidationError(`Assets row ${rowIndex}: Decimal places is not valid (integer between 0 and 8).`, rowIndex, 'decimalPlaces');
  }
  else if (assetType === 'Fiat Base' && currentPrice != 1) {
    throw new ValidationError(`Assets row ${rowIndex}: Fiat base current price must be 1.`, rowIndex, 'currentPrice');
  }
  else if (isNaN(currentPrice)) {
    throw new ValidationError(`Assets row ${rowIndex}: Current price is not valid (number or blank).`, rowIndex, 'currentPrice');
  }
  else if (currentPrice < 0) {
    throw new ValidationError(`Assets row ${rowIndex}: Current price must be greater or equal to 0 (or blank).`, rowIndex, 'currentPrice');
  }
};

/**
 * Validates a set of ledger records and throws a ValidationError on failure.
 * Stops reading if it encounters the stop action.
 * @param {LedgerRecord[]} ledgerRecords - The colection of ledger records to validate.
 */
AssetTracker.prototype.validateLedgerRecords = function (ledgerRecords) {

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    ledgerRecords = ledgerRecords.slice().reverse();
    let previousRecord;
    let rowIndex = this.ledgerHeaderRows + ledgerRecords.length;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.validateLedgerRecord(ledgerRecord, previousRecord, rowIndex--);
      previousRecord = ledgerRecord;
    }
  }
  else {

    let previousRecord;
    let rowIndex = this.ledgerHeaderRows + 1;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.validateLedgerRecord(ledgerRecord, previousRecord, rowIndex++);
      previousRecord = ledgerRecord;
    }
  }
};

/**
 * Validates a ledger record and throws a ValidationError on failure.
 * @param {LedgerRecord} ledgerRecord - The ledger record to validate.
 * @param {LedgerRecord} previousRecord - The previous ledger record validated.
 * @param {number} rowIndex - The index of the row in the ledger sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.validateLedgerRecord = function (ledgerRecord, previousRecord, rowIndex) {

  let date = ledgerRecord.date;
  let action = ledgerRecord.action;
  let debitAssetTicker = ledgerRecord.debitAsset;
  let debitExRate = ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let debitWalletName = ledgerRecord.debitWalletName;
  let creditAssetTicker = ledgerRecord.creditAsset;
  let creditExRate = ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;
  let creditWalletName = ledgerRecord.creditWalletName;
  let lotMatching = ledgerRecord.lotMatching;

  let debitAsset;
  if (debitAssetTicker) {
    debitAsset = this.assets.get(debitAssetTicker);
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAssetTicker}) is not found in the Assets sheet.`, rowIndex, 'debitAsset');
    }
  }

  let creditAsset;
  if (creditAssetTicker) {
    creditAsset = this.assets.get(creditAssetTicker);
    if (!creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit asset (${creditAssetTicker}) is not found in the Assets sheet.`, rowIndex, 'creditAsset');
    }
  }

  if (isNaN(date)) {
    throw new ValidationError(`${action} row ${rowIndex}: Invalid date.`, rowIndex, 'date');
  }
  else if (previousRecord && date < previousRecord.date) {
    throw new ValidationError(`${action} row ${rowIndex}: Dates must be in chronological or reverse chronological order.`, rowIndex, 'date');
  }
  else if (date > new Date()) {
    throw new ValidationError(`${action} row ${rowIndex}: Date must be in the past.`, rowIndex, 'date');
  }
  else if (action === '') {
    throw new ValidationError(`Ledger row ${rowIndex}: No action specified.`, rowIndex, 'action');
  }
  else if (isNaN(debitExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: Debit exchange rate is not valid (number or blank).`, rowIndex, 'debitExRate');
  }
  else if (isNaN(debitAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: Debit amount is not valid (number or blank).`, rowIndex, 'debitAmount');
  }
  else if (isNaN(debitFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: Debit fee is not valid (number or blank).`, rowIndex, 'debitFee');
  }
  else if (isNaN(creditExRate)) {
    throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate is not valid (number or blank).`, rowIndex, 'creditExRate');
  }
  else if (isNaN(creditAmount)) {
    throw new ValidationError(`${action} row ${rowIndex}: Credit amount is not valid (number or blank).`, rowIndex, 'creditAmount');
  }
  else if (isNaN(creditFee)) {
    throw new ValidationError(`${action} row ${rowIndex}: Credit fee is not valid (number or blank).`, rowIndex, 'creditFee');
  }
  else if (lotMatching !== '' && !AssetTracker.lotMatchings.includes(lotMatching)) {
    throw new ValidationError(`${action} row ${rowIndex}: Lot matching (${lotMatching}) is not valid (${AssetTracker.lotMatchings.join(', ')}) or blank.`, rowIndex, 'lotMatching');
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit asset (${creditAsset}) blank. It is inferred from the debit asset (${debitAsset}).`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit amount blank. It is inferred from the debit amount and debit fee.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (debitWalletName === '' && creditWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit or credit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (debitAsset.isFiat) { //Fiat transfer
      if (debitWalletName !== '' && creditWalletName !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: For base currency transfers, leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, rowIndex, 'debitWalletName');
      }
    }
    else { //Asset transfer
      if (debitWalletName === '') {
        throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
      }
      else if (creditWalletName === '') {
        throw new ValidationError(`${action} row ${rowIndex}: No credit wallet specified.`, rowIndex, 'creditWalletName');
      }
      else if (debitWalletName === creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: Debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, rowIndex, 'debitWalletName');
      }
    }
  }
  else if (action === 'Trade') {
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (!creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No credit asset specified.`, rowIndex, 'creditAsset');
    }
    else if (debitAsset === creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) and credit asset (${creditAsset}) must be different.`, rowIndex, 'debitAsset');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater or equal to 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (debitWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No credit amount specified.`, rowIndex, 'creditAmount');
    }
    else if (creditAmount < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be greater or equal to 0.`, rowIndex, 'creditAmount');
    }
    else if (creditFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit fee must be greater or equal to 0 (or blank).`, rowIndex, 'creditFee');
    }
    else if (!creditAsset.isFiat && creditFee >= creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: Asset credit fee must be less than the credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditFee > creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: Fiat credit fee must be less than or equal to credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, rowIndex, 'creditWalletName');
    }
    else if (debitAsset.isBaseCurrency) { //Base currency buy trade
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is the base currency (${this.baseCurrency}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is the base currency (${this.baseCurrency}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (creditAsset.isBaseCurrency) { //Base currency sell trade
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is the base currency (${this.baseCurrency}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is the base currency (${this.baseCurrency}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (debitAsset.isFiat && creditAsset.isFiat) { //Fiat-fiat trade
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Fiat exchange: (${debitAsset}/${creditAsset}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
      else if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Fiat exchange: (${debitAsset}/${creditAsset}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
    }
    else { //Non base currency, non fiat-fiat trade
      if (debitExRate === '' && creditExRate === '') {
        throw new ValidationError(`${action} row ${rowIndex}: Non base currency trade requires debit asset (${debitAsset}) and/or credit asset (${creditAsset}) to base currency (${this.baseCurrency}) exchange rate.`, rowIndex, 'debitExRate');
      }
      else if (debitExRate !== '' && debitExRate <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: Debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
      }
      else if (creditExRate !== '' && creditExRate <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
      }
    }
  }
  else if (action === 'Income') {
    if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit amount blank.`, rowIndex, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit fee blank.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit wallet (${debitWalletName}) blank.`, rowIndex, 'debitWalletName');
    }
    else if (!creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No credit asset specified.`, rowIndex, 'creditAsset');
    }
    else if (creditAsset.isBaseCurrency && creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank when credit asset is base currency (${this.baseCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (!creditAsset.isBaseCurrency && creditExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Missing credit asset (${creditAsset}) to base currency (${this.baseCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (!creditAsset.isBaseCurrency && creditExRate <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No credit amount specified.`, rowIndex, 'creditAmount');
    }
    else if (creditAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be greater than 0.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No credit wallet specified.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Donation') {
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitAsset.isFiat) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is fiat, not supported.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Missing debit asset (${debitAsset}) to base currency (${this.baseCurrency}) exchange rate.`, rowIndex, 'debitExRate');
    }
    else if (debitExRate <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (debitWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit asset (${creditAsset}) blank.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit amount blank.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Gift') { //Gift
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit amount specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (debitWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit asset (${creditAsset}) blank.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit amount blank.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Fee') {
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit amount blank.`, rowIndex, 'debitAmount');
    }
    else if (debitFee === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit fee specified.`, rowIndex, 'debitFee');
    }
    else if (debitFee <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater than 0.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit asset (${creditAsset}) blank.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit amount blank.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Split') {
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitAsset.isFiat) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is fiat, not supported.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '' && creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave either debit amount blank for normal splits or credit amount blank for reverse splits.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount !== '' && (debitAmount <= 1 || !Number.isInteger(debitAmount))) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be an integer greater than 1.`, rowIndex, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit fee blank.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit wallet (${debitWalletName}) blank.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit asset (${creditAsset}) blank.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (debitAmount === '' && creditAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Fill either credit amount for normal splits or debit amount for reverse splits.`, rowIndex, 'creditAmount');
    }
    else if (creditAmount !== '' && (creditAmount <= 1 || !Number.isInteger(creditAmount))) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be an integer greater than 1.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else {
    throw new ValidationError(`Ledger row ${rowIndex}: Action (${action}) is invalid.`, rowIndex, 'action');
  }
};