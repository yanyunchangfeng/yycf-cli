import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { dbService } from '../../services';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  await dbService.init(context);
  logger.info(`${config.name} ${config.exitMessage}`);
};
