import { init } from 'src/plugins/clearCacheRepository';
import { PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import { uniqueId } from 'test/utils';

describe('clearCacheRepository', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;
  beforeEach(async () => {
    context = {} as PluginContext;
    context.cacheDirName = uniqueId();
    initSpy = jest
      .spyOn(CacheRepositoryService.prototype, 'clearCacheRepository')
      .mockImplementation((() => {}) as any);
  });

  it('should clear cache repo dir', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
