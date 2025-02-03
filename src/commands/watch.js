const yahooFinance = require('yahoo-finance2').default;

function getCurrencySymbol(currency) {
  const mapping = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$'
  };
  return mapping[currency] || currency;
}

async function watchTicker(ticker, interval) {
  console.log(`Watching ${ticker} every ${interval} seconds. Press Ctrl+C to stop.`);
  setInterval(async () => {
    try {
      const quote = await yahooFinance.quote(ticker);
      console.clear();
      const currencySymbol = getCurrencySymbol(quote.currency);
      const price =
        typeof quote.regularMarketPrice === 'number'
          ? quote.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : quote.regularMarketPrice;
      const change =
        typeof quote.regularMarketChange === 'number'
          ? quote.regularMarketChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : quote.regularMarketChange;
      const changePercent =
        typeof quote.regularMarketChangePercent === 'number'
          ? quote.regularMarketChangePercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
          : quote.regularMarketChangePercent;
      console.log(`Ticker: ${quote.symbol}`);
      console.log(`Price: ${currencySymbol}${price}`);
      console.log(`Change: ${change}`);
      console.log(`% Change: ${changePercent}`);
      console.log(`Currency: ${quote.currency}`);
      console.log(`Time: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error fetching quote:', error.message);
    }
  }, interval * 1000);
}

module.exports = { watchTicker };
