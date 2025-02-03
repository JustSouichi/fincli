
# finview

<p align="center">
  <img src="https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/img/logo.svg" width="200" height="179" alt="">
  <br><strong>Command-line tool for monitoring financial data and market trends in real-time directly from your terminal.</strong>
  <br><a href="https://github.com/JustSouichi/finview">GitHub Repository</a>
</p>


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/JustSouichi/finview.svg)](https://github.com/JustSouichi/finview/issues)
[![GitHub stars](https://img.shields.io/github/stars/JustSouichi/finview.svg?style=social&label=Stars)](https://github.com/JustSouichi/finview/stargazers)
[![Downloads](https://img.shields.io/npm/dt/finview.svg)](https://www.npmjs.com/package/finview)




## Installation

Install finview globally using npm:

```bash
npm install -g finview
```

## Chart
<p align="center">
<img src="https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/img/chart.png" alt="">
</p>

## Dashboard

<p align="center">
<img src="https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/img/dashboard.png"  alt="">
</p>

## Fundamentals
<p align="center">
<img src="https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/img/fundamentals.png"  alt="">
</p>

## Features

- **Interactive Terminal UI:**  
  Built with [blessed](https://github.com/chjj/blessed) and [blessed-contrib](https://github.com/yaronn/blessed-contrib), finview provides a rich, interactive dashboard for viewing financial data right in the terminal.

- **Real-time Market Data:**  
  Fetch up-to-date stock prices, financial news, and market trends using [yahoo-finance](https://www.npmjs.com/package/yahoo-finance) and [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2).

- **Data Visualization:**  
  Display market trends using [asciichart](https://github.com/kroitor/asciichart) to generate concise and clear ASCII-based charts directly in your terminal.

- **Web Data Scraping:**  
  Utilize [axios](https://github.com/axios/axios), [cheerio](https://github.com/cheeriojs/cheerio), and [puppeteer](https://github.com/puppeteer/puppeteer) to scrape additional financial data or news from the web as needed.

- **Command-line Interface:**  
  Easy-to-use CLI designed with [commander](https://github.com/tj/commander.js) and [inquirer](https://github.com/SBoudrias/Inquirer.js) for navigating options and customizing views.

## Usage

Once installed, simply run:

```bash
finview
```

You will be presented with an interactive dashboard where you can:

- View real-time market data
- Monitor stock prices
- Access detailed charts and financial news

## Commands

### `finview --help`
Displays help information with all available commands and options.



### `finview chart <symbol>`
Shows a chart with historical price data for the specified stock symbol.

### `finview news <symbol>`
Fetches the latest financial news from top sources.



### `finview fundamentals <symbol>`
Displays key fundamental data for a given stock symbol, such as P/E ratio, earnings, and revenue. This command helps you analyze a company's financial health beyond just stock price data.

### `finview compare <symbol1> <symbol2>`
Compares two stocks side by side, displaying relevant market data and key statistics for each.

### `finview dashboard <symbol>`
Launches a comprehensive, interactive dashboard to monitor multiple stock symbols and their data in real time.

### `finview export <symbol>`
Exports the stock data of a specified symbol to a CSV file for further analysis.

### `finview financials <symbol>`
Displays a company’s financial statements, including income statement, balance sheet, and cash flow statement.

### `finview indicators <symbol>`
Shows key financial indicators for the specified symbol, such as moving averages, RSI, and more.

### `finview portfolio <symbol1> <symbol2> <symbol3>`
Displays your portfolio performance, showing the stocks you own and their respective prices.

### `finview quote <symbol>`
Fetches the current quote for a specified stock symbol.

### `finview ratios <symbol>`
Displays financial ratios for a given stock symbol, such as the P/E ratio, debt-to-equity ratio, etc.

### `finview watch <symbol>`
Adds a stock symbol to your watchlist for easy tracking.

### `finview watchlist <symbol1> <symbol2> <symbol3>`
Displays all the stocks currently on your watchlist, providing quick access to their market data.

## Configuration

You can customize finview by editing the configuration file located at `~./config.json`. Here you can set default stock symbols, chart styles, and refresh rates.

### Example `config.json`
```json
{
  "stocks": ["AAPL", "GOOG", "TSLA"],
  "refreshInterval": 300,
  "chartStyle": "line"
}
```

## Contributing

We welcome contributions! If you'd like to improve finview, please fork the repository and submit a pull request. Before submitting, ensure that your changes follow the guidelines for coding standards and documentation.

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Implement your changes and ensure tests are passing
4. Open a pull request with a description of the changes

## License

This project is licensed under the [MIT License](https://raw.githubusercontent.com/JustSouichi/finview/refs/heads/main/LICENSE).

## Author

Developed by **Tommaso Bertocchi** (alias [JustSouichi](https://github.com/JustSouichi)).
