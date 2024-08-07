import { InstallDependencies } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export async function init(params: { projectName: string; targetDir: string }) {
  logger.info(`${config.name} ${config.initMessage}`);
  const insDep = new InstallDependencies(params.targetDir);
  await insDep.installDependencies();
  logger.info(`${config.name} ${config.exitMessage}`);
}
