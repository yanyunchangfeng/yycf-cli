import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { MadgeReportService } from '../../services';
import config from './config.json';
import path from 'path';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);

  if (context.all) {
    await Promise.allSettled(
      context.repos.map(async (repo) => {
        const { name, tag } = repo;
        const newContext = { ...context, targetDir: path.join(context.targetDir, `${name}${tag ? `@${tag}` : ''}`) };
        const madgeService = new MadgeReportService(newContext);
        await madgeService.init();
      })
    );
  } else {
    const madgeService = new MadgeReportService(context);
    await madgeService.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
