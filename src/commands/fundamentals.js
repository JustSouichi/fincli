const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;

async function fetchFinancialData(ticker) {
    console.log(`📊 Fetching financial data for ${ticker}...\n`);

    try {

        const balanceSheet = await yahooFinance.fundamentalsTimeSeries(ticker, {
            period1: '2020-01-01',
            period2: new Date().toISOString().split('T')[0], // Data di fine automatizzata
            type: 'annual',
            module: 'balance-sheet'
        });

        const summary = await yahooFinance.quoteSummary(ticker, {
            modules: [
                'incomeStatementHistoryQuarterly',
                'balanceSheetHistoryQuarterly',
                'cashflowStatementHistoryQuarterly',
                'defaultKeyStatistics',
                'financialData'
            ]
        });

        return { ...summary, balanceSheet };
    } catch (error) {
        console.error('❌ Error fetching data:', error.message);
        process.exit(1);
    }
}

function displayData(summary, ticker) {
    const screen = blessed.screen({ smartCSR: true, title: `Fundamentals for ${ticker}` });
    const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

    function parseDate(endDate) {
        return endDate ? new Date(endDate).toLocaleDateString() : 'N/A';
    }

    function formatCurrency(num) {
        return num ? `$${num.toLocaleString()}` : 'N/A';
    }

    function formatPercentage(num) {
        return num ? `${(num * 100).toFixed(2)}%` : 'N/A';
    }

    // 🟢 Income Statement
    const incomeData = summary.incomeStatementHistoryQuarterly?.incomeStatementHistory.map(item => ([
        parseDate(item.endDate),
        formatCurrency(item.totalRevenue),
        formatCurrency(item.netIncome)
    ])) || [['N/A', 'N/A', 'N/A']];

    const incomeTable = grid.set(0, 0, 4, 6, contrib.table, {
        keys: false, label: 'Income Statement',
        columnWidth: [12, 20, 20], columnSpacing: 1
    });
    incomeTable.setData({ headers: ['Period', 'Revenue', 'Net Income'], data: incomeData });

   // 🟡 Balance Sheet
// 🟡 Balance Sheet (Usa fundamentalsTimeSeries)
console.log("📊 Checking balance sheet data:", summary.balanceSheet);

const balanceData = summary.balanceSheet.map(item => ([
    parseDate(item.date),
    formatCurrency(item.totalAssets || 0),
    formatCurrency(item.totalLiabilitiesNetMinorityInterest || 0)
])) || [['N/A', 'N/A', 'N/A']];

const balanceTable = grid.set(0, 6, 4, 6, contrib.table, {
    keys: false, label: 'Balance Sheet',
    columnWidth: [12, 20, 20], columnSpacing: 1
});
balanceTable.setData({ headers: ['Period', 'Assets', 'Liabilities'], data: balanceData });


    // 🔵 Cash Flow Statement
    const cashFlowData = summary.cashflowStatementHistoryQuarterly?.cashflowStatements.map(item => ([
        parseDate(item.endDate),
        formatCurrency(item.netIncome)
    ])) || [['N/A', 'N/A']];

    const cashFlowTable = grid.set(4, 0, 4, 6, contrib.table, {
        keys: false, label: 'Cash Flow Statement',
        columnWidth: [12, 20], columnSpacing: 1
    });
    cashFlowTable.setData({ headers: ['Period', 'Net Income'], data: cashFlowData });

    // 🔴 Key Ratios
    const ratios = [
        ['Return on Assets (ROA)', formatPercentage(summary.financialData?.returnOnAssets)],
        ['Return on Equity (ROE)', formatPercentage(summary.financialData?.returnOnEquity)],
        ['Leverage', summary.financialData?.debtToEquity ? summary.financialData.debtToEquity.toFixed(2) : 'N/A']
    ];

    const ratiosTable = grid.set(4, 6, 4, 6, contrib.table, {
        keys: false, label: 'Key Ratios',
        columnWidth: [25, 20], columnSpacing: 1
    });
    ratiosTable.setData({ headers: ['Ratio', 'Value'], data: ratios });

    screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
    screen.render();
}

async function showFundamentals(ticker) {
    const financialData = await fetchFinancialData(ticker);
    displayData(financialData, ticker);
}

module.exports = { showFundamentals };