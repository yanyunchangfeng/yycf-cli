import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { PlatoReportService } from '../../services';
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
      const platoService = new PlatoReportService(newContext, repo);
      await platoService.init();
    })
  );
  logger.info(`${config.name} ${config.exitMessage}`);
};
