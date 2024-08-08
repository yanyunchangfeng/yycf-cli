import path from 'path';
import { logger, readPluginConfig } from '../utils';

export const main = async (params: { projectName: string; targetDir: string }, context: Record<keyof any, any>) => {
  try {
    const plugins = await readPluginConfig();
    // 加载插件
    for await (const plugin of plugins) {
      const newPlugins = await readPluginConfig();
      const enabled = newPlugins.find((p) => p.name === plugin.name)?.enabled;
      if (enabled) {
        const pluginPath = path.resolve(__dirname, '../plugins', plugin.name);
        const pluginModule = require(pluginPath);
        if (typeof pluginModule.init === 'function') {
          await pluginModule.init(params, context);
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};
