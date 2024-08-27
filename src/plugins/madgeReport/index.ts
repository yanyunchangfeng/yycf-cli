import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { MadgeReportService } from '../../services';
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
      const madgeService = new MadgeReportService(newContext, repo);
      await madgeService.init();
    })
  );

  logger.info(`${config.name} ${config.exitMessage}`);
};
