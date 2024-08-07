import path from 'path';
import { loadConfig } from '../config/pluginConfig';
import { logger } from '../utils';

export const main = async (params: { projectName: string; targetDir: string }) => {
  try {
    const config = await loadConfig();
    // 加载插件
    for (const plugin of config.plugins) {
      if (plugin.enabled) {
        const pluginPath = path.resolve(__dirname, '../plugins', plugin.name);
        const pluginModule = require(pluginPath);
        if (typeof pluginModule.init === 'function') {
          await pluginModule.init(params);
        }
      }
    }
  } catch (error) {
    logger.error(error);
  }
};
