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
    if (initGitPlugin) {
      pluginConfig.set('plugins', [...plugins, { ...initGitPlugin, enabled: true }] as any);
      await writePluginConfig();
    }
  }
  const context = {
    projectName,
    targetDir,
    skipPrompts: options.yes,
    all: options.all,
    git: options.git
  };
  initNodeEnv();
  main(context);
};
