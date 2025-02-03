const blessed = require('blessed');
const contrib = require('blessed-contrib');
const yahooFinance = require('yahoo-finance2').default;

async function showChart(ticker, options = {}) {
  const { type = 'line', timeframe = '1y', chartHeight = 15 } = options;
  
  const screen = blessed.screen({ mouse: true });
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });
  
  const label = ticker ? `Chart for ${ticker} (${timeframe})` : 'Sample Chart';
  
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
      
      historical.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const totalPoints = historical.length;
      const desiredPoints = 30;
      const step = Math.max(1, Math.floor(totalPoints / desiredPoints));
      const sampled = historical.filter((_, i) => i % step === 0);
      
      yData = sampled.map(item => item.close);
      xLabels = sampled.map(item => new Date(item.date).toLocaleDateString());
    } catch (error) {
      console.error('Error fetching historical data:', error.message);
      process.exit(1);
    }
  } else {
    yData = [10, 12, 15, 14, 13, 16, 18, 20, 19, 17, 15, 14, 13, 12, 10];
    xLabels = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15'];
  }
  
  const series = {
    title: ticker || 'Sample Data',
    x: xLabels,
    y: yData
  };
  line.setData([series]);
  
  const tooltip = blessed.box({
    width: 'shrink',
    height: 'shrink',
    border: 'line',
    style: { fg: 'white', bg: 'blue' },
    content: '',
    hidden: true
  });
  screen.append(tooltip);
  
  line.on('mousemove', function(data) {
    const index = Math.floor(data.x / line.width * xLabels.length);
    if (index < 0 || index >= yData.length) {
      tooltip.hide();
      screen.render();
      return;
    }
    
    tooltip.setContent(`Date: ${xLabels[index]}\nPrice: ${yData[index].toFixed(2)}`);
    tooltip.left = Math.min(data.x + 2, screen.width - 10);
    tooltip.top = Math.max(data.y - 1, 1);
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
