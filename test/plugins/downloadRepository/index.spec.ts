import { init } from 'src/plugins/downloadRepository';
import { PluginContext } from 'src/shared';
import { DownLoadService } from 'src/services';

describe('cacheRepository', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    context.cacheDirName = `cache-${Date.now()}-${Math.random()}`;
    initSpy = jest.spyOn(DownLoadService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should download repo ', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
