#!/usr/bin/env node
const yahooFinance = require('yahoo-finance2').default;
yahooFinance.suppressNotices(['yahooSurvey', 'ripHistorical']);

const { program } = require('commander');
const chalk = require('chalk').default || require('chalk');

program
  .version('1.0.0')
  .description('fincli: CLI tool for financial monitoring');

program
  .command('hello')
  .description('Print a welcome message')
  .action(() => {
    console.log(chalk.green('Welcome to fincli!'));
  });

program
  .command('chart [ticker]')
  .option('--type <chartType>', 'Chart type (line, bar, candle)', 'line')
  .option('--timeframe <timeframe>', 'Timeframe for historical data (1y, 5y, 10y)', '1y')
  .description('Display an ASCII chart (sample data if no ticker provided)')
  .action(async (ticker, cmdObj) => {
    const { showChart } = require('./commands/chart');
    await showChart(ticker, cmdObj);
  });

program
  .command('quote <ticker>')
  .description('Get stock quote for a given ticker')
  .action(async (ticker) => {
    const { getQuote } = require('./commands/quote');
    await getQuote(ticker);
  });

program
  .command('financials <ticker>')
  .description('Get financial statements and key data for a given ticker')
  .action(async (ticker) => {
    const { getFinancials } = require('./commands/financials');
    await getFinancials(ticker);
  });

program
  .command('ratios <ticker>')
  .description('Get key ratios for a given ticker')
  .action(async (ticker) => {
    const { getRatios } = require('./commands/ratios');
    await getRatios(ticker);
  });

program
  .command('news <ticker>')
  .description('Get latest news for a given ticker')
  .action(async (ticker) => {
    const { getNews } = require('./commands/news');
    await getNews(ticker);
  });

program
  .command('interactive')
  .description('Launch interactive mode')
  .action(async () => {
    const { interactiveMenu } = require('./commands/interactive');
    await interactiveMenu();
  });

program
  .command('portfolio <tickers...>')
  .description('Display portfolio data for given tickers')
  .action(async (tickers) => {
    const { showPortfolio } = require('./commands/portfolio');
    await showPortfolio(tickers);
  });

program
  .command('watch <ticker>')
  .option('--interval <seconds>', 'Refresh interval in seconds', '10')
  .description('Watch live quote updates for a given ticker')
  .action(async (ticker, cmdObj) => {
    const { watchTicker } = require('./commands/watch');
    await watchTicker(ticker, Number(cmdObj.interval));
  });

program
  .command('export <ticker>')
  .option('--format <format>', 'Export format (json, text)', 'json')
  .option('--timeframe <timeframe>', 'Timeframe for historical data (1y, 5y, 10y)', '1y')
  .option('--output <output>', 'Output file prefix', 'export')
  .option('--dir <directory>', 'Output directory', '.')
  .description('Export historical data for a given ticker')
  .action(async (ticker, cmdObj) => {
    const { exportData } = require('./commands/export');
    await exportData(ticker, cmdObj);
  });

program
  .command('compare <tickers...>')
  .description('Compare key metrics for multiple tickers')
  .action(async (tickers) => {
    const { compareTickers } = require('./commands/compare');
    await compareTickers(tickers);
  });

program
  .command('watchlist <tickers...>')
  .option('--interval <seconds>', 'Refresh interval in seconds', '10')
  .description('Watch live quote updates for multiple tickers')
  .action(async (tickers, cmdObj) => {
    const { watchList } = require('./commands/watchlist');
    await watchList(tickers, Number(cmdObj.interval));
  });

program
  .command('dashboard <ticker>')
  .option('--layout <layout>', 'Dashboard layout: side or bottom', 'side')
  .option('--timeframe <timeframe>', 'Timeframe for data (1y, 5y, 10y)', '1y')
  .description('Display a chart with financial data for a given ticker')
  .action(async (ticker, cmdObj) => {
    const { showDashboard } = require('./commands/dashboard');
    await showDashboard(ticker, cmdObj);
  });

program
  .command('indicators <ticker>')
  .option('--timeframe <timeframe>', 'Timeframe for historical data (1y, 5y, 10y)', '1y')
  .description('Get technical indicators (SMA, RSI) for a given ticker')
  .action(async (ticker, cmdObj) => {
    const { getIndicators } = require('./commands/indicators');
    await getIndicators(ticker, cmdObj.timeframe);
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
