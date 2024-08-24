import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import config from './config.json';
import { PlatoReportService } from '../../services';
import path from 'path';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  if (context.all) {
    await Promise.allSettled(
      context.repos.map(async (repo) => {
        const { name, tag } = repo;
        const newContext = { ...context, targetDir: path.join(context.targetDir, `${name}${tag ? `@${tag}` : ''}`) };
        const platoService = new PlatoReportService(newContext);
        await platoService.init();
      })
    );
  } else {
    const platoService = new PlatoReportService(context);
    await platoService.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
