import path from 'path';
import { gitServerPath, integrationTempDir } from 'test/shared';
import { uniqueId } from '.';
import { PluginContext } from 'src/shared';
import { dbService } from 'src/services';
import { copy } from 'src/utils';

// 辅助函数：生成唯一的临时路径
function createTempGitServerPath() {
  return path.join(integrationTempDir, uniqueId('gitServer'), 'index.json');
}
// 辅助函数：设置上下文和复制配置文件
export async function setUpGitServerContextAndCopyFile(context: PluginContext) {
  const tempGitSeverPath = createTempGitServerPath();
  context.gitServerPath = tempGitSeverPath;
  await copy(gitServerPath, tempGitSeverPath);
  await dbService.init(context);
  await dbService.gitServerConfigDb.set('defaults.defaultGitServer', 'yycf');
  await dbService.writeGitServerConfig(context);
  return tempGitSeverPath;
}
