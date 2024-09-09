import { init } from 'src/plugins/loadConfig';
import { logger } from 'src/utils';
import config from 'src/plugins/loadConfig/config.json';
import { dbService } from 'src/services';
import { PluginContext } from 'src/shared';

describe('loadConfig', () => {
  let context: PluginContext;
  let logSpy: jest.SpyInstance;
  let initSpy: jest.SpyInstance;

  beforeEach(async () => {
    context = {} as PluginContext;
    logSpy = jest.spyOn(logger, 'info').mockImplementation((() => {}) as any);
    initSpy = jest.spyOn(dbService, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should log init and exit messages [mock]', async () => {
    await init(context);
    // 验证是否记录了初始化消息;
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.initMessage}`);
    // 验证是否记录了退出消息;
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.exitMessage}`);
  });

  it('should load config file with default path on init [mock]', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalledWith(context);
  });

  afterEach(async () => {});
});
