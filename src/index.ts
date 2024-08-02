#! /usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .command('create <app-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((name, cmd) => {
    require('./base/create')(name, cmd);
  });

program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>')
  .option('-d, --delete <path>', 'delete option from config')
  .action((value, cmd) => {
    // 配置优先以config中的index.json为准
    // cf config -s apiUrl https://api.github.com    value:"https://api.github.com" cmd:{set:'apiUrl'}

    require('./base/config')(value, cmd);
  });

program.on('--help', () => {
  console.log(`Run ${chalk.cyan(`cf/yycf <command> --help`)} show details`);
});

program.version(`code-analysis-tool@${require('../package.json').version}`).usage('<command> [option]');

program.parse(process.argv);
