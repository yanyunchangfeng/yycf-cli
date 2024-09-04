import { PluginContext } from '../../shared';
import { PromptService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  if (!context.skipPrompts) {
    const prompt = new PromptService(context);
    await prompt.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
