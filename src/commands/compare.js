const yahooFinance = require('yahoo-finance2').default;

async function compareTickers(tickers) {
  try {
    const quotes = await Promise.all(
      tickers.map((ticker) => yahooFinance.quote(ticker))
    );
    const tableData = quotes.map((quote) => ({
      Symbol: quote.symbol,
      Name: quote.longName || quote.shortName || 'N/A',
      Price: typeof quote.regularMarketPrice === 'number'
        ? quote.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : quote.regularMarketPrice,
      'Change %': quote.regularMarketChangePercent
        ? quote.regularMarketChangePercent.toFixed(2) + '%'
        : 'N/A'
    }));
    console.table(tableData);
  } catch (error) {
    console.error('Error comparing tickers:', error.message);
  }
}

module.exports = { compareTickers };
