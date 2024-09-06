import { init } from 'src/plugins/cacheRepository';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import fs from 'fs-extra';
import { uniqueId } from 'test/utils';

describe('cacheRepository', () => {
  let cacheDir: string;
  let context: PluginContext;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    context.cacheDirName = uniqueId();
    cacheDir = new CacheRepositoryService(context).cacheDir;
    initSpy = jest.spyOn(CacheRepositoryService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should cache repo dir', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {
    await fs.remove(cacheDir);
  });
});
