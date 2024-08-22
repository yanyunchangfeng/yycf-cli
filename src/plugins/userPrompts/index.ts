import { PluginContext } from '../../shared';
import { PromptService } from '../../services';
import { logger } from '../../utils';
import config from './config.json';

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  const prompt = new PromptService(context);
  if (!context.skipPrompts) {
    await prompt.init();
  }
  logger.info(`${config.name} ${config.exitMessage}`);
};
