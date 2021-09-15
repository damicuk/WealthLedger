var Ticker = class Ticker {
  constructor() {
  }

  static isBaseCurrency(ticker) {

    if (ticker === 'EUR') {
      return true;
    }
    return false;
  }

  static isFiat(ticker) {

    if (Ticker.isBaseCurrency(ticker)) {
      return true;
    }
    if (ticker === 'AUD'
      || ticker === 'CAD'
      || ticker === 'USD') {

      return true;
    }
  }

  static isValid(ticker) {

    if (Ticker.isFiat(ticker)
      || Ticker.isForex(ticker)
      || Ticker.isCrypto(ticker)
      || Ticker.isStablecoin(ticker)
      || Ticker.isStock(ticker)) {

      return true;
    }
    return false;
  }

  static isForex(ticker) {

    if (ticker === 'GBP') {
      return true;
    }
    return false;
  }

  static isCrypto(ticker) {

    if (ticker === 'ADA'
      || ticker === 'ALGO'
      || ticker === 'BTC'
      || ticker === 'ETH'
      || ticker === 'NEXO'
      || ticker === 'SOL') {

      return true;
    }
    return false;
  }

  static isStablecoin(ticker) {

    if (ticker === 'EURX'
      || ticker === 'GUSD'
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