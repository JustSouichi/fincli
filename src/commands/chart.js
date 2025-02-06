const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;

async function showChart(ticker, options = {}) {
  const { timeframe = '1y', chartHeight = 15 } = options;

  // Pulisce il terminale prima di mostrare il grafico


  const screen = blessed.screen({ smartCSR: true, title: 'Terminal Stock Chart', mouse: true });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

  const label = ticker ? `Grafico per ${ticker} (${timeframe})` : 'Grafico di esempio';

  const line = grid.set(0, 0, 12, 12, contrib.line, {
    label: label,
    showLegend: true,
    legend: { width: 12 },
    style: {
      line: "cyan",
      text: "white",
      baseline: "black"
    },
    xLabelPadding: 3,
    xPadding: 5,
    wholeNumbersOnly: false,
    border: { type: 'line', fg: 'white' }
  });

  let xLabels = [];
  let yData = [];

  if (ticker) {
    try {
      const startDate = getStartDateFromTimeframe(timeframe);
      const queryOptions = { period1: startDate, period2: new Date() };
      let historical = await yahooFinance.historical(ticker, queryOptions);

     // console.log("Dati ricevuti:", historical.slice(0, 5)); // DEBUG

      historical.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Filtro per eliminare dati non validi
      historical = historical.filter(item => item.close !== undefined && item.close !== null);

      if (historical.length === 0) {
        console.error("⚠️ Nessun dato valido trovato per", ticker);
        process.exit(1);
      }

      // Campionamento massimo di 30 punti
      const totalPoints = historical.length;
      const desiredPoints = 30;
      const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
      const sampled = historical.filter((_, i) => i % step === 0);

      yData = sampled.map(item => item.close);
      xLabels = sampled.map(item => {
        const d = new Date(item.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });

      //console.log("Dati dopo filtraggio:", yData.slice(0, 5)); // DEBUG

    } catch (error) {
      console.error('❌ Errore nel recupero dei dati storici:', error.message);
      process.exit(1);
    }
  } else {
    yData = [10, 12, 15, 14, 13, 16, 18, 20, 19, 17, 15, 14, 13, 12, 10];
    xLabels = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'];
  }

  if (yData.length === 0) {
    console.error("❌ Nessun dato valido trovato per il grafico!");
    process.exit(1);
  }

  yData = yData.map((value, index, array) => value !== undefined ? value : (index > 0 ? array[index - 1] : 0));

  const mainSeries = {
    title: ticker || 'Dati di Esempio',
    x: xLabels,
    y: yData,
    style: {
      line: "cyan"
    }
  };

  line.setData([mainSeries]);

  const tooltip = blessed.box({
    width: 20,
    height: 5,
    border: { type: 'line', fg: 'magenta' },
    style: { fg: 'white', bg: 'blue' },
    content: '',
    hidden: true,
    tags: true
  });
  screen.append(tooltip);

  line.on('mousemove', function(data) {
    const index = Math.floor(data.x / line.width * xLabels.length);
    if (index < 0 || index >= yData.length) {
      tooltip.hide();
      screen.render();
      return;
    }
    
    tooltip.setContent(`{bold}Data:{/bold} ${xLabels[index]}\n{bold}Prezzo:{/bold} ${yData[index].toFixed(2)}`);
    
    let leftPos = Math.min(data.x + 2, screen.width - 22);
    let topPos = Math.max(1, data.y - 2);
    
    tooltip.left = leftPos;
    tooltip.top = topPos;
    tooltip.show();
    screen.render();
  });

  line.on('mouseout', function() {
    tooltip.hide();
    screen.render();
  });

  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
}

function getStartDateFromTimeframe(timeframe) {
  const now = new Date();
  switch(timeframe) {
    case '1y': return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case '5y': return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    case '10y': return new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    default: return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

module.exports = { showChart };
