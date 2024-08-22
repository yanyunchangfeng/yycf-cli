import path from 'path';
import { logger, readPluginConfig } from '../utils';
import Listr from 'listr';

export const main = async (context: Record<keyof any, any>) => {
  try {
    const { plugins } = await readPluginConfig();
    // 加载插件
    const tasksList: Listr.ListrTask<any>[] = [];
    for await (const plugin of plugins) {
      const { plugins: newPlugins } = await readPluginConfig();
      const enabled = newPlugins.find((p) => p.name === plugin.name)?.enabled;
      if (enabled) {
        const pluginPath = path.resolve(__dirname, '../plugins', plugin.name);
        const pluginModule = require(pluginPath);
        if (typeof pluginModule.init === 'function') {
          tasksList.push({
            title: plugin.name,
            task: async (ctx, task) => {
              if (plugin.async) {
                pluginModule.init(context);
              } else {
                await pluginModule.init(context);
              }
            },
            enabled: () => plugin.enabled
          });
        }
      }
    }
    const tasks = new Listr(tasksList, {
      renderer: 'verbose', // silent | default
      exitOnError: false
    });
    tasks.run();
  } catch (error) {
    logger.error(error);
  }
};
