import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { JsCpdService } from '../../services';
import config from './config.json';
import path from 'path';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  await Promise.allSettled(
    context.repos.map(async (repo) => {
      const { name } = repo;
      let newContext = { ...context };
      if (context.all) {
        newContext = { ...context, targetDir: path.join(context.targetDir, name) };
      }
      const jscpdService = new JsCpdService(newContext, repo);
      await jscpdService.init();
    })
  );
  logger.info(`${config.name} ${config.exitMessage}`);
};
