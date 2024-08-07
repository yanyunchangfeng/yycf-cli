import EslintReportService from '../../services/EslintReportService';
import { PluginParams } from '../../shared';
import Inquirer from 'inquirer';
import config from './config.json';
import { logger } from '../../utils';

export async function init(params: PluginParams) {
  logger.info(`${config.name} ${config.initMessage}`);
  const { action } = await Inquirer.prompt({
    name: 'action',
    type: 'list',
    choices: ['No', 'Yes'],
    message: 'please choose generator eslint report:'
  } as any);
  if (action === 'Yes') {
    const eslintor = new EslintReportService(params.targetDir);
    await eslintor.generatorEslintReport();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
}
