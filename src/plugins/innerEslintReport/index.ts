import { EslintReportService } from '../../services';
import { PluginContext } from '../../shared';
import config from './config.json';
import { logger } from '../../utils';
import path from 'path';

export async function init(context: PluginContext) {
  logger.info(`${config.name} ${config.initMessage}`);
  if (context.all) {
    await Promise.allSettled(
      context.repos.map(async (repo) => {
        const { name, tag } = repo;
        const newContext = { ...context, targetDir: path.join(context.targetDir, `${name}${tag ? `@${tag}` : ''}`) };
        const eslintorService = new EslintReportService(newContext);
        await eslintorService.initInnerEslint();
      })
    );
  } else {
    const eslintorService = new EslintReportService(context);
    await eslintorService.initInnerEslint();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
}
