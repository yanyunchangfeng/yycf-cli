import { PluginContext } from '../../shared';
import { logger, readFile, writeFile } from '../../utils';
import config from './config.json';
import path from 'path';

async function writePkg(this: PluginContext) {
  const pkgPath = path.join(this.targetDir, 'package.json');
  let pInfo: any = await readFile(pkgPath, true);
  if (!pInfo) return;
  pInfo.name = this.projectName;
  await writeFile(pkgPath, pInfo, true);
}

export const init = async (context: PluginContext) => {
  logger.info(`${config.name} ${config.initMessage}`);
  await writePkg.call(context);
  logger.info(`${config.name} ${config.exitMessage}`);
};
