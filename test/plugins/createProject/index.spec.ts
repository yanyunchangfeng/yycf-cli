import { init } from 'src/plugins/createProject';
import { PluginContext } from 'src/shared';
import { logger } from 'src/utils';
import { CreatorService } from 'src/services';
import config from 'src/plugins/createProject/config.json';

describe('createProject', () => {
  let logSpy: jest.SpyInstance;
  let initSpy: jest.SpyInstance;
  let context: PluginContext;

  beforeEach(async () => {
    context = {
      skipPrompts: true
    } as PluginContext;

    logSpy = jest.spyOn(logger, 'info').mockImplementation((() => {}) as any);
    initSpy = jest.spyOn(CreatorService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should log init and exit messages [mock]', async () => {
    await init(context);
    // 验证是否记录了初始化消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.initMessage}`);
    // 验证是否记录了退出消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.exitMessage}`);
  });

  it('should create a project [mock]', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });
});
