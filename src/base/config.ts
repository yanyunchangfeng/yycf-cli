import { dbService } from '../services';
import chalk from 'chalk';
import { logger } from '../utils';
import { init } from '../plugins/loadConfig';
import { PluginContext, gitSeverPath } from '../shared';

module.exports = async (value: any, options: Record<keyof any, any>) => {
  init({} as PluginContext);
  logger.info(`${chalk.cyan(`value`)} : ${chalk.green(value)}`);
  logger.info(`${chalk.cyan(`options`)} : ${chalk.green(JSON.stringify(options))}`);
  if (!Object.keys(options).length) return;
  if (options.set && value) {
    dbService.gitServerConfigDb.set(options.set, value);
    await dbService.writeGitServerConfig();
    logger.info(`set file [${gitSeverPath}] the field ${chalk.cyan(options.set)} to ${chalk.green(value)}`);
  }
  if (options.get) {
    logger.info(
      `get file [${gitSeverPath}] the field ${chalk.cyan(options.get)} as ${chalk.green(
        dbService.gitServerConfigDb.get(options.get)
      )}`
    );
  }
};
