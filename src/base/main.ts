import path from 'path';
import { logger } from '../utils';
import { dbService } from '../services';
import Listr from 'listr';

export const main = async (context: Record<keyof any, any>) => {
  try {
    // 任务生成函数
    const generateTasks = async () => {
      const { plugins } = await dbService.readPluginConfig();
      const serialTasks: Listr.ListrTask<any>[] = [];
      const parallelTasks: Listr.ListrTask<any>[] = [];
      const resourceIntensiveTasks: Listr.ListrTask<any>[] = [];

      for (const plugin of plugins) {
        if (!plugin.enabled) continue;

        const pluginPath = path.resolve(__dirname, '../plugins', plugin.name);
        const pluginModule = require(pluginPath);

        if (typeof pluginModule.init === 'function') {
          if (plugin.resourceIntensive) {
            resourceIntensiveTasks.push({
              title: `Init resource-intensive plugin ${plugin.name}`,
              task: async () => {
                await pluginModule.init(context);
              }
            });
          } else if (plugin.async) {
            parallelTasks.push({
              title: `Init plugin ${plugin.name}`,
              task: async () => {
                await pluginModule.init(context);
              }
            });
          } else {
            serialTasks.push({
              title: `Init plugin ${plugin.name}`,
              task: async () => {
                await pluginModule.init(context);
                // 更新 JSON 数据后重新生成任务列表
                const { plugins: updatedPlugins } = await dbService.readPluginConfig();
                return updatedPlugins;
              }
            });
          }
        }
      }
      return { serialTasks, parallelTasks, resourceIntensiveTasks };
    };

    let { serialTasks, parallelTasks, resourceIntensiveTasks } = await generateTasks();

    // 执行同步任务，执行完后可能会更新 enabled 字段
    if (serialTasks.length > 0) {
      const serialListr = new Listr(serialTasks, {
        renderer: context.skipPrompts && context.all ? 'default' : 'verbose',
        exitOnError: false
      });

      // 执行并捕获更新后的插件配置
      const updatedPlugins = await serialListr.run();

      // 如果配置更新，则重新生成任务列表
      if (updatedPlugins) {
        ({ serialTasks, parallelTasks, resourceIntensiveTasks } = await generateTasks());
      }
    }

    // 执行并行任务（仅执行已启用的异步任务）
    if (parallelTasks.length > 0) {
      const parallelListr = new Listr(parallelTasks, {
        concurrent: true, // 并行执行任务
        renderer: context.skipPrompts && context.all ? 'default' : 'verbose',
        exitOnError: false
      });
      await parallelListr.run();
    }

    // 对资源占用任务按优先级排序后执行
    if (resourceIntensiveTasks.length > 0) {
      const resItslistr = new Listr(resourceIntensiveTasks, {
        renderer: context.skipPrompts && context.all ? 'default' : 'verbose',
        exitOnError: false
      });
      await resItslistr.run();
    }
  } catch (error) {
    logger.error(error);
  }
};
