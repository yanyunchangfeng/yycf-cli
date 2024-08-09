import { PluginContext } from '../../shared';
import { DownLoadService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const downloadService = new DownLoadService(context);
  await downloadService.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
