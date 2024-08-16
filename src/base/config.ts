import { writeGitServerConfig } from '../utils';
import { gitServerConfig } from '../config';
import chalk from 'chalk';
import { logger } from '../utils';

module.exports = async (value: any, cfg: Record<keyof any, any>) => {
  logger.info(`${chalk.cyan(`value :`)}`, value);
  logger.info(`${chalk.cyan(`cfg : `)}`, cfg);
  if (!Object.keys(cfg).length) return;
  if (cfg.set && value) {
    gitServerConfig.set(cfg.set, value);
    await writeGitServerConfig();
    logger.info(`${chalk.cyan(`${cfg.set} : ${value}`)}`);
  }
  if (cfg.get) {
    logger.info(`${chalk.cyan(`${cfg.get} : ${gitServerConfig.get(cfg.get)}`)}`);
  }
};
