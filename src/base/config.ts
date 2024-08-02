import { readConfig, writeConfig } from '../utils';
import chalk from 'chalk';

module.exports = async (value: any, config: Record<keyof any, any>) => {
  if (!Object.keys(config).length) return;
  if (config.set && value) {
    let data = await readConfig();
    if (!data) return;
    data = Object.assign(data, { [config.set]: value });
    await writeConfig(data);
    console.log(`${chalk.cyan(`${config.set} : ${data[config.set]}`)}`);
  }
  if (config.get) {
    let data = await readConfig();
    if (!data) return;
    console.log(`${chalk.cyan(`${config.get} : ${data[config.get]}`)}`);
  }
};
