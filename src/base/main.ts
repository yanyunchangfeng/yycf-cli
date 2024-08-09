import path from 'path';
import { logger, readPluginConfig } from '../utils';

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
          await pluginModule.init(context);
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};
