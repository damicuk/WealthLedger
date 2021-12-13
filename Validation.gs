/**
 * Retrieves and validates the api price records.
 * Retrieves and validates the asset records.
 * Retrieves and validates the ledger records.
 * Uses the error handler to handle any ValidatioError.
 * Displays toast on success.
 */
AssetTracker.prototype.validate = function () {

  let assetsValidationResults = this.validateAssetsSheet();
  let assetsValidationSuccess = assetsValidationResults[0];
  let assetRecords = assetsValidationResults[1];
  if (!assetsValidationSuccess) {
    return;
  }

  this.processAssets(assetRecords);

  let ledgerValidationResults = this.validateLedgerSheet();
  let ledgerValidationSuccess = ledgerValidationResults[0];
  if (!ledgerValidationSuccess) {
    return;
  }

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
};

/**
 * Retrieves and validates the asset records from the asset sheet.
 * Throws a ValidationError on failure.
 * Processes the asset records.
 * Adds to the Map of assets.
 * Sets fiat base.
 * @return {Array<boolean, Array<AssetRecord>, number>} Whether validation completed successfully, the asset records and the row index of fiat base.
 */
AssetTracker.prototype.validateAssetsSheet = function () {

  let success = true;
  let assetRecords;
  let fiatBaseRowIndex;
  try {
    assetRecords = this.getAssetRecords();
    fiatBaseRowIndex = this.validateAssetRecords(assetRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, this.assetsSheetName, error.rowIndex, AssetRecord.getColumnIndex(error.columnName));
      success = false;
    }
    else {
      throw error;
    }
  }

  return [success, assetRecords, fiatBaseRowIndex];

};

/**
 * Retrieves and validates the ledger records from the ledger sheet.
 * Throws a ValidationError on failure.
 * @return {Array<boolean, Array<LedgerRecord>>} Whether validation completed successfully and the ledger records.
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
};

/**
 * Validates a set of asset records and throws a ValidationError on failure.
 * @param {Array<AssetRecord>} assetRecords - The colection of asset records to validate.
 * @return {number} The row index of fiat base.
 */
AssetTracker.prototype.validateAssetRecords = function (assetRecords) {

  let rowIndex = this.assetsHeaderRows + 1;
  let tickers = new Set();
  let fiatBase;
  let fiatBaseRowIndex;
  for (let assetRecord of assetRecords) {
    let ticker = assetRecord.ticker;
    let assetType = assetRecord.assetType;

    this.validateAssetRecord(assetRecord, tickers, fiatBase, rowIndex);

    if (assetType === 'Fiat Base') {
      fiatBase = ticker;
      fiatBaseRowIndex = rowIndex;
    }
    tickers.add(ticker);
    rowIndex++;
  }
  if (!fiatBase) {
    throw new ValidationError(`Fiat Base has not been declared in the Assets sheet. One asset must have asset type of 'Fiat Base'.`, this.assetsHeaderRows + 1, 'assetType');
  }
  return fiatBaseRowIndex;
};

/**
 * Validates an asset record and throws a ValidationError on failure.
 * @param {AssetRecord} assetRecord - The asset record to validate.
 * @param {Array<string>} tickers - The collection of asset tickers already declared.
 * @param {string} fiatBase - Fiat base if already declared. 
 * @param {number} rowIndex - The index of the row in the sasset sheet used to set the current cell in case of an error.
 */
