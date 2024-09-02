import path from 'path';
import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { SetUpService } from '../../services';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  await Promise.allSettled(
    context.repos.map(async (repo) => {
      const { name } = repo;
      let newContext = { ...context };
      if (context.all) {
        newContext = { ...context, targetDir: path.join(context.targetDir, name) };
      }
      const setUpService = new SetUpService(newContext.targetDir);
      setUpService.exec('git', ['init'], `initialize ${name} git repository`);
    })
  );
  logger.info(`${config.name} ${config.exitMessage}`);
};
