import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { MadgeReportService } from '../../services';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const madgeService = new MadgeReportService(context);
  await madgeService.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
