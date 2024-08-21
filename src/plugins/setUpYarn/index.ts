import { PluginContext } from '../../shared';
import { SetUpService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const setUpService = new SetUpService(context.targetDir);
  await setUpService.setup('yarn');
  logger.info(`${config.name} ${config.exitMessage}`);
};
