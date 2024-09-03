import path from 'path';
import { gitSeverPath, PluginContext } from 'src/shared';
import fs from 'fs-extra';

// 辅助函数：生成唯一的临时路径
function createTempGitServerPath() {
  return path.join(process.cwd(), `gitServer-${Date.now()}-${Math.random()}`, 'index.json');
}
// 辅助函数：设置上下文和复制配置文件
export async function setupContextAndCopyFile(context: PluginContext) {
  const tempGitSeverPath = createTempGitServerPath();
  await fs.copy(gitSeverPath, tempGitSeverPath);
  context.gitServerPath = tempGitSeverPath;
  return tempGitSeverPath;
}
