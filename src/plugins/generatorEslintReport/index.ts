import EslintReportService from '../../services/EslintReportService';
import { PluginContext } from '../../shared';
import config from './config.json';
import { logger } from '../../utils';

export async function init(context: PluginContext) {
  logger.info(`${config.name} ${config.initMessage}`);
  const eslintor = new EslintReportService(context);
  await eslintor.init();
  logger.info(`${config.name} ${config.exitMessage}`);
}
