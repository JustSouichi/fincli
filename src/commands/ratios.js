const yahooFinance = require('yahoo-finance2').default;

async function getRatios(ticker) {
  try {
    const queryOptions = { modules: ['defaultKeyStatistics', 'financialData'] };
    const result = await yahooFinance.quoteSummary(ticker, queryOptions);
    const financial = result.financialData;
    console.log('Key Ratios and Metrics:');
    console.log(`ROE: ${financial.returnOnEquity || 'N/A'}`);
    console.log(`ROI: ${financial.returnOnInvestment || 'N/A'}`);
    console.log(`Profit Margin: ${financial.profitMargins || 'N/A'}`);
    console.log(`PE Ratio: ${financial.trailingPE || 'N/A'}`);
  } catch (error) {
    console.error('Error fetching ratios:', error.message);
  }
}

module.exports = { getRatios };
