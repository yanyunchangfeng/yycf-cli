import { PluginContext, logPath } from '../../shared';
import { initializeLogger, logger } from '../../utils';
import config from './config.json';
import fs from 'fs-extra';

export const init = async (context: PluginContext) => {
  if (!fs.existsSync(logPath)) {
    await initializeLogger();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
