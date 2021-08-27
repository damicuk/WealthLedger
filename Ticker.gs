var Ticker = class Ticker {
  constructor() {
  }

  static isBaseCurrency(ticker) {

    if (ticker === 'EUR') {
      return true;
    }
    return false;
  }

  static isAsset(ticker) {

    if (Ticker.isForex(ticker)
      || Ticker.isCrypto(ticker)
      || Ticker.isStablecoin(ticker)
      || Ticker.isStock(ticker)) {

      return true;
    }
    return false;
  }

  static isForex(ticker) {

    if (ticker === 'USD') {
      return true;
    }
    return false;
  }

  static isCrypto(ticker) {

    if (ticker === 'ADA'
      || ticker === 'BTC'
      || ticker === 'ETH'
      || ticker === 'NEXO') {

      return true;
    }
    return false;
  }

  static isStablecoin(ticker) {

    if (ticker === 'EURX'
      || ticker === 'USDC'
      || ticker === 'USDT') {

      return true;
    }
    return false;
  }

  static isStock(ticker) {

    if (ticker === 'DBXP'
      || ticker === 'IWDA'
      || ticker === 'JREG'
      || ticker === 'LYXF'
      || ticker === 'SGLD'
      || ticker === 'ZPRV') {

      return true;
    }
    return false;
  }
}