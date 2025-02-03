const fs = require('fs');
const path = require('path');
const yahooFinance = require('yahoo-finance2').default;

async function exportData(ticker, options = {}) {
  const { format = 'json', timeframe = '1y', output = 'export', dir = '.' } = options;
  try {
    const startDate = getStartDateFromTimeframe(timeframe);
    const queryOptions = { period1: startDate, period2: new Date() };
    const historical = await yahooFinance.historical(ticker, queryOptions);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (format === 'json') {
      const filePath = path.join(dir, `${output}-${ticker}.json`);
      fs.writeFileSync(filePath, JSON.stringify(historical, null, 2));
      console.log(`Data exported to ${filePath}`);
    } else if (format === 'text') {
      const filePath = path.join(dir, `${output}-${ticker}.txt`);
      const textData = historical.map(item => {
        const date = new Date(item.date).toLocaleDateString();
        return `${date} | Open: ${item.open} | High: ${item.high} | Low: ${item.low} | Close: ${item.close} | Volume: ${item.volume}`;
      }).join('\n');
      fs.writeFileSync(filePath, textData);
      console.log(`Data exported to ${filePath}`);
    } else {
      console.error('Unsupported format. Use "json" or "text".');
    }
  } catch (error) {
    console.error('Error exporting data:', error.message);
  }
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

module.exports = { exportData };
