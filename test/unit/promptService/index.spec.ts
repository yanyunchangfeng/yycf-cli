import Inquirer from 'inquirer';
import { logger } from 'src/utils';
import { GITSERVER, PluginContext } from 'src/shared';
import { dbService, PromptService } from 'src/services';

jest.mock('src/services/DBService');
jest.mock('inquirer');

describe('PromptService', () => {
  let promptService: PromptService;
  let dbServiceReadGitServerConfigSpy: jest.SpyInstance;
  let dbServiceWriteGitServerConfigSpy: jest.SpyInstance;
  let dbServiceGitServerConfigSetSpy: jest.SpyInstance;
  let inquirerSpy: jest.SpyInstance;

  beforeEach(() => {
    // 创建一个新的 PluginContext，并实例化 PromptService
    const context: PluginContext = {} as any;
    promptService = new PromptService(context);
    inquirerSpy = jest.spyOn(Inquirer, 'prompt');
    dbServiceReadGitServerConfigSpy = jest.spyOn(dbService, 'readGitServerConfig');
    dbServiceWriteGitServerConfigSpy = jest.spyOn(dbService, 'writeGitServerConfig');
    dbServiceGitServerConfigSetSpy = jest.spyOn(dbService.gitServerConfigDb, 'set');
    // 清理所有的 jest mocks
    jest.clearAllMocks();
  });

  it('should configure and write git server config for GitHub with valid inputs', async () => {
    // Mock dbService.readGitServerConfig to return sample data
    dbServiceReadGitServerConfigSpy.mockResolvedValue({
      gitServerType: GITSERVER.GITHUB,
      gitServerConfig: { origin: 'https://github.com', Authorization: 'token' },
      gitServer: 'github',
      gitServerList: ['github'], // 包含 gitServerList
      orgs: 'my-org',
      user: 'my-user',
      origin: 'https://github.com',
      Authorization: 'token'
    });

    // Mock Inquirer.prompt to simulate user input
    inquirerSpy
      .mockResolvedValueOnce({ origin: 'https://github.com', Authorization: 'token', type: GITSERVER.GITHUB })
      .mockResolvedValueOnce({ orgs: 'my-org', user: 'my-user' });

    // Mock dbService.gitServerConfigDb.set and writeGitServerConfig
    dbServiceWriteGitServerConfigSpy.mockResolvedValue(undefined);

    await promptService.inquirerGitServerConfig();

    // 验证是否调用了 dbService.gitServerConfigDb.set 和 writeGitServerConfig
    expect(dbServiceGitServerConfigSetSpy).toHaveBeenCalledWith('gitServers.github', {
      origin: 'https://github.com',
      Authorization: 'token',
      type: GITSERVER.GITHUB,
      orgs: 'my-org',
      user: 'my-user'
    });
    expect(dbServiceWriteGitServerConfigSpy).toHaveBeenCalled();
  });

  it('should configure and write git server config for non-GitHub server', async () => {
    // Mock dbService.readGitServerConfig to return sample data
    dbServiceReadGitServerConfigSpy.mockResolvedValue({
      gitServerType: GITSERVER.GITLAB,
      gitServerConfig: { origin: 'https://gitlab.com', Authorization: 'token' },
      gitServer: 'gitlab',
      gitServerList: ['gitlab'],
      orgs: '',
      user: '',
      origin: 'https://gitlab.com',
      Authorization: 'token'
    });

    // Mock Inquirer.prompt to simulate user input
    inquirerSpy.mockResolvedValueOnce({ origin: 'https://gitlab.com', Authorization: 'token', type: GITSERVER.GITLAB });

    // Mock dbService.gitServerConfigDb.set and writeGitServerConfig
    // const mockSet = jest.spyOn(dbService.gitServerConfigDb, 'set');
    dbServiceWriteGitServerConfigSpy.mockResolvedValue(undefined);

    await promptService.inquirerGitServerConfig();

    // 验证是否调用了 dbService.gitServerConfigDb.set 和 writeGitServerConfig
    expect(dbServiceGitServerConfigSetSpy).toHaveBeenCalledWith('gitServers.gitlab', {
      origin: 'https://gitlab.com',
      Authorization: 'token',
      type: GITSERVER.GITLAB
    });
    expect(dbServiceWriteGitServerConfigSpy).toHaveBeenCalled();
  });

  it('should not configure git server if required inputs are missing', async () => {
    // Mock dbService.readGitServerConfig to return sample data
    dbServiceReadGitServerConfigSpy.mockResolvedValue({
      gitServerType: GITSERVER.GITHUB,
      gitServerConfig: { origin: 'https://github.com', Authorization: 'token' },
      gitServer: 'github'
    } as any);

    // Simulate missing inputs for origin, Authorization, orgs, or user
    inquirerSpy.mockResolvedValueOnce({ origin: '', Authorization: '', type: GITSERVER.GITHUB }); // Invalid data
    inquirerSpy.mockResolvedValueOnce({ orgs: '', user: '' }); // Invalid data

    // Mock dbService.gitServerConfigDb.set and writeGitServerConfig
    dbServiceWriteGitServerConfigSpy.mockResolvedValue(undefined);

    await promptService.inquirerGitServerConfig();

    // 验证是否未调用 set 和 write 方法，因为输入无效
    expect(dbServiceGitServerConfigSetSpy).not.toHaveBeenCalled();
    expect(dbServiceWriteGitServerConfigSpy).not.toHaveBeenCalled();
  });

  it('should handle deleting a git server', async () => {
    // Mock dbService.readGitServerConfig to return sample data
    dbServiceReadGitServerConfigSpy.mockResolvedValue({
      gitServerList: ['github', 'gitlab'],
      gitServer: 'github'
    } as any);

    // Mock dbService.readGitServerConfigAll to return all git servers
    jest.spyOn(dbService, 'readGitServerConfigAll').mockResolvedValue({
      gitServers: {
        github: {
          origin: 'https://github.com',
          Authorization: 'token',
          type: GITSERVER.GITHUB
        },
        gitlab: {
          origin: 'https://gitlab.com',
          Authorization: 'token',
          type: GITSERVER.GITLAB
        }
      }
    } as any);

    // Mock Inquirer.prompt for choosing and confirming delete
    inquirerSpy
      .mockResolvedValueOnce({ gitServer: 'github' }) // Simulate choosing 'github'
      .mockResolvedValueOnce({ confirmDelete: true }); // Simulate confirming deletion

    dbServiceWriteGitServerConfigSpy.mockResolvedValue(undefined);

    // Act: Call the method we want to test
    await promptService.inquireDeleteGitServer();

    // Assert: Ensure 'github' is deleted from the config
    expect(dbServiceGitServerConfigSetSpy).toHaveBeenCalledWith('gitServers', {
      gitlab: {
        origin: 'https://gitlab.com',
        Authorization: 'token',
        type: GITSERVER.GITLAB
      }
    });

    // If 'github' was the default, ensure defaultGitServer is reset
    expect(dbServiceGitServerConfigSetSpy).toHaveBeenCalledWith('defaults.defaultGitServer', '');
    expect(dbServiceWriteGitServerConfigSpy).toHaveBeenCalled();
  });

  it('should not delete the last git server', async () => {
    // Mock dbService.readGitServerConfig to return sample data
    dbServiceReadGitServerConfigSpy.mockResolvedValue({
      gitServerType: GITSERVER.GITHUB,
      gitServerConfig: { origin: 'https://github.com', Authorization: 'token' },
      gitServer: 'github',
      gitServerList: ['github'], // 只有一个 git server
      orgs: 'my-org',
      user: 'my-user',
      origin: 'https://github.com',
      Authorization: 'token'
    });

    // Simulate user selecting a git server to delete and confirming deletion
    inquirerSpy.mockResolvedValueOnce({ gitServer: 'github' }).mockResolvedValueOnce({ confirmDelete: true });

    // Mock logger to warn that last git server can't be deleted
    const mockWarn = jest.spyOn(logger, 'warn');

    await promptService.inquireDeleteGitServer();

    // 验证是否记录了警告
    expect(mockWarn).toHaveBeenCalledWith('can not delete the last git server');
  });

  // 测试插件启用/禁用的逻辑
  it('should enable or disable plugins based on user input', async () => {
    jest.spyOn(dbService, 'readPluginConfig').mockResolvedValue({
      plugins: [
        { name: 'pluginA', enabled: true },
        { name: 'pluginB', enabled: false }
      ],
      requiredPlugins: ['pluginA'],
      disabledPlugins: []
    } as any);

    inquirerSpy.mockResolvedValueOnce({ choosePlugins: ['pluginA'] });

    const mockSet = jest.spyOn(dbService.pluginConfigDb, 'set');
    const mockWrite = jest.spyOn(dbService, 'writePluginConfig').mockResolvedValue(undefined);

    await promptService.inquirerChoosePluginsEnabled();

    expect(mockSet).toHaveBeenCalledWith('plugins', [
      { name: 'pluginA', enabled: true }, // 必须启用
      { name: 'pluginB', enabled: false }
    ]);
    expect(mockWrite).toHaveBeenCalled();
  });

  // 测试新增 git server 流程
  it('should add a new git server with valid inputs', async () => {
    dbServiceReadGitServerConfigSpy.mockResolvedValue({ gitServerList: [] } as any);

    inquirerSpy
      .mockResolvedValueOnce({ gitServer: 'bitbucket' })
      .mockResolvedValueOnce({
        origin: 'https://bitbucket.org',
        Authorization: 'token',
        type: GITSERVER.GITHUB,
        orgs: '',
        user: ''
      })
      .mockResolvedValueOnce({ org: '', user: '' });

    dbServiceWriteGitServerConfigSpy.mockResolvedValue(undefined);

    await promptService.inquirerNewGitServer();

    expect(dbServiceGitServerConfigSetSpy).toHaveBeenCalledWith('gitServers.bitbucket', {
      origin: 'https://bitbucket.org',
      Authorization: 'token',
      type: GITSERVER.GITHUB,
      orgs: '',
      user: ''
    });
    expect(dbServiceWriteGitServerConfigSpy).toHaveBeenCalled();
  });

  it('should call inquirerChooseGitServer when "chooseGitServer" is selected', async () => {
    // 模拟用户选择 "chooseGitServer"
    inquirerSpy.mockResolvedValueOnce({ option: 'chooseGitServer' });
    const chooseGitServerSpy = jest.spyOn(promptService, 'inquirerChooseGitServer').mockResolvedValueOnce(undefined);

    // 模拟 gitServerConfigured 仍然为 false
    jest.spyOn(dbService.gitServerConfigDb, 'get').mockReturnValueOnce(false);
    const gitServerConfigSpy = jest.spyOn(promptService, 'inquirerGitServerConfig').mockResolvedValueOnce(undefined);

    await promptService.promptUserOption();

    expect(chooseGitServerSpy).toHaveBeenCalled();
    expect(gitServerConfigSpy).toHaveBeenCalled(); // 因为 gitServerConfigured 为 false
  });
});
