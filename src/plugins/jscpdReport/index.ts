import { PluginContext } from '../../shared';
import { logger } from '../../utils';
import { JsCpdService } from '../../services';
import config from './config.json';
import path from 'path';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  if (context.all) {
    await Promise.allSettled(
      context.repos.map(async (repo) => {
        const { name, tag } = repo;
        const newContext = { ...context, targetDir: path.join(context.targetDir, `${name}${tag ? `@${tag}` : ''}`) };
        const jscpdService = new JsCpdService(newContext);
        await jscpdService.init();
      })
    );
  } else {
    const jscpdService = new JsCpdService(context);
    await jscpdService.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
