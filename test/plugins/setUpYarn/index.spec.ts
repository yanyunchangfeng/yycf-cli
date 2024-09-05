import { init } from 'src/plugins/setUpYarn';
import { PluginContext } from 'src/shared';
import { SetUpService } from 'src/services';

describe('setUpYarn', () => {
  let context: PluginContext;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    initSpy = jest.spyOn(SetUpService.prototype, 'setup').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should setup yarn', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalledWith('yarn');
  });

  afterEach(async () => {});
});
