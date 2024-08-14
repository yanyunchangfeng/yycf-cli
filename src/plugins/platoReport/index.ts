import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { PlatoReportService } from '../../services';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const platoService = new PlatoReportService(context);
  await platoService.init();
  logger.info(`${config.name} ${config.exitMessage}`);
};
