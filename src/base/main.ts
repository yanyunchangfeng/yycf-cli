import path from 'path';
import { logger, readPluginConfig } from '../utils';
import Listr from 'listr';

export const main = async (context: Record<keyof any, any>) => {
  try {
    const { plugins } = await readPluginConfig();
    // 加载插件
    for await (const plugin of plugins) {
      const { plugins: newPlugins } = await readPluginConfig();
      const enabled = newPlugins.find((p) => p.name === plugin.name)?.enabled;
      if (enabled) {
        const pluginPath = path.resolve(__dirname, '../plugins', plugin.name);
        const pluginModule = require(pluginPath);
        if (typeof pluginModule.init === 'function') {
          const tasksList: Listr.ListrTask<any>[] = [];
          tasksList.push({
            title: plugin.name,
            task: async (ctx, task) => {
              if (plugin.async) {
                pluginModule.init(context);
              } else {
                await pluginModule.init(context);
              }
            },
            enabled: () => enabled
          });
          const tasks = new Listr(tasksList, {
            renderer: context.skipPrompts && context.all ? 'default' : 'verbose',
            exitOnError: false
          });
          await tasks.run();
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};
