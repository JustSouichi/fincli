const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;

async function showChart(ticker, options = {}) {
  const { type = 'line', timeframe = '1y' } = options;

  // Creazione della schermata e della grid
  const screen = blessed.screen();
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  // Imposta il titolo del grafico in base al ticker e timeframe
  const label = ticker ? `Chart for ${ticker} (${timeframe})` : 'Sample Chart';

  // Crea il widget del grafico lineare
  const line = grid.set(0, 0, 12, 12, contrib.line, {
    style: {
      line: "yellow",
      text: "green",
      baseline: "black"
    },
    xLabelPadding: 3,
    xPadding: 5,
    label: label
  });

  let xLabels = [];
  let yData = [];

  if (ticker) {
    try {
      // Calcola la data di inizio in base al timeframe
      const startDate = getStartDateFromTimeframe(timeframe);
      const queryOptions = { period1: startDate, period2: new Date() };
      const historical = await yahooFinance.historical(ticker, queryOptions);
      
      // Filtra e prepara i dati (campionando se necessario per compattezza)
      // In questo esempio prendiamo 30 punti distribuiti uniformemente
      const totalPoints = historical.length;
      const desiredPoints = 30;
      const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
      
      const sampled = historical.filter((_, i) => i % step === 0);
      yData = sampled.map(item => item.close);
      xLabels = sampled.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth()+1}/${date.getDate()}`;
      });
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      process.exit(1);
    }
  } else {
    // Dati di esempio se nessun ticker è specificato
    yData = [10, 12, 15, 14, 13, 16, 18, 20, 19, 17, 15, 14, 13, 12, 10];
    xLabels = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'];
  }

  const series = {
    title: ticker || 'Sample Data',
    x: xLabels,
    y: yData
  };

  line.setData([series]);

  // Consente di uscire dalla schermata con Escape, q o Ctrl+C
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  screen.render();
}

function getStartDateFromTimeframe(timeframe) {
  const now = new Date();
  let pastDate;
  switch (timeframe) {
    case '1y':
      pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case '5y':
      pastDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      break;
    case '10y':
      pastDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      break;
    default:
      pastDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
  return pastDate;
}

module.exports = { showChart };
