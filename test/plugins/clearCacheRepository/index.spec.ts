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
    destDir: '',
    repo: {
      id: 222,
      name: 'webpack-react-template'
    },
    tag: 'v18.2.0'
  };
  const cache = new CacheRepositoryService(context);
  context.destDir = path.join(cache.cacheDir, `${context.repo.name}${context.tag ? `@${context.tag}` : ''}`);
  beforeEach(async () => {
    // 确保缓存目录存在
    await fs.ensureDir(cache.cacheDir);
    if (!fs.existsSync(context.destDir)) {
      await fs.mkdir(context.destDir);
    }
  });
  it('should clear cache Repo', async () => {
    await init(context);
    expect(fs.existsSync(cache.cacheDir)).toBe(false);
  });
});
