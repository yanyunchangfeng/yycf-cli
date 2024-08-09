import path from 'path';
import fs from 'fs-extra';
import Inquirer from 'inquirer';
import { wrapLoading } from '../utils';
import { main } from './main';

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
  const context: Record<keyof any, any> = {
    projectName,
    targetDir
  };
  main(context);
};
