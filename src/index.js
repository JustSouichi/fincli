#!/usr/bin/env node

// Importa le librerie
const { program } = require('commander');
const chalk = require('chalk');

// Imposta la versione e la descrizione del tool
program
  .version('1.0.0')
  .description('fincli: CLI tool for financial monitoring');

// Definisci un comando di esempio: "hello"
program
  .command('hello')
  .description('Print a welcome message')
  .action(() => {
    console.log(chalk.green('Welcome to fincli!'));
  });

// Gestione dell'help se nessun comando viene passato
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Avvia il parsing degli argomenti della CLI
program.parse(process.argv);
