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
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 10000, '', '', '', '', '', '', '', '')
  ];

  let assetTracker = new AssetTracker();
  assetTracker.validateAssetRecords(assetRecords);
  assetTracker.processAssets(assetRecords);

  assetTracker.validateLedgerRecords(ledgerRecords, 'US');
  assetTracker.processLedger(ledgerRecords);
  // let assetPool = assetTracker.assetPools.get('ADA');

  // let wallet = assetTracker.wallets.get('Kraken');

  // let fiatAccount = wallet.fiatAccounts.get('USD');

  // let asssetAccount = wallet.assetAccounts.get('ADA');




}