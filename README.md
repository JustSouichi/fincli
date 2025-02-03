
# fincli

<p align="center">
  <img src="https://raw.githubusercontent.com/JustSouichi/fincli/refs/heads/main/img/logo.svg" width="200" height="179" alt="">
  <br><strong>Command-line tool for monitoring financial data and market trends in real-time directly from your terminal.</strong>
  <br><a href="https://github.com/JustSouichi/fincli">GitHub Repository</a>
</p>

## Installation

Install **fincli** globally using npm:

```bash
npm install -g fincli
```

## Features

- **Interactive Terminal UI:**  
  Built with [blessed](https://github.com/chjj/blessed) and [blessed-contrib](https://github.com/yaronn/blessed-contrib), **fincli** provides a rich, interactive dashboard for viewing financial data right in the terminal.

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
fincli
```

You will be presented with an interactive dashboard where you can:

- View real-time market data
- Monitor stock prices
- Access detailed charts and financial news

## Commands

### `fincli --help`
Displays help information with all available commands and options.

### `fincli market`
Fetches and displays the current market status with trending stocks.

### `fincli stocks <symbol>`
Displays detailed stock data for a specific stock symbol (e.g., `fincli stocks AAPL` for Apple).

### `fincli chart <symbol>`
Shows a chart with historical price data for the specified stock symbol.

### `fincli news`
Fetches the latest financial news from top sources.

### `fincli settings`
Allows you to configure default settings, like the preferred stock symbols and refresh intervals. Settings are saved in `~/.fincli/config.json`.

## Configuration

You can customize **fincli** by editing the configuration file located at `~/.fincli/config.json`. Here you can set default stock symbols, chart styles, and refresh rates.

### Example `config.json`
```json
{
  "stocks": ["AAPL", "GOOG", "TSLA"],
  "refreshInterval": 300,
  "chartStyle": "line"
}
```

## Contributing

We welcome contributions! If you'd like to improve **fincli**, please fork the repository and submit a pull request. Before submitting, ensure that your changes follow the guidelines for coding standards and documentation.

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Implement your changes and ensure tests are passing
4. Open a pull request with a description of the changes

## License

This project is licensed under the [MIT License](./LICENSE).

## Author

Developed by **Tommaso Bertocchi** (alias [JustSouichi](https://github.com/JustSouichi)).
