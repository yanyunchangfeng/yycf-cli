import { init } from 'src/plugins/clearCacheRepository';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import path from 'path';
import fs from 'fs-extra';
const cwd = process.cwd();

describe('clearCacheRepository', () => {
  const context: PluginContext = {
    projectName: 'testProject',
    targetDir: path.join(cwd, 'testProject'),
    destDirs: [],
    repos: [
      {
        id: 222,
        name: 'webpack-react-template',
        tag: 'v1.0.0'
      }
    ],
    cacheDirName: 'testProjectCache'
  };
  const cache = new CacheRepositoryService(context);
  beforeEach(async () => {
    // 确保缓存目录存在
    await fs.ensureDir(cache.cacheDir);
  });
  it('should clear cache repo dir', async () => {
    await init(context);
    expect(fs.existsSync(cache.cacheDir)).toBe(false);
  });
});
