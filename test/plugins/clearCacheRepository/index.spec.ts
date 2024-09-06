import { init } from 'src/plugins/clearCacheRepository';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import fs from 'fs-extra';
import { uniqueId } from 'test/utils';

describe('clearCacheRepository', () => {
  let cacheDir: string;
  let context: PluginContext;

  beforeEach(async () => {
    context = {} as PluginContext;
    context.cacheDirName = uniqueId();
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
