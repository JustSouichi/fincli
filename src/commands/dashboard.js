const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;
const os = require('os');

async function showDashboard(ticker, options = {}) {
  // Imposta il layout in base alle opzioni o alla larghezza del terminale
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

  // Pulisce la console dopo le chiamate alle API
  if (os.platform() === 'win32') {
    process.stdout.write('\x1Bc');
  } else {
    console.clear();
  }

  // Campiona i dati per limitare il numero di punti (es. 30)
  const totalPoints = historical.length;
  const desiredPoints = 30;
  const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
  const sampled = historical.filter((_, i) => i % step === 0);
  const prices = sampled.map(item => item.close);
  const xLabels = sampled.map(item => {
    const d = new Date(item.date);
    return d.toLocaleDateString();
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

  // Crea lo screen e la grid con blessed-contrib
  const screen = blessed.screen({ smartCSR: true, title: `Dashboard for ${ticker}`, mouse: true });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  if (layout === 'side') {
    // Layout "side": grafico a sinistra (8 colonne) e tabella a destra (4 colonne)
    const line = grid.set(0, 0, 12, 8, contrib.line, {
      label: `Price Chart for ${ticker} (${timeframe})`,
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      wholeNumbersOnly: false,
      showLegend: true,
      legend: { width: 12 }
    });
    const series = { title: ticker, x: xLabels, y: prices };
    line.setData([series]);

    // Attacca il tooltip per il grafico a linea
    attachTooltip(line, xLabels, prices, screen);
    
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
    // Layout "bottom": grafico in alto (8 righe) e tabella in basso (4 righe)
    const line = grid.set(0, 0, 8, 12, contrib.line, {
      label: `Price Chart for ${ticker} (${timeframe})`,
      style: { line: 'yellow', text: 'green', baseline: 'black' },
      wholeNumbersOnly: false,
      showLegend: true,
      legend: { width: 12 }
    });
    const series = { title: ticker, x: xLabels, y: prices };
    line.setData([series]);

    attachTooltip(line, xLabels, prices, screen);
    
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

  // Ascolta il resize del terminale per rendere la dashboard responsive
  screen.on('resize', () => screen.render());
  // Permette di uscire premendo Escape, q o Ctrl+C
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
}

// Funzione helper per attaccare il tooltip al widget "line"
function attachTooltip(line, xLabels, yData, screen) {
  const tooltip = blessed.box({
    top: 0,
    left: 0,
    width: 'shrink',
    height: 'shrink',
    border: 'line',
    style: { fg: 'white', bg: 'blue' },
    content: '',
    hidden: true,
    tags: true
  });
  screen.append(tooltip);
  
  line.on('mousemove', function(data) {
    // Assicuriamoci di avere coordinate numeriche
    let widgetLeft = typeof line.left === 'number' ? line.left : parseInt(line.left, 10) || 0;
    let widgetTop = typeof line.top === 'number' ? line.top : parseInt(line.top, 10) || 0;
    let widgetWidth = typeof line.width === 'number' ? line.width : parseInt(line.width, 10);
    let widgetHeight = typeof line.height === 'number' ? line.height : parseInt(line.height, 10);
    
    const relX = data.x - widgetLeft;
    const relY = data.y - widgetTop;
    
    // Se il mouse è fuori dai limiti del widget, nascondi il tooltip
    if (relX < 0 || relX >= widgetWidth) {
      tooltip.hide();
      screen.render();
      return;
    }
    
    // Calcola l'indice corrispondente mappando la posizione orizzontale al numero di etichette
    const index = Math.floor(relX / widgetWidth * xLabels.length);
    if (index < 0 || index >= yData.length) {
      tooltip.hide();
      screen.render();
      return;
    }
    
    // Calcola il valore normalizzato per il prezzo, considerando l'altezza del widget
    const minPrice = Math.min(...yData);
    const maxPrice = Math.max(...yData);
    const normalized = (yData[index] - minPrice) / (maxPrice - minPrice) * (widgetHeight - 1);
    // Poiché il grafico è invertito (riga 0 in cima), calcola la posizione prevista
    const predictedY = widgetHeight - 1 - normalized;
    
    // Aumenta il threshold (da 1 a 2 righe) per rendere il tooltip più "tollerante"
    const threshold = 2;
    
    if (Math.abs(relY - predictedY) <= threshold) {
      tooltip.setContent(`Date: ${xLabels[index]}\nPrice: ${yData[index].toFixed(2)}`);
      tooltip.left = data.x;
      tooltip.top = data.y - 2; // sposta leggermente il tooltip verso l'alto
      tooltip.show();
    } else {
      tooltip.hide();
    }
    screen.render();
  });
  
  line.on('mouseout', function() {
    tooltip.hide();
    screen.render();
  });
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
