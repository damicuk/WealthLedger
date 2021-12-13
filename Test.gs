function testProcessLedger(locale = 'Europe/Paris') {

  let assetRecords;
  let ledgerRecords;

  let ada = new Asset('ADA', 'Crypto', false, 6);
  let algo = new Asset('ALGO', 'Crypto', false, 8);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 10, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ALGO', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];
  let assetTracker = new AssetTracker();
  assetTracker.validateAssetRecords(assetRecords);
  assetTracker.processAssets(assetRecords);

  assetTracker.validateLedgerRecords(ledgerRecords, 'US');
  assetTracker.processLedger(ledgerRecords);

  let wallet = assetTracker.wallets.get('Kraken');

  let fiatAccount = wallet.fiatAccounts.get('USD');

  let asssetAccount = wallet.assetAccounts.get('ADA');


  let lots = [
    new Lot(new Date(2020, 3, 1), algo, 0, 0, 0, ada, 1000, 0, 'Kraken')
  ];

  // if (incomeLots) {

  //   assert.equal(assetTracker.incomeLots.length, incomeLots.length, 'Income lots length');
  //   assert.deepEqual(assetTracker.incomeLots, incomeLots, 'Income lots');

  // }

}