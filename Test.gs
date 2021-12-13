function testProcessLedger(locale = 'Europe/Paris') {

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, 10, '', 'ADA', '', 1000, 10, 'Ledger', '')
  ];

  let assetTracker = new AssetTracker();
  assetTracker.validateAssetRecords(assetRecords);
  assetTracker.processAssets(assetRecords);

  assetTracker.validateLedgerRecords(ledgerRecords, 'US');
  assetTracker.processLedger(ledgerRecords);

  let wallet = assetTracker.wallets.get('Ledger');

  // if (fiat) {

  //   let fiatAccount = wallet.fiatAccounts.get(fiat.ticker);

  //   assert.equal(fiatAccount.balance, balance, 'Fiat account balance');

  // }

  // if (asset) {

  //   let asssetAccount = wallet.assetAccounts.get(asset.ticker);

  //   assert.equal(asssetAccount.lots.length, lots.length, 'Asset account lots length');
  //   assert.deepEqual(asssetAccount.lots, lots, 'Asset account lots');

  //   assert.equal(assetTracker.closedLots.length, closedLots.length, 'Closed lots length');
  //   assert.deepEqual(assetTracker.closedLots, closedLots, 'Closed lots');

  // }

  // if (incomeLots) {

  //   assert.equal(assetTracker.incomeLots.length, incomeLots.length, 'Income lots length');
  //   assert.deepEqual(assetTracker.incomeLots, incomeLots, 'Income lots');

  // }

}