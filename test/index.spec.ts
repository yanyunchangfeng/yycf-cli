import { init as clearLogs } from 'src/plugins/clearLogs';
import { init as initLogs } from 'src/plugins/initLogs';
import { init as clearCacheRepository } from 'src/plugins/clearCacheRepository';
import fs from 'fs-extra';
import { logPath, PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import path from 'path';
const cwd = process.cwd();

describe('Main Workflow', () => {
  const context: PluginContext = {
    projectName: 'testProject',
    targetDir: path.join(cwd, 'testProject'),
    destDir: '',
    repo: {
      id: 222,
      name: 'webpack-react-template'
    },
    tag: 'v18.2.0'
  };
  const cache = new CacheRepositoryService(context);
  it('should execute the full workflow correctly', async () => {
    await clearLogs(context);
    expect(fs.existsSync(logPath)).toBe(false);
    await initLogs(context);
    expect(fs.existsSync(logPath)).toBe(true);
    await clearCacheRepository(context);
    expect(fs.existsSync(cache.cacheDir)).toBe(false);
  });
});