AssetTracker.prototype.validateAssetRecord = function (assetRecord, tickers, fiatBase, rowIndex) {

  let ticker = assetRecord.ticker;
  let assetType = assetRecord.assetType;
  let decimalPlaces = assetRecord.decimalPlaces;
  let currentPrice = assetRecord.currentPrice;
  let apiName = assetRecord.apiName;

  if (ticker === '') {
    throw new ValidationError(`Assets row ${rowIndex}: Asset is missing.`, rowIndex, 'ticker');
  }
  else if (tickers.has(ticker)) {
    throw new ValidationError(`Assets row ${rowIndex}: Duplicate entry for (${ticker}). An asset can only be declared once`, rowIndex, 'ticker');
  }
  else if (!Asset.tickerRegExp.test(ticker)) {
    throw new ValidationError(`Assets row ${rowIndex}: Asset (${ticker}) format is invalid.\nInput must be 1-10 characters [A-Za-z0-9_$@].\nOptional prefix of 1-15 characters [A-Za-z0-9_] and colon [:].`, rowIndex, 'ticker');
  }
  else if (assetType === '') {
    throw new ValidationError(`Assets row ${rowIndex}: Asset type is missing.`, rowIndex, 'assetType');
  }
  else if (!Asset.assetTypeRegExp.test(assetType)) {
    throw new ValidationError(`Assets row ${rowIndex}: Asset type (${assetType}) format is invalid.\nInput must be between 1 and 20 characters [A-Za-z0-9_-].\nSpaces between characters allowed.`, rowIndex, 'assetType');
  }
  else if (assetType === 'Fiat Base' && fiatBase) {
    throw new ValidationError(`Assets row ${rowIndex}: Fiat base has already been declared (${fiatBase}). Only one asset can be fiat base.`, rowIndex, 'assetType');
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
    throw new ValidationError(`Assets row ${rowIndex}: Current price (${currentPrice}) is not valid (number or blank).`, rowIndex, 'currentPrice');
  }
  else if (currentPrice < 0) {
    throw new ValidationError(`Assets row ${rowIndex}: Current price must be greater or equal to 0 (or blank).`, rowIndex, 'currentPrice');
  }
  else if (apiName !== '' && !this.validApiNames.includes(apiName)) {
    throw new ValidationError(`Assets row ${rowIndex}: API (${apiName}) is not valid (${this.validApiNames.join(', ')}) or blank.`, rowIndex, 'apiName');
  }
};

/**
 * Validates a set of ledger records and throws a ValidationError on failure.
 * Skips ledger records with the skip action.
 * Stops reading if it encounters the stop action.
 * @param {Array<LedgerRecord>} ledgerRecords - The colection of ledger records to validate.
 * @param {string} [accountingModel] - The accounting model used to determine how to process transactions. Only used for testing otherwise gets value from document properties or default.
 */
AssetTracker.prototype.validateLedgerRecords = function (ledgerRecords, accountingModel) {

  if (!accountingModel) {
    accountingModel = this.accountingModel;
  }

  if (LedgerRecord.inReverseOrder(ledgerRecords)) {

    ledgerRecords = ledgerRecords.slice().reverse();
    let previousRecord;
    let rowIndex = this.ledgerHeaderRows + ledgerRecords.length;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Skip') {
        rowIndex--;
        continue;
      }
      else if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.validateLedgerRecord(ledgerRecord, previousRecord, rowIndex--, accountingModel);
      previousRecord = ledgerRecord;
    }
  }
  else {

    let previousRecord;
    let rowIndex = this.ledgerHeaderRows + 1;
    for (let ledgerRecord of ledgerRecords) {
      if (ledgerRecord.action === 'Skip') {
        rowIndex++;
        continue;
      }
      else if (ledgerRecord.action === 'Stop') {
        break;
      }
      this.validateLedgerRecord(ledgerRecord, previousRecord, rowIndex++, accountingModel);
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
AssetTracker.prototype.validateLedgerRecord = function (ledgerRecord, previousRecord, rowIndex, accountingModel) {

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
  else if (accountingModel === 'UK' && lotMatching !== '') {
    throw new ValidationError(`${action} row ${rowIndex}: Leave lot matching blank when using the UK accounting model.`, rowIndex, 'lotMatching');
  }
  else if (lotMatching !== '' && !AssetTracker.lotMatchings.includes(lotMatching)) {
    throw new ValidationError(`${action} row ${rowIndex}: Lot matching (${lotMatching}) is not valid (${AssetTracker.lotMatchings.join(', ')}) or blank.`, rowIndex, 'lotMatching');
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitAsset && !creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit or credit asset specified.`, rowIndex, 'debitAsset');
    }
    else if (debitAsset && creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Either debit or credit asset must be specified, but not both.`, rowIndex, 'debitAsset');
    }
    if (creditAsset && !creditAsset.isFiat) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit asset must be fiat (or blank).`, rowIndex, 'creditAsset');
    }
    if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (creditAsset) { //Fiat deposits
      if (debitAmount !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Leave debit amount blank when credit asset is specified.`, rowIndex, 'debitAmount');
      }
      else if (debitFee !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Leave debit fee blank when credit asset is specified.`, rowIndex, 'debitFee');
      }
      else if (debitWalletName !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Leave debit wallet blank when credit asset is specified.`, rowIndex, 'debitWalletName');
      }
      else if (creditAmount === '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be specified when credit asset is specified.`, rowIndex, 'creditAmount');
      }
      else if (creditAmount <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be greater than 0 when credit asset is specified.`, rowIndex, 'creditAmount');
      }
      else if (creditWalletName === '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit wallet must be specified when credit asset is specified.`, rowIndex, 'creditWalletName');
      }
    }
    else if (debitAmount === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be specified when debit asset is specified.`, rowIndex, 'debitAmount');
    }
    else if (debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater than 0 when debit asset is specified.`, rowIndex, 'debitAmount');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank) when debit asset is specified.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Debit wallet must be specified when debit asset is specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit amount blank when credit asset is not specified.`, rowIndex, 'creditAmount');
    }
    else if (!debitAsset.isFiat && creditWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Credit wallet must be specified when debit asset is not fiat.`, rowIndex, 'creditWalletName');
    }
    else if (debitWalletName === creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, rowIndex, 'debitWalletName');
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
    else if (debitAmount === 0 && creditAmount === 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount or credit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (creditFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit fee must be greater or equal to 0 (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditFee > creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit fee must be less than or equal to credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, rowIndex, 'creditWalletName');
    }
    else if (debitAsset.isFiatBase) { //Fiat base buy trade
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is fiat base (${this.fiatBase}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is fiat base (${this.fiatBase}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (creditAsset.isFiatBase) { //Fiat base sell trade
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is fiat base (${this.fiatBase}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is fiat base (${this.fiatBase}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (debitAsset.isFiat && creditAsset.isFiat) { //Fiat-fiat trade
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Fiat exchange: (${debitAsset}/${creditAsset}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      else if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Fiat exchange: (${debitAsset}/${creditAsset}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (debitAmount === 0) { //Non fiat base trade with zero debit amount
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Trade with zero debit amount. Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Trade with zero debit amount. Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (creditAmount === 0) { //Non fiat base trade with zero credit amount
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Trade with zero credit amount. Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Trade with zero credit amount. Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (debitExRate === '' && creditExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Non fiat base trade requires either debit asset (${debitAsset}) or credit asset (${creditAsset}) to fiat base (${this.fiatBase}) exchange rate.`, rowIndex, 'debitExRate');
    }
    else if (debitExRate !== '' && creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Remove one of the exchange rates.\n\nNon fiat base trade requires either debit asset (${debitAsset}) or credit asset (${creditAsset}) to fiat base (${this.fiatBase}) exchange rate, but not both. One exchange rate can be deduced from the other and the amounts of assets exchanged. The exchange rate of the least volatile, most widely traded asset is likely to be more accurate.`, rowIndex, 'debitExRate');
    }
    else if (debitExRate !== '' && debitExRate < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit exchange rate must be greater or equal to 0.`, rowIndex, 'debitExRate');
    }
    else if (creditExRate !== '' && creditExRate < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate must be greater or equal to 0.`, rowIndex, 'creditExRate');
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
    else if (creditAsset.isFiatBase && creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank when credit asset is fiat base (${this.fiatBase}).`, rowIndex, 'creditExRate');
    }
    else if (!creditAsset.isFiatBase && creditExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Missing credit asset (${creditAsset}) to fiat base (${this.fiatBase}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (!creditAsset.isFiatBase && creditExRate <= 0) {
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
      throw new ValidationError(`${action} row ${rowIndex}: Missing debit asset (${debitAsset}) to fiat base (${this.fiatBase}) exchange rate.`, rowIndex, 'debitExRate');
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
  else if (action === 'Gift') {
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit asset specified.\n\nFor gifts given debit asset is the asset given.\n\nFor gifts received debit asset must be fiat base (${this.fiatBase}) for the inherited cost basis.`, rowIndex, 'debitAsset');
    }
    if (debitWalletName === '' && creditWalletName === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Either debit wallet (for gifts given) or credit wallet (for gifts received) must be specified.`, rowIndex, 'debitWalletName');
    }
    else if (debitWalletName !== '' && creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Either debit wallet (for gifts given) or credit wallet (for gifts received) must be specified, but not both.`, rowIndex, 'debitWalletName');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitFee < 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit fee must be greater or equal to 0 (or blank).`, rowIndex, 'debitFee');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (debitWalletName !== '') { //Gift given
      if (debitAsset.isFiat) {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset ${debitAsset} is fiat. Not supported for gifts given. Use transfer action instead.`, rowIndex, 'debitAsset');
      }
      else if (debitAmount === '') {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts given, debit amount must be specified.`, rowIndex, 'debitAmount');
      }
      else if (debitAmount <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts given, debit amount must be greater than 0.`, rowIndex, 'debitAmount');
      }
      else if (creditAsset) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts given, leave credit asset (${creditAsset}) blank.`, rowIndex, 'creditAsset');
      }
      else if (creditAmount !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts given, leave credit amount blank.`, rowIndex, 'creditAmount');
      }
      else if (creditFee !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts given, leave credit fee blank.`, rowIndex, 'creditFee');
      }
    }
    else { //Gift received
      if (!debitAsset.isFiatBase) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, debit asset must be fiat base (for the inherited cost basis).`, rowIndex, 'debitAsset');
      }
      else if (debitAmount === '') {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, debit amount must be specified (for the inherited cost basis).`, rowIndex, 'debitAmount');
      }
      else if (debitAmount < 0) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, debit amount must be greater or equal to 0 (for the inherited cost basis).`, rowIndex, 'debitAmount');
      }
      else if (!creditAsset) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, credit asset must be specified.`, rowIndex, 'creditAsset');
      }
      else if (creditAsset.isFiat) {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset ${creditAsset} is fiat. Not supported for gifts received. Use transfer action instead.`, rowIndex, 'creditAsset');
      }
      else if (creditAmount === '') {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, credit amount must be specified.`, rowIndex, 'creditAmount');
      }
      else if (creditAmount <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, credit amount must be greater than 0.`, rowIndex, 'creditAmount');
      }
      else if (creditFee < 0) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, credit fee must be greater or equal to 0 (or blank).`, rowIndex, 'creditFee');
      }
      else if (creditFee && creditFee >= creditAmount) {
        throw new ValidationError(`${action} row ${rowIndex}: For gifts received, credit fee must be less than the credit amount (or blank).`, rowIndex, 'creditFee');
      }
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

    //14 invalid configurations - decide which column to highlight - no obvious pattern
    let columnName;
    if ((debitAsset && debitAmount !== '' && creditAsset && creditAmount !== '')
      || (debitAsset && debitAmount === '' && creditAsset && creditAmount !== '')
      || (debitAsset && debitAmount === '' && creditAsset && creditAmount === '')
      || (debitAsset && debitAmount === '' && !creditAsset && creditAmount !== '')
      || (!debitAsset && debitAmount !== '' && !creditAsset && creditAmount === '')
      || (!debitAsset && debitAmount === '' && !creditAsset && creditAmount === '')
    ) {
      columnName = 'debitAsset';
    }
    else if ((debitAsset && debitAmount === '' && !creditAsset && creditAmount === '')
      || (!debitAsset && debitAmount !== '' && creditAsset && creditAmount !== '')
      || (!debitAsset && debitAmount !== '' && creditAsset && creditAmount === '')
      || (!debitAsset && debitAmount !== '' && !creditAsset && creditAmount !== '')
    ) {
      columnName = 'debitAmount';
    }
    else if ((debitAsset && debitAmount !== '' && creditAsset && creditAmount === '')
      || (!debitAsset && debitAmount === '' && !creditAsset && creditAmount !== '')
    ) {
      columnName = 'creditAsset';
    }
    else if ((debitAsset && debitAmount !== '' && !creditAsset && creditAmount !== '')
      || (!debitAsset && debitAmount === '' && creditAsset && creditAmount === '')
    ) {
      columnName = 'creditAmount';
    }

    if (columnName) {
      throw new ValidationError(`${action} row ${rowIndex}: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, rowIndex, columnName);
    }
    else if (debitAsset && debitAsset.isFiat) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is fiat, not supported.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '' && debitAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit amount must be greater than 0.`, rowIndex, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit fee blank.`, rowIndex, 'debitFee');
    }
    else if (creditAsset && debitWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: For foward splits (increase amount held) leave debit wallet (${debitWalletName}) blank.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset && creditAsset.isFiat) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit asset (${creditAsset}) is fiat, not supported.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
    }
    else if (creditAmount !== '' && creditAmount <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit amount must be greater than 0.`, rowIndex, 'creditAmount');
    }
    else if (creditFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit fee blank.`, rowIndex, 'creditFee');
    }
    else if (debitAsset && creditWalletName !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: For reverse splits (decrease amount held) leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else {
    throw new ValidationError(`Ledger row ${rowIndex}: Action (${action}) is invalid.`, rowIndex, 'action');
  }
};