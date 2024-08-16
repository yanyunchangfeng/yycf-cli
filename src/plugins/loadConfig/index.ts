import { gitServerConfig } from '../../config';
import { logger } from '../../utils';
import { gitSeverPath } from '../../shared';
import config from './config.json';

export async function init() {
  logger.info(`${config.name} ${config.initMessage}`);
  gitServerConfig.loadFile(gitSeverPath);
  logger.info(`${config.name} ${config.exitMessage}`);
}
