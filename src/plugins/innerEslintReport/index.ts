import { EslintReportService } from '../../services';
import { PluginContext } from '../../shared';
import config from './config.json';
import { logger } from '../../utils';
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
      const eslintorService = new EslintReportService(newContext, repo);
      await eslintorService.initInnerEslint();
    })
  );
  logger.info(`${config.name} ${config.exitMessage}`);
}
