const inquirer = require('inquirer').default || require('inquirer');

async function interactiveMenu() {
  const questions = [
    {
      type: 'list',
      name: 'command',
      message: 'Select a command:',
      choices: ['hello', 'chart', 'quote', 'financials', 'ratios', 'news']
    },
    {
      type: 'input',
      name: 'ticker',
      message: 'Enter ticker (if applicable):',
      when: (answers) => ['quote', 'financials', 'ratios', 'news'].includes(answers.command)
    }
  ];

  const answers = await inquirer.prompt(questions);

  switch (answers.command) {
    case 'hello': {
      const chalk = require('chalk').default || require('chalk');
      console.log(chalk.green('Welcome to fincli!'));
      break;
    }
    case 'chart': {
      const { showChart } = require('./chart');
      showChart();
      break;
    }
    case 'quote': {
      const { getQuote } = require('./quote');
      await getQuote(answers.ticker);
      break;
    }
    case 'financials': {
      const { getFinancials } = require('./financials');
      await getFinancials(answers.ticker);
      break;
    }
    case 'ratios': {
      const { getRatios } = require('./ratios');
      await getRatios(answers.ticker);
      break;
    }
    case 'news': {
      const { getNews } = require('./news');
      await getNews(answers.ticker);
      break;
    }
  }
}

module.exports = { interactiveMenu };
