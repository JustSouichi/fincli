const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;
const os = require('os');

async function showDashboard(ticker, options = {}) {
  // Scegli il layout in modo responsive:
  // Se l'utente specifica un layout, lo rispettiamo; altrimenti, in base alla larghezza del terminale.
  let layout = options.layout || 'side';
  if (process.stdout.columns < 100) {
    layout = 'bottom';
  }

  const timeframe = options.timeframe || '1y';

  // Recupera i dati storici per il grafico
  let historical;
  try {
    const startDate = getStartDateFromTimeframe(timeframe);
    const queryOptions = { period1: startDate, period2: new Date() };
    historical = await yahooFinance.historical(ticker, queryOptions);
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    process.exit(1);
  }
  if (!historical || historical.length === 0) {
    console.error('No historical data found.');
    process.exit(1);
  }

  // Recupera i dati finanziari (income statement)
  let financialData;
  try {
    const queryOptions = { modules: ['incomeStatementHistory'] };
    const summary = await yahooFinance.quoteSummary(ticker, queryOptions);
    financialData = summary.incomeStatementHistory?.incomeStatementHistory || [];
  } catch (error) {
    console.error('Error fetching financial data:', error.message);
    financialData = [];
  }

  // Ora che le chiamate alle API sono terminate, puliamo la console
  if (os.platform() === 'win32') {
    process.stdout.write('\x1Bc');
  } else {
    console.clear();
  }

  // Campiona i dati per ridurre il numero di punti (es. 30 punti)
  const totalPoints = historical.length;
  const desiredPoints = 30;
  const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
  const sampled = historical.filter((_, i) => i % step === 0);
  const prices = sampled.map(item => item.close);
  const xLabels = sampled.map(item => {
    const d = new Date(item.date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // Prepara i dati per la tabella (Period, Revenue, Net Income)
  const tableRows = financialData.map(item => {
    let period = 'N/A';
    if (item.endDate) {
      if (typeof item.endDate.raw === 'number') {
        period = new Date(item.endDate.raw * 1000).toLocaleDateString();
      } else if (item.endDate.fmt) {
        const d = new Date(item.endDate.fmt);
        period = isNaN(d.getTime()) ? item.endDate.fmt : d.toLocaleDateString();
      }
    }
    const revenue = item.totalRevenue ? formatNumber(item.totalRevenue) : 'N/A';
    const netIncomeVal = item.netIncome || item.operatingIncome;
    const netIncome = netIncomeVal ? formatNumber(netIncomeVal) : 'N/A';
    return [period, revenue, netIncome];
  });

  // Crea la schermata e la griglia usando blessed-contrib
  const screen = blessed.screen({ smartCSR: true, title: `Dashboard for ${ticker}` });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // Se il layout è "side": grafico a sinistra (8 colonne), tabella a destra (4 colonne)
  // Altrimenti, layout "bottom": grafico in alto (8 righe), tabella in basso (4 righe)
  if (layout === 'side') {
    const line = grid.set(0, 0, 12, 8, contrib.line, {
      label: `Price Chart for ${ticker} (${timeframe})`,
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      wholeNumbersOnly: false,
      showLegend: true,
      legend: { width: 12 }
    });
    const series = { title: ticker, x: xLabels, y: prices };
    line.setData([series]);

    const table = grid.set(0, 8, 12, 4, contrib.table, {
      keys: false,
      fg: 'white',
      label: `Financials (Income Statement)`,
      columnSpacing: 1,
      columnWidth: [12, 16, 16],
      border: { type: 'line', fg: 'cyan' },
      style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
    });
    table.setData({ headers: ['Period', 'Revenue', 'Net Income'], data: tableRows });
  } else {
    const line = grid.set(0, 0, 8, 12, contrib.line, {
      label: `Price Chart for ${ticker} (${timeframe})`,
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      wholeNumbersOnly: false,
      showLegend: true,
      legend: { width: 12 }
    });
    const series = { title: ticker, x: xLabels, y: prices };
    line.setData([series]);

    const table = grid.set(8, 0, 4, 12, contrib.table, {
      keys: false,
      fg: 'white',
      label: `Financials (Income Statement)`,
      columnSpacing: 1,
      columnWidth: [12, 16, 16],
      border: { type: 'line', fg: 'cyan' },
      style: { header: { fg: 'yellow' }, cell: { fg: 'white' } }
    });
    table.setData({ headers: ['Period', 'Revenue', 'Net Income'], data: tableRows });
  }

  // Rende responsive la dashboard: aggiorna lo schermo al resize del terminale
  screen.on('resize', () => {
    screen.render();
  });

  // Permette di uscire premendo Escape, q o Ctrl+C
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
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
    default:
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

function formatNumber(num) {
  return typeof num === 'number'
    ? num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : num;
}

module.exports = { showDashboard };