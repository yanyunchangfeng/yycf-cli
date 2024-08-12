import { PluginContext, logPath } from '../../shared';
import { logger, generatorNewLogger } from '../../utils';
import config from './config.json';
import fs from 'fs-extra';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  await fs.emptyDir(logPath);
  generatorNewLogger();
  logger.info(`${config.name} ${config.exitMessage}`);
};
