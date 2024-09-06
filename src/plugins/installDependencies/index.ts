import { InstallDependencies } from '../../services';
import { logger } from '../../utils';
import { PluginContext } from '../../shared';
import config from './config.json';
import path from 'path';

export async function init(context: PluginContext) {
  logger.info(`${config.name} ${config.initMessage}`);
  await Promise.allSettled(
    context.repos.map(async (repo) => {
      const { name } = repo;
      let newContext = { ...context };
      if (context.all) {
        newContext = { ...context, targetDir: path.join(context.targetDir, name) };
      }
      const insDep = new InstallDependencies(newContext, repo);
      await insDep.init();
    })
  );
  logger.info(`${config.name} ${config.exitMessage}`);
}
