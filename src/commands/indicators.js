const yahooFinance = require('yahoo-finance2').default;

function calculateSMA(data, period) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateRSI(data, period = 14) {
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsi = [];
  rsi[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    rsi[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  }
  return rsi;
}

async function getIndicators(ticker, timeframe = '1y') {
  try {
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
    const queryOptions = { period1: pastDate, period2: new Date() };
    const historical = await yahooFinance.historical(ticker, queryOptions);
    const prices = historical.map(item => item.close);
    const sma20 = calculateSMA(prices, 20);
    const rsi14 = calculateRSI(prices, 14);
    console.log(`SMA (20) for ${ticker}:`);
    console.table(sma20.slice(-10));
    console.log(`RSI (14) for ${ticker}:`);
    console.table(rsi14.slice(-10));
  } catch (error) {
    console.error('Error fetching indicators:', error.message);
  }
}

module.exports = { getIndicators };
