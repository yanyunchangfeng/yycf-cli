import { PluginContext, logPath } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import fs from 'fs-extra';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const curLogPath = context.logPath || logPath;
  await fs.remove(curLogPath);
};
