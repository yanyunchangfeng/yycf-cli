import { init } from 'src/plugins/writePkg';
import { PluginContext } from 'src/shared';
import { PackageService } from 'src/services';

describe('writePkg', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    initSpy = jest.spyOn(PackageService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should write the project package.json', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });

  afterEach(async () => {});
});
