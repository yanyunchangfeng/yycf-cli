import dbConfig from '../../config/dbConfig';
import { logger } from '../../utils';
import { configPath } from '../../shared';
import config from './config.json';

export async function init(params: { projectName: string; targetDir: string }) {
  logger.info(`${config.name} ${config.initMessage}`);
  dbConfig.loadFile(configPath);
  logger.info(`${config.name} ${config.exitMessage}`);
}
