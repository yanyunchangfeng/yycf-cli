import { init } from 'src/plugins/userPrompts';
import { logger } from 'src/utils';
import { PluginContext } from 'src/shared';
import config from 'src/plugins/userPrompts/config.json';
import { PromptService } from 'src/services';

describe('userPrompts', () => {
  let logSpy: jest.SpyInstance;
  let initSpy: jest.SpyInstance;
  let context: PluginContext;

  beforeEach(async () => {
    context = {
      skipPrompts: false
    } as PluginContext;

    logSpy = jest.spyOn(logger, 'info').mockImplementation((() => {}) as any);
    initSpy = jest.spyOn(PromptService.prototype, 'init').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should log init and exit messages', async () => {
    await init(context);
    // 验证是否记录了初始化消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.initMessage}`);
    // 验证是否记录了退出消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.exitMessage}`);
  });

  it('should initialize PromptService when skipPrompts is false', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });
});
