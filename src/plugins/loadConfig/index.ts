import gitServerConfig from '../../config/gitServerConfig';
import pluginConfig from '../../config/pluginConfig';
import { logger } from '../../utils';
import { gitSeverPath, pluginPath } from '../../shared';
import config from './config.json';

export async function init() {
  logger.info(`${config.name} ${config.initMessage}`);
  gitServerConfig.loadFile(gitSeverPath);
  pluginConfig.loadFile(pluginPath);
  logger.info(`${config.name} ${config.exitMessage}`);
}
