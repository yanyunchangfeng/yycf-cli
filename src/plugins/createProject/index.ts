import { PluginContext } from '../../shared';
import { CreatorService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const creator = new CreatorService(context);
  await creator.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
