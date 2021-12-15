function testProcessLedger(locale = 'Europe/Paris') {

  let assetRecords;
  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let gbp = new Asset('GBP', 'Fiat', true, 2);
  let usd = new Asset('USD', 'Fiat', true, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6);
  let algo = new Asset('ALGO', 'Crypto', false, 8);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', '', 0, '', '', '')
  ];

  let assetTracker = new AssetTracker();
  assetTracker.validateAssetRecords(assetRecords);
  assetTracker.processAssets(assetRecords);

  assetTracker.validateLedgerRecords(ledgerRecords, 'UK');
  assetTracker.processLedgerUK(ledgerRecords, locale);
  // let assetPool = assetTracker.assetPools.get('ADA');

  // let wallet = assetTracker.wallets.get('Kraken');

  // let fiatAccount = wallet.fiatAccounts.get('USD');

  // let asssetAccount = wallet.assetAccounts.get('ADA');




}