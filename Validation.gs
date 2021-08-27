/**
 * Retrieves and validates the ledger records.
 * Uses the error handler to handle any ValidatioError.
 * Displays toast on success.
 */
AssetTracker.prototype.validateLedger = function () {

  try {
    let ledgerRecords = this.getLedgerRecords();
    this.validateLedgerRecords(ledgerRecords);
  }
  catch (error) {
    if (error instanceof ValidationError) {
      this.handleError('validation', error.message, error.rowIndex, error.columnName);
      return;
    }
    else {
      throw error;
    }
  }

  SpreadsheetApp.getActive().toast('All looks good', 'Ledger Valid', 10);
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
  let debitAsset = ledgerRecord.debitAsset;
  let debitExRate = ledgerRecord.debitExRate;
  let debitAmount = ledgerRecord.debitAmount;
  let debitFee = ledgerRecord.debitFee;
  let debitWalletName = ledgerRecord.debitWalletName;
  let creditAsset = ledgerRecord.creditAsset;
  let creditExRate = ledgerRecord.creditExRate;
  let creditAmount = ledgerRecord.creditAmount;
  let creditFee = ledgerRecord.creditFee;
  let creditWalletName = ledgerRecord.creditWalletName;
  let lotMatching = ledgerRecord.lotMatching;

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
  else if (debitAsset && !Ticker.isBaseCurrency(debitAsset) && !Ticker.isAsset(debitAsset)) {
    throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is not recognized`, rowIndex, 'debitAsset');
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
  else if (creditAsset && !Ticker.isBaseCurrency(creditAsset) && !Ticker.isAsset(creditAsset)) {
    throw new ValidationError(`${action} row ${rowIndex}: Credit currency (${creditAsset}) is not recognized - neither fiat (${Currency.validFiats.join(', ')}) nor crypto (2-9 characters [A-Za-z0-9_]).`, rowIndex, 'creditAsset');
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
  else if (lotMatching && !AssetTracker.lotMatchings.includes(lotMatching)) {
    throw new ValidationError(`${action} row ${rowIndex}: Lot matching (${lotMatching}) is not valid (${AssetTracker.lotMatchings.join(', ')}) or blank.`, rowIndex, 'lotMatching');
  }
  else if (action === 'Transfer') { //Transfer
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit currency specified.`, rowIndex, 'debitAsset');
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
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit currency (${creditAsset}) blank. It is inferred from the debit currency (${debitAsset}).`, rowIndex, 'creditAsset');
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
    else if (!debitWalletName && !creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit or credit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (Ticker.isBaseCurrency(debitAsset)) { //Base currency transfer
      if (debitWalletName && creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: For home currency transfers, leave debit wallet (${debitWalletName}) blank for deposits or credit wallet (${creditWalletName}) blank for withdrawals.`, rowIndex, 'debitWalletName');
      }
    }
    else if (Ticker.isAsset(debitAsset)) { //Asset transfer
      if (!debitWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
      }
      else if (!creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: No credit wallet specified.`, rowIndex, 'creditWalletName');
      }
      else if (debitWalletName === creditWalletName) {
        throw new ValidationError(`${action} row ${rowIndex}: Debit wallet (${debitWalletName}) and credit wallet (${creditWalletName}) must be different.`, rowIndex, 'debitWalletName');
      }
    }
  }
  else if (action === 'Trade') { //Trade
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit currency specified.`, rowIndex, 'debitAsset');
    }
    else if (!creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No credit currency specified.`, rowIndex, 'creditAsset');
    }
    else if (debitAsset === creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit currency (${debitAsset}) and credit currency (${creditAsset}) must be different.`, rowIndex, 'debitAsset');
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
    else if (!debitWalletName) {
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
    else if (Ticker.isAsset(creditAsset) && creditFee >= creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: Asset credit fee must be less than the credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditFee > creditAmount) {
      throw new ValidationError(`${action} row ${rowIndex}: Fiat credit fee must be less than or equal to credit amount (or blank).`, rowIndex, 'creditFee');
    }
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank. It is inferred from the debit wallet (${debitWalletName}).`, rowIndex, 'creditWalletName');
    }
    else if (Ticker.isBaseCurrency(debitAsset)) { //Buy asset
      if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
      else if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Debit asset is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
    }
    else if (Ticker.isBaseCurrency(creditAsset)) { //Sell asset
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is the accounting currency (${this.accountingCurrency}). Leave credit exchange rate blank.`, rowIndex, 'creditExRate');
      }
      else if (debitExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is the accounting currency (${this.accountingCurrency}). Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
      }
    }
    else { //Exchange assets
      if (debitExRate === '') {
        throw new ValidationError(`${action} row ${rowIndex}: Missing debit currency (${debitAsset}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'debitExRate');
      }
      else if (debitExRate <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: Debit exchange rate must be greater than 0.`, rowIndex, 'debitExRate');
      }
      else if (creditExRate === '') {
        throw new ValidationError(`${action} row ${rowIndex}: Missing credit currency (${creditAsset}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
      }
      else if (creditExRate <= 0) {
        throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
      }
    }
  }
  else if (action === 'Income') { //Income
    if (debitAsset === '' && Ticker.isBaseCurrency(creditAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset must be specified when credit asset is base currency (${this.accountingCurrency}).`, rowIndex, 'debitAsset');
    }
    else if (debitExRate !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit exchange rate blank.`, rowIndex, 'debitExRate');
    }
    else if (debitAmount !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit amount blank.`, rowIndex, 'debitAmount');
    }
    else if (debitFee !== '') {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit fee blank.`, rowIndex, 'debitFee');
    }
    else if (debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave debit wallet (${debitWalletName}) blank.`, rowIndex, 'debitWalletName');
    }
    else if (!creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No credit asset specified.`, rowIndex, 'creditAsset');
    }
    else if (creditExRate !== '' && Ticker.isBaseCurrency(creditAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blanc when credit asset is base currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (creditExRate === '' && !Ticker.isBaseCurrency(creditAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (creditExRate <= 0 && !Ticker.isBaseCurrency(creditAsset)) {
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
    else if (!creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: No credit wallet specified.`, rowIndex, 'creditWalletName');
    }
    else if (debitAsset === '') { //Interest/Rewards
      if (Ticker.isBaseCurrency(creditAsset)) {
        throw new ValidationError(`${action} row ${rowIndex}: Credit asset is base currency (${this.accountingCurrency}). Not supported when debit asset is blanc.`, rowIndex, 'creditAsset');
      }
    }
    else if (Ticker.isBaseCurrency(creditAsset)) { //Base currency dividend
      if (creditExRate !== '') {
        throw new ValidationError(`${action} row ${rowIndex}: Leave credit exchange rate blanc when credit asset is base currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
      }
    }
    else if (creditExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Missing credit currency (${creditCurrency}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'creditExRate');
    }
    else if (creditExRate <= 0) {
      throw new ValidationError(`${action} row ${rowIndex}: Credit exchange rate must be greater than 0.`, rowIndex, 'creditExRate');
    }
  }
  else if (action === 'Donation') { //Donation
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit currency specified.`, rowIndex, 'debitAsset');
    }
    else if (Ticker.isBaseCurrency(debitAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is base currency, not supported.`, rowIndex, 'debitAsset');
    }
    else if (debitExRate === '') {
      throw new ValidationError(`${action} row ${rowIndex}: Missing debit currency (${debitAsset}) to accounting currency (${this.accountingCurrency}) exchange rate.`, rowIndex, 'debitExRate');
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
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit currency (${creditAsset}) blank.`, rowIndex, 'creditAsset');
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
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Gift') { //Gift
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit currency specified.`, rowIndex, 'debitAsset');
    }
    else if (Ticker.isBaseCurrency(debitAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is base currency, not supported.`, rowIndex, 'debitAsset');
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
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit currency (${creditAsset}) blank.`, rowIndex, 'creditAsset');
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
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else if (action === 'Fee') { //Fee
    if (!debitAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit currency specified.`, rowIndex, 'debitAsset');
    }
    else if (Ticker.isBaseCurrency(debitAsset)) {
      throw new ValidationError(`${action} row ${rowIndex}: Debit asset (${debitAsset}) is base currency, not supported.`, rowIndex, 'debitAsset');
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
    else if (!debitWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: No debit wallet specified.`, rowIndex, 'debitWalletName');
    }
    else if (creditAsset) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit currency (${creditAsset}) blank.`, rowIndex, 'creditAsset');
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
    else if (creditWalletName) {
      throw new ValidationError(`${action} row ${rowIndex}: Leave credit wallet (${creditWalletName}) blank.`, rowIndex, 'creditWalletName');
    }
  }
  else {
    throw new ValidationError(`Ledger row ${rowIndex}: Action (${action}) is invalid.`, rowIndex, 'action');
  }
};