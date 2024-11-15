import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { PackageService } from '../../services';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const pkgService = new PackageService(context);
  await pkgService.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
