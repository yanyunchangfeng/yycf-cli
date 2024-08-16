import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { JsCpdService } from '../../services';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const jscpdService = new JsCpdService(context);
  await jscpdService.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
