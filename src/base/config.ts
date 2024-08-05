import { writeConfig, config } from '../utils';
import chalk from 'chalk';

module.exports = async (value: any, cfg: Record<keyof any, any>) => {
  console.log(`${chalk.cyan(`value :`)}`, value);
  console.log(`${chalk.cyan(`cfg : `)}`, cfg);
  if (!Object.keys(cfg).length) return;
  if (cfg.set && value) {
    config.set(cfg.set, value);
    await writeConfig();
    console.log(`${chalk.cyan(`${config.set} : ${value}`)}`);
  }
  if (cfg.get) {
    console.log(`${chalk.cyan(`${cfg.get} : ${config.get(cfg.get)}`)}`);
  }
};
