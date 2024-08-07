import { PluginParams } from '../../shared';
import { CreatorService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (params: PluginParams) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const creator = new CreatorService(params.projectName, params.targetDir);
  await creator.create();
  logger.info(`${config.name} ${config.exitMessage}`);
};
