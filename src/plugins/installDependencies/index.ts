import { InstallDependencies } from '../../services';
import { logger } from '../../utils';
import { PluginContext } from '../../shared';
import config from './config.json';

export async function init(context: PluginContext) {
  logger.info(`${config.name} ${config.initMessage}`);
  const insDep = new InstallDependencies(context.targetDir);
  await insDep.installDependencies();
  logger.info(`${config.name} ${config.exitMessage}`);
}
