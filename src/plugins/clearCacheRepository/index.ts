import { PluginParams } from '../../shared';
import { CacheRepositoryService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (params: PluginParams) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const cache = new CacheRepositoryService();
  await cache.clearCacheRepository();
  logger.info(`${config.name} ${config.exitMessage}`);
};
