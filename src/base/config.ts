import { writeConfig } from '../utils';
import config from '../config/dbConfig';
import chalk from 'chalk';
import { logger } from '../utils';

module.exports = async (value: any, cfg: Record<keyof any, any>) => {
  logger.info(`${chalk.cyan(`value :`)}`, value);
  logger.info(`${chalk.cyan(`cfg : `)}`, cfg);
  if (!Object.keys(cfg).length) return;
  if (cfg.set && value) {
    config.set(cfg.set, value);
    await writeConfig();
    logger.info(`${chalk.cyan(`${config.set} : ${value}`)}`);
  }
  if (cfg.get) {
    logger.info(`${chalk.cyan(`${cfg.get} : ${config.get(cfg.get)}`)}`);
  }
};
