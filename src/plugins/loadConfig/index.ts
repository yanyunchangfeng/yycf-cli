import { PluginContext, gitSeverPath } from '../../shared';
import { gitServerConfig } from '../../config';
import { logger } from '../../utils';
import config from './config.json';
import fs from 'fs-extra';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const curGitServerPath = context.gitServerPath || gitSeverPath;
  if (fs.existsSync(curGitServerPath)) {
    gitServerConfig.loadFile(curGitServerPath);
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
