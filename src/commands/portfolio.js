const yahooFinance = require('yahoo-finance2').default;

async function showPortfolio(tickers) {
  try {
    const quotes = await Promise.all(
      tickers.map((ticker) => yahooFinance.quote(ticker))
    );
    const tableData = quotes.map((quote) => ({
      Symbol: quote.symbol,
      Name: quote.longName || quote.shortName || 'N/A',
      Price: quote.regularMarketPrice,
      Change: quote.regularMarketChangePercent
        ? `${quote.regularMarketChangePercent.toFixed(2)}%`
        : 'N/A'
    }));
    console.table(tableData);
  } catch (error) {
    console.error('Error fetching portfolio data:', error.message);
  }
}

module.exports = { showPortfolio };
