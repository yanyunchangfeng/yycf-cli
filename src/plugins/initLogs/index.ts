import { PluginContext, logPath } from '../../shared';
import { initializeLogger, logger } from '../../utils';
import config from './config.json';
import fs from 'fs-extra';

export const init = async (context: PluginContext) => {
  const curLogPath = context.logPath || logPath;
  if (!fs.existsSync(curLogPath)) {
    await initializeLogger(curLogPath);
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
