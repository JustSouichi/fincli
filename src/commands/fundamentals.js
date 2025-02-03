const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;
const os = require('os');

async function showFundamentals(ticker, options = {}) {
  // Opzione: --chart per mostrare anche il grafico storico
  const showChart = options.chart || false;
  // Se "all", recupera dati storici più lunghi (ad es. 10 anni)
  const timeframe = options.timeframe || 'all'; 

  // Recupera i dati fondamentali da Yahoo Finance
  let incomeStatement, balanceSheet, cashFlow, keyStats;
  try {
    const summary = await yahooFinance.quoteSummary(ticker, {
      modules: [
        'incomeStatementHistory',
        'balanceSheetHistory',
        'cashflowStatementHistory',  // attenzione: tutto minuscolo "cashflowStatementHistory"
        'defaultKeyStatistics'
      ]
    });
    incomeStatement = summary.incomeStatementHistory?.incomeStatementHistory || [];
    balanceSheet = summary.balanceSheetHistory?.balanceSheetHistory || [];
    cashFlow = summary.cashflowStatementHistory?.cashflowStatementHistory || [];
    keyStats = summary.defaultKeyStatistics || {};
  } catch (error) {
    console.error('Error fetching fundamental data:', error.message);
    process.exit(1);
  }

  // Se richiesto, recupera anche dati storici per il grafico (ad esempio, il prezzo di chiusura)
  let chartData = null;
  let xLabels = [];
  if (showChart) {
    try {
      const startDate = timeframe === 'all' ? new Date(new Date().getFullYear() - 10, 0, 1)
                                            : getStartDateFromTimeframe(timeframe);
      const historical = await yahooFinance.historical(ticker, { period1: startDate, period2: new Date() });
      historical.sort((a, b) => new Date(a.date) - new Date(b.date));
      const desiredPoints = 50;
      const totalPoints = historical.length;
      const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
      const sampled = historical.filter((_, i) => i % step === 0);
      // Per esempio, usiamo il prezzo di chiusura come dato da plottare
      chartData = sampled.map(item => item.close);
      xLabels = sampled.map(item => {
        const d = new Date(item.date);
        return d.toLocaleDateString();
      });
    } catch (error) {
      console.error('Error fetching chart data:', error.message);
      // Se il grafico non va, prosegui senza di esso
    }
  }

  // Calcola alcuni indici fondamentali
  const ratios = calculateFundamentalRatios({ incomeStatement, balanceSheet, cashFlow, keyStats });

  // Pulisce la console
  if (os.platform() === 'win32') {
    process.stdout.write('\x1Bc');
  } else {
    console.clear();
  }

  // Crea lo screen e la grid per la dashboard
  const screen = blessed.screen({ smartCSR: true, title: `Fundamentals for ${ticker}`, mouse: true });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  let currentRow = 0;
  // Se richiesto, mostra il grafico storico in alto
  if (showChart && chartData && xLabels.length > 0) {
    const chartWidget = grid.set(0, 0, 6, 12, contrib.line, {
      label: `Historical Data for ${ticker}`,
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      xLabelPadding: 3,
      xPadding: 5
    });
    const series = { title: ticker, x: xLabels, y: chartData };
    chartWidget.setData([series]);
    currentRow = 6;
  }

  // Funzione helper per gestire il parsing della data in modo robusto
  function parseDate(endDate) {
    if (!endDate) return 'N/A';
    if (endDate.raw && typeof endDate.raw === 'number') {
      return new Date(endDate.raw * 1000).toLocaleDateString();
    } else if (endDate.fmt) {
      const d = new Date(endDate.fmt);
      return isNaN(d.getTime()) ? endDate.fmt : d.toLocaleDateString();
    } else if (endDate.formatted) {
      const d = new Date(endDate.formatted);
      return isNaN(d.getTime()) ? endDate.formatted : d.toLocaleDateString();
    }
    return 'N/A';
  }

  // Prepara i dati per la tabella del conto economico
  const incomeData = incomeStatement.map(item => ([
    parseDate(item.endDate),
    item.totalRevenue ? formatNumber(item.totalRevenue) : 'N/A',
    item.netIncome ? formatNumber(item.netIncome) : 'N/A',
    item.costOfRevenue ? formatNumber(item.costOfRevenue) : 'N/A'
  ]));

  const incomeTable = grid.set(currentRow, 0, 4, 6, contrib.table, {
    keys: false,
    fg: 'white',
    label: 'Income Statement',
    columnSpacing: 1,
    columnWidth: [12, 16, 16, 16],
    border: { type: 'line', fg: 'cyan' },
    style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
  });
  incomeTable.setData({ headers: ['Period', 'Revenue', 'Net Income', 'Cost'], data: incomeData });

  // Tabella per lo stato patrimoniale
  const balanceData = balanceSheet.map(item => ([
    parseDate(item.endDate),
    item.totalAssets ? formatNumber(item.totalAssets) : 'N/A',
    item.totalLiab ? formatNumber(item.totalLiab) : 'N/A'
  ]));
  const balanceTable = grid.set(currentRow, 6, 4, 6, contrib.table, {
    keys: false,
    fg: 'white',
    label: 'Balance Sheet',
    columnSpacing: 1,
    columnWidth: [12, 16, 16],
    border: { type: 'line', fg: 'cyan' },
    style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
  });
  balanceTable.setData({ headers: ['Period', 'Assets', 'Liabilities'], data: balanceData });

  // Tabella per il cash flow statement
  const cashFlowData = cashFlow.map(item => ([
    parseDate(item.endDate),
    item.totalCashFromOperatingActivities ? formatNumber(item.totalCashFromOperatingActivities) : 'N/A',
    item.capex ? formatNumber(item.capex) : 'N/A'
  ]));
  const cashFlowTable = grid.set(currentRow + 4, 0, 4, 12, contrib.table, {
    keys: false,
    fg: 'white',
    label: 'Cash Flow Statement',
    columnSpacing: 1,
    columnWidth: [12, 16, 16],
    border: { type: 'line', fg: 'cyan' },
    style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
  });
  cashFlowTable.setData({ headers: ['Period', 'Ops Cash', 'CapEx'], data: cashFlowData });

  // Tabella per gli indici fondamentali
  const ratiosBox = grid.set(currentRow + 8, 0, 4, 12, contrib.table, {
    keys: false,
    fg: 'white',
    label: 'Key Ratios',
    columnSpacing: 1,
    columnWidth: [20, 20],
    border: { type: 'line', fg: 'magenta' },
    style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
  });
  const ratiosData = Object.entries(ratios).map(([key, value]) => ([key, value.toFixed(2)]));
  ratiosBox.setData({ headers: ['Ratio', 'Value'], data: ratiosData });

  // Permette di uscire premendo Escape, q o Ctrl+C
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
}

