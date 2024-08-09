import { PluginContext } from '../../shared';
import { CacheRepositoryService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const cache = new CacheRepositoryService(context);
  await cache.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
