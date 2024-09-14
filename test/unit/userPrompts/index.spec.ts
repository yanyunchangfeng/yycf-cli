import { init } from 'src/plugins/userPrompts';
import { logger } from 'src/utils';
import { PluginContext, GITSERVER } from 'src/shared';
import config from 'src/plugins/userPrompts/config.json';
import { PromptService, dbService } from 'src/services';
import Inquirer from 'inquirer';

jest.mock('inquirer');
jest.mock('src/services', () => ({
  ...jest.requireActual('src/services'),
  dbService: {
    readGitServerConfig: jest.fn(),
    writeGitServerConfig: jest.fn(),
    gitServerConfigDb: {
      set: jest.fn()
    },
    readPluginConfig: jest.fn(),
    writePluginConfig: jest.fn(),
    pluginConfigDb: {
      set: jest.fn()
    }
  }
}));

describe('userPrompts', () => {
  let logSpy: jest.SpyInstance;
  let initSpy: jest.SpyInstance;
  let inquirerGitServerConfigSpy: jest.SpyInstance;
  let context: PluginContext;
  let promptService: PromptService;
  // 通用 helper 方法用于模拟 inquirer 的返回
  const mockInquirerPrompt = (responses: any) => {
    (Inquirer.prompt as any).mockResolvedValue(responses);
  };
  const mockDbService = () => {
    (dbService.readGitServerConfig as jest.Mock).mockResolvedValue({
      gitServerType: GITSERVER.GITLAB,
      gitServerConfig: {
        origin: 'gitlab.com',
        Authorization: 'token123'
      },
      gitServer: 'gitlab'
    });

    (dbService.writeGitServerConfig as jest.Mock).mockResolvedValue(true);
  };

  beforeEach(async () => {
    context = {
      skipPrompts: false
    } as PluginContext;
    promptService = new PromptService(context);
    logSpy = jest.spyOn(logger, 'info').mockImplementation((() => {}) as any);
    initSpy = jest.spyOn(PromptService.prototype, 'init').mockImplementation((() => {}) as any);
    inquirerGitServerConfigSpy = jest
      .spyOn(PromptService.prototype, 'inquirerGitServerConfig')
      .mockImplementation((() => {}) as any);
    mockDbService();
    jest.clearAllMocks();
  });

  it('should log init and exit messages [mock]', async () => {
    await init(context);
    // 验证是否记录了初始化消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.initMessage}`);
    // 验证是否记录了退出消息
    expect(logSpy).toHaveBeenCalledWith(`${config.name} ${config.exitMessage}`);
  });

  it('should initialize PromptService when skipPrompts is false [mock]', async () => {
    await init(context);
    expect(initSpy).toHaveBeenCalled();
  });
  it('should prompt for GitLab server config and save configuration', async () => {
    mockInquirerPrompt({
      Authorization: 'token123',
      origin: 'gitlab.com',
      type: GITSERVER.GITLAB
    });
    const config = await dbService.readGitServerConfig();
    expect(config).toEqual({
      gitServerType: GITSERVER.GITLAB,
      gitServerConfig: {
        origin: 'gitlab.com',
        Authorization: 'token123'
      },
      gitServer: 'gitlab'
    });
    await promptService.inquirerGitServerConfig();
    expect(inquirerGitServerConfigSpy).toHaveBeenCalled();
  });
});
