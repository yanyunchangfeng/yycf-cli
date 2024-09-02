import { init } from 'src/plugins/clearCacheRepository';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import path from 'path';
import fs from 'fs-extra';

const cwd = process.cwd();

describe('clearCacheRepository', () => {
  let cacheDir: string;
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
    ]
  };

  beforeEach(async () => {
    context.cacheDirName = `cache-${Date.now()}-${Math.random()}`;
    cacheDir = new CacheRepositoryService(context).cacheDir;
    await fs.ensureDir(cacheDir);
  });
  it('should clear cache repo dir', async () => {
    await init(context);
    expect(fs.existsSync(cacheDir)).toBe(false);
  });
  afterEach(async () => {
    await fs.remove(cacheDir);
  });
});
