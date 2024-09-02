#! /usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .command('create <app-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .option('-y, --yes', 'use defaults without prompting')
  .option('-a, --all', 'download all repos')
  .option('-g, --git', 'initialize a git repository')
  .action((name, cmd) => {
    require('./base/create')(name, cmd);
  });

program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from config')
  .option('-s, --set <path> <value>', 'set value from config')
  .option('-d, --delete <path>', 'delete option from config')
  .action((value, cmd) => {
    require('./base/config')(value, cmd);
  });

program.on('--help', () => {
  console.log(`Run ${chalk.cyan(`cf/yycf <command> --help`)} show details`);
});

program.version(`yycf-cli@${require('../package.json').version}`).usage('<command> [option]');

program.parse(process.argv);
