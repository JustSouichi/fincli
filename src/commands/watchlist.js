const yahooFinance = require('yahoo-finance2').default;

async function watchList(tickers, interval) {
  console.log(`Watching tickers: ${tickers.join(', ')} every ${interval} seconds. Press Ctrl+C to stop.`);
  setInterval(async () => {
    try {
      const quotes = await Promise.all(
        tickers.map(ticker => yahooFinance.quote(ticker))
      );
      console.clear();
      const tableData = quotes.map(quote => ({
        Symbol: quote.symbol,
        Price: typeof quote.regularMarketPrice === 'number'
          ? quote.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : quote.regularMarketPrice,
        'Change %': quote.regularMarketChangePercent
          ? quote.regularMarketChangePercent.toFixed(2) + '%'
          : 'N/A'
      }));
      console.table(tableData);
    } catch (error) {
      console.error('Error fetching quotes:', error.message);
    }
  }, interval * 1000);
}

module.exports = { watchList };
