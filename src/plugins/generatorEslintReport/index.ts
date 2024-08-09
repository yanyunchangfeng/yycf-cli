import EslintReportService from '../../services/EslintReportService';
import { PluginContext } from '../../shared';
import Inquirer from 'inquirer';
import config from './config.json';
import { logger } from '../../utils';

export async function init(context: PluginContext) {
  logger.info(`${config.name} ${config.initMessage}`);
  const { action } = await Inquirer.prompt({
    name: 'action',
    type: 'list',
    choices: ['No', 'Yes'],
    message: 'please choose generator eslint report:'
  } as any);
  if (action === 'Yes') {
    const eslintor = new EslintReportService(context);
    await eslintor.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
}
