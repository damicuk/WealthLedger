function testProcessLedger(locale = 'Europe/Paris') {

   assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000, '', 'IB', '')
  ];



  let assetTracker = new AssetTracker();
  assetTracker.validateAssetRecords(assetRecords);
  assetTracker.processAssets(assetRecords);

  assetTracker.validateLedgerRecords(ledgerRecords, 'US');
  assetTracker.processLedger(ledgerRecords);

  // let wallet = assetTracker.wallets.get('IB');
  // let fiatAccount = wallet.fiatAccounts.get('USD');
  // let asssetAccount = wallet.assetAccounts.get('ADA');

  // Logger.log(fiatAccount.balance);

  // assert.equal(fiatAccount.balance, balance, 'Fiat account balance');

  // assert.equal(asssetAccount.lots.length, lots.length, 'Asset account lots length');
  // assert.deepEqual(asssetAccount.lots, lots, 'Asset account lots');

  // assert.equal(assetTracker.closedLots.length, closedLots.length, 'Closed lots length');
  // assert.deepEqual(assetTracker.closedLots, closedLots, 'Closed lots');

}