# fincli

<p align="center">
  <img src="https://raw.githubusercontent.com/JustSouichi/fincli/refs/heads/main/img/logo.svg" width="200" height="179" alt="">
  <br>Consistent dependency versions in large JavaScript Monorepos.
  <br><a href="https://github.com/JustSouichi/fincli">https://github.com/JustSouichi/fincli</a>
</p>

[![npm version](https://badge.fury.io/js/fincli.svg)](https://badge.fury.io/js/fincli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.com/JustSouichi/fincli.svg?branch=main)](https://travis-ci.com/JustSouichi/fincli)
[![GitHub issues](https://img.shields.io/github/issues/JustSouichi/fincli.svg)](https://github.com/JustSouichi/fincli/issues)
[![GitHub stars](https://img.shields.io/github/stars/JustSouichi/fincli.svg?style=social&label=Stars)](https://github.com/JustSouichi/fincli/stargazers)
[![Downloads](https://img.shields.io/npm/dt/fincli.svg)](https://www.npmjs.com/package/fincli)

**fincli** is a command-line interface (CLI) tool for viewing financial data directly in your terminal. It brings a rich, interactive dashboard to your terminal, allowing you to monitor market trends, stock prices, and more—all without leaving your command line.

## Features

- **Interactive Terminal UI:**  
  Crafted with [blessed](https://github.com/chjj/blessed) and [blessed-contrib](https://github.com/yaronn/blessed-contrib), fincli renders dynamic interfaces and charts directly in your terminal.

- **Real-time Financial Data:**  
  Retrieve up-to-date market information using libraries like [yahoo-finance](https://www.npmjs.com/package/yahoo-finance) and [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2).

- **Data Visualization:**  
  Leverage [asciichart](https://github.com/kroitor/asciichart) for creating clear and concise ASCII-based charts of market trends.

- **Web Data Fetching & Scraping:**  
  With [axios](https://github.com/axios/axios), [cheerio](https://github.com/cheeriojs/cheerio), and [puppeteer](https://github.com/puppeteer/puppeteer), fincli can fetch and process additional data from the web when needed.

- **Intuitive Command Line Experience:**  
  Built with [commander](https://github.com/tj/commander.js) and [inquirer](https://github.com/SBoudrias/Inquirer.js), the tool provides an easy-to-navigate CLI for both beginners and advanced users.

## Installation

You can install fincli globally using npm:

```sh
npm install -g fincli
Usage
After installation, simply run the command:

sh
Copy
fincli
You will be greeted with an interactive dashboard where you can select various options to view live market data and detailed stock charts.

Configuration
While fincli works out of the box, you can customize its behavior via configuration options. For instance, you might configure default stock symbols or refresh intervals by editing a configuration file (e.g., ~/.fincli/config.json). Refer to the documentation for more detailed instructions (coming soon).

Contributing
Contributions are welcome and encouraged! If you have suggestions, bug reports, or improvements, please open an issue or submit a pull request on GitHub.

License
This project is licensed under the MIT License.

Author
Developed by Tommaso Bertocchi (alias JustSouichi).