import path from 'path';
import fs from 'fs-extra';
import Inquirer from 'inquirer';
import { wrapLoading, initNodeEnv, readPluginConfig, writePluginConfig } from '../utils';
import { main } from '../base/main';
import { pluginConfig } from '../config';

module.exports = async (projectName: string, options: Record<keyof any, any>) => {
  const cwd = process.cwd();
  const targetDir = path.join(cwd, projectName);
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await wrapLoading(fs.remove, 'Deleting target directory', targetDir);
    } else {
      const { action } = await Inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `Target directory already exists Pick an action:`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ] as any);
      if (!action) {
        return;
      }
      if (action === 'overwrite') {
        await wrapLoading(fs.remove, 'Deleting target directory', targetDir);
      }
    }
  }
  if (options.git) {
    const { plugins } = await readPluginConfig();
    const initGitPlugin = plugins.find((plugin) => plugin.name === 'initGit');
    const index = plugins.findIndex((plugin) => plugin.name === 'initGit');
    if (index) {
      pluginConfig.set('plugins', [
        ...plugins.slice(0, index),
        { ...initGitPlugin, enabled: true },
        ...plugins.slice(index + 1)
      ] as any);
      await writePluginConfig();
    }
  }
  if (options.install) {
    const { plugins } = await readPluginConfig();
    const installPlugin = plugins.find((plugin) => plugin.name === 'installDependencies');
    const index = plugins.findIndex((plugin) => plugin.name === 'installDependencies');
    if (installPlugin) {
      pluginConfig.set('plugins', [
        ...plugins.slice(0, index),
        { ...installPlugin, enabled: true },
        ...plugins.slice(index + 1)
      ] as any);
      await writePluginConfig();
    }
  }
  const context = {
    projectName,
    targetDir,
    skipPrompts: options.yes,
    all: options.all,
    git: options.git,
    runInstall: options.install
  };
  initNodeEnv();
  main(context);
};
