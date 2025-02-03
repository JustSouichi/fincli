const yahooFinance = require('yahoo-finance2').default;

async function getFinancials(ticker) {
  try {
    const queryOptions = { modules: ['financialData', 'incomeStatementHistory', 'balanceSheetHistory'] };
    const result = await yahooFinance.quoteSummary(ticker, queryOptions);
    console.log('Financial Data:');
    console.log(result.financialData);
    console.log('\nIncome Statement History:');
    console.log(result.incomeStatementHistory);
    console.log('\nBalance Sheet History:');
    console.log(result.balanceSheetHistory);
  } catch (error) {
    console.error('Error fetching financials:', error.message);
  }
}

module.exports = { getFinancials };
