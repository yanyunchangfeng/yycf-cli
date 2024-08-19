import { PluginParams } from '../../shared';
import { SetUpService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (params: PluginParams) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const setUpService = new SetUpService();
  await setUpService.setup('yarn');
  logger.info(`${config.name} ${config.exitMessage}`);
};
