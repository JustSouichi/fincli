const yahooFinance = require('yahoo-finance2').default;

async function getQuote(ticker) {
  try {
    const quote = await yahooFinance.quote(ticker);
    console.log(`Ticker: ${quote.symbol}`);
    console.log(`Name: ${quote.longName || quote.shortName || 'N/A'}`);
    console.log(`Price: ${quote.regularMarketPrice}`);
    console.log(`Currency: ${quote.currency}`);
  } catch (error) {
    console.error('Error fetching quote:', error.message);
  }
}

module.exports = { getQuote };
