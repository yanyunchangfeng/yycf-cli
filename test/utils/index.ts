import path from 'path';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService, dbService } from 'src/services';
import fs from 'fs-extra';

// 辅助函数：生成唯一的临时路径
function createTempGitServerPath() {
  return path.join(tempDir, uniqueId('gitServer'), 'index.json');
}
// 辅助函数：设置上下文和复制配置文件
export async function setupContextAndCopyFile(context: PluginContext) {
  const tempGitSeverPath = createTempGitServerPath();
  context.gitServerPath = tempGitSeverPath;
  const gitServerPath = path.join(process.cwd(), 'bin', 'resources', 'db', 'gitServerJson', 'index.json');
  await fs.copy(gitServerPath, tempGitSeverPath);
  await dbService.init(context);
  await dbService.gitServerConfigDb.set('defaults.defaultGitServer', 'yycf');
  await dbService.writeGitServerConfig(context);
  return tempGitSeverPath;
}
export function createTempPath(prefix?: string) {
  return path.join(tempDir, uniqueId(prefix));
}
export const uniqueId = (prefix = 'temp') => `${prefix}-${Date.now()}`;
const cache = new CacheRepositoryService({ cacheDirName: 'testTemp' } as PluginContext);
export const tempDir = cache.cacheDir;