function calculateFundamentalRatios({ incomeStatement, balanceSheet, cashFlow, keyStats }) {
  let leverage = 0, roi = 0, ros = 0;
  
  if (balanceSheet.length > 0) {
    const latestBalance = balanceSheet[0];
    const totalDebt = latestBalance.totalLiab || 0;
    const totalEquity = (latestBalance.totalAssets && latestBalance.totalLiab)
      ? (latestBalance.totalAssets - latestBalance.totalLiab)
      : 0;
    if (totalEquity !== 0) {
      leverage = totalDebt / totalEquity;
    }
  }
  
  if (incomeStatement.length > 0 && balanceSheet.length > 0) {
    const latestIncome = incomeStatement[0];
    const latestBalance = balanceSheet[0];
    if (latestBalance.totalAssets) {
      roi = latestIncome.netIncome / latestBalance.totalAssets;
    }
  }
  
  if (incomeStatement.length > 0) {
    const latestIncome = incomeStatement[0];
    if (latestIncome.totalRevenue) {
      ros = latestIncome.netIncome / latestIncome.totalRevenue;
    }
  }
  
  return {
    Leverage: leverage,
    ROI: roi,
    ROS: ros
  };
}

function getStartDateFromTimeframe(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case '1y':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case '5y':
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    case '10y':
      return new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    case 'all':
      return new Date(now.getFullYear() - 10, 0, 1);
    default:
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

function formatNumber(num) {
  return typeof num === 'number'
    ? num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : num;
}

module.exports = { showFundamentals };
