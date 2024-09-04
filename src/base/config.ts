import { dbService } from '../services';
import chalk from 'chalk';
import { logger } from '../utils';

module.exports = async (value: any, cfg: Record<keyof any, any>) => {
  logger.info(`${chalk.cyan(`value :`)}`, value);
  logger.info(`${chalk.cyan(`cfg : `)}`, cfg);
  if (!Object.keys(cfg).length) return;
  if (cfg.set && value) {
    dbService.gitServerConfigDb.set(cfg.set, value);
    await dbService.writeGitServerConfig();
    logger.info(`${chalk.cyan(`${cfg.set} : ${value}`)}`);
  }
  if (cfg.get) {
    logger.info(`${chalk.cyan(`${cfg.get} : ${dbService.gitServerConfigDb.get(cfg.get)}`)}`);
  }
};
