const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;

async function showChart(ticker, options = {}) {
  const { type = 'line', timeframe = '1y', chartHeight = 15 } = options;
  
  // Crea lo screen con supporto per il mouse
  const screen = blessed.screen({ mouse: true });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  
  const label = ticker ? `Chart for ${ticker} (${timeframe})` : 'Sample Chart';
  
  // Crea il widget del grafico lineare
  const line = grid.set(0, 0, 12, 12, contrib.line, {
    label: label,
    style: {
      line: "yellow",
      text: "green",
      baseline: "black"
    },
    xLabelPadding: 3,
    xPadding: 5
  });
  
  let xLabels = [];
  let yData = [];
  
  if (ticker) {
    try {
      const startDate = getStartDateFromTimeframe(timeframe);
      const queryOptions = { period1: startDate, period2: new Date() };
      let historical = await yahooFinance.historical(ticker, queryOptions);
      
      // Ordina i dati in ordine cronologico crescente
      historical.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Campiona i dati: prendi circa 30 punti
      const totalPoints = historical.length;
      const desiredPoints = 30;
      const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
      const sampled = historical.filter((_, i) => i % step === 0);
      
      yData = sampled.map(item => item.close);
      xLabels = sampled.map(item => {
        const d = new Date(item.date);
        return d.toLocaleDateString();
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
  
  // Crea il tooltip (nascosto di default)
  const tooltip = blessed.box({
    top: 0,
    left: 0,
    width: 'shrink',
    height: 'shrink',
    border: 'line',
    style: { fg: 'white', bg: 'blue' },
    content: '',
    hidden: true
  });
  screen.append(tooltip);
  
  // Evento mousemove: mostra il tooltip solo se il puntatore è vicino alla linea
  line.on('mousemove', function(data) {
    // Ottieni le coordinate relative del widget
    let widgetLeft = line.left;
    let widgetTop = line.top;
    let widgetWidth = line.width;
    let widgetHeight = line.height;
    if (typeof widgetLeft !== 'number') widgetLeft = 0;
    if (typeof widgetTop !== 'number') widgetTop = 0;
    
    const relX = data.x - widgetLeft;
    const relY = data.y - widgetTop;
    // Se fuori dai limiti, nascondi il tooltip
    if (relX < 0 || relX >= widgetWidth) {
      tooltip.hide();
      screen.render();
      return;
    }
    // Calcola l'indice corrispondente in base alla larghezza del widget e ai dati campionati
    const index = Math.floor(relX / widgetWidth * xLabels.length);
    if (index < 0 || index >= yData.length) {
      tooltip.hide();
      screen.render();
      return;
    }
    
    // Calcola il valore normalizzato per il prezzo, in base all'altezza del widget
    const minPrice = Math.min(...yData);
    const maxPrice = Math.max(...yData);
    const normalized = (yData[index] - minPrice) / (maxPrice - minPrice) * (widgetHeight - 1);
    // Il grafico è invertito: la riga 0 è in cima, quindi:
    const predictedY = widgetHeight - 1 - normalized;
    
    // Mostra il tooltip solo se il mouse è entro 1 riga dal punto della linea
    const threshold = 1;
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
  
  // Nasconde il tooltip quando il mouse esce dal widget
  line.on('mouseout', function() {
    tooltip.hide();
    screen.render();
  });
  
  // Permette di uscire premendo Escape, q o Ctrl+C
  screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
  screen.render();
}

function getStartDateFromTimeframe(timeframe) {
  const now = new Date();
  switch(timeframe) {
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

module.exports = { showChart };
