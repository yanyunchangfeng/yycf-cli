import dbService from 'src/services/DBService';
import { pluginConfig, gitServerConfig } from 'src/config';
import { writeFile } from 'src/utils';
import fs from 'fs-extra';
import { GITSERVER, PluginContext } from 'src/shared';

jest.mock('src/config', () => ({
  pluginConfig: {
    getProperties: jest.fn(),
    set: jest.fn()
  },
  gitServerConfig: {
    getProperties: jest.fn(),
    get: jest.fn(),
    loadFile: jest.fn()
  }
}));

jest.mock('src/utils', () => ({
  writeFile: jest.fn()
}));

jest.mock('fs-extra', () => ({
  existsSync: jest.fn()
}));

describe('DBService', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // 在每个测试前清除之前的mock状态，防止相互影响
  });

  describe('setSinglePluginEnabled', () => {
    it('should enable the specified plugin if it exists', async () => {
      const mockPluginConfig = {
        plugins: [
          { name: 'plugin1', enabled: false },
          { name: 'plugin2', enabled: false }
        ]
      } as any;

      (pluginConfig.getProperties as jest.Mock).mockReturnValue(mockPluginConfig);
      await dbService.setSinglePluginEnabled('plugin1');

      expect(pluginConfig.set).toHaveBeenCalledWith('plugins', [
        { name: 'plugin1', enabled: true },
        { name: 'plugin2', enabled: false }
      ]);
      expect(writeFile).toHaveBeenCalledWith(expect.any(String), mockPluginConfig, true);
    });

    it('should not modify config if the specified plugin does not exist', async () => {
      const mockPluginConfig = {
        plugins: [
          { name: 'plugin1', enabled: false },
          { name: 'plugin2', enabled: false }
        ]
      };
      (pluginConfig.getProperties as jest.Mock).mockReturnValue(mockPluginConfig);

      await dbService.setSinglePluginEnabled('nonExistingPlugin');

      expect(pluginConfig.set).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should handle an empty plugins list gracefully', async () => {
      const mockPluginConfig = { plugins: [] };
      (pluginConfig.getProperties as jest.Mock).mockReturnValue(mockPluginConfig);

      await dbService.setSinglePluginEnabled('plugin1');

      expect(pluginConfig.set).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('readPluginConfig', () => {
    it('should return the plugin config', async () => {
      const mockConfig = { plugins: [{ name: 'plugin1', enabled: true }] };
      (pluginConfig.getProperties as jest.Mock).mockReturnValue(mockConfig);

      const result = await dbService.readPluginConfig();

      expect(result).toEqual(mockConfig);
      expect(pluginConfig.getProperties).toHaveBeenCalled();
    });
  });

  describe('writePluginConfig', () => {
    it('should write the plugin config to the correct path', async () => {
      const mockConfig = { plugins: [{ name: 'plugin1', enabled: true }] };
      (pluginConfig.getProperties as jest.Mock).mockReturnValue(mockConfig);

      await dbService.writePluginConfig();

      expect(writeFile).toHaveBeenCalledWith(expect.any(String), mockConfig, true);
    });
  });

  describe('readGitServerConfig', () => {
    it('should return the correct git server config', async () => {
      (gitServerConfig.get as jest.Mock)
        .mockReturnValueOnce('defaultGitServer')
        .mockReturnValueOnce({
          defaultGitServer: {
            orgs: 'someOrg',
            user: 'someUser',
            origin: 'someOrigin',
            Authorization: 'someAuth',
            type: GITSERVER.GITHUB
          }
        })
        .mockReturnValueOnce({
          orgs: 'someOrg',
          user: 'someUser',
          origin: 'someOrigin',
          Authorization: 'someAuth',
          type: GITSERVER.GITHUB
        });

      const result = await dbService.readGitServerConfig();

      expect(result).toEqual({
        gitServer: 'defaultGitServer',
        gitServerConfig: {
          orgs: 'someOrg',
          user: 'someUser',
          origin: 'someOrigin',
          Authorization: 'someAuth',
          type: GITSERVER.GITHUB
        },
        gitServerList: ['defaultGitServer'],
        orgs: 'someOrg',
        user: 'someUser',
        origin: 'someOrigin',
        Authorization: 'someAuth',
        gitServerType: GITSERVER.GITHUB
      });
    });
  });

  describe('writeGitServerConfig', () => {
    it('should write git server config to the specified path when context is provided', async () => {
      const mockConfig = { some: 'gitServerData' };
      (gitServerConfig.getProperties as jest.Mock).mockReturnValue(mockConfig);
      const context = { gitServerPath: 'customPath' } as PluginContext;

      await dbService.writeGitServerConfig(context);

      expect(writeFile).toHaveBeenCalledWith('customPath', mockConfig, true);
    });

    it('should write git server config to the default path when no context is provided', async () => {
      const mockConfig = { some: 'gitServerData' };
      (gitServerConfig.getProperties as jest.Mock).mockReturnValue(mockConfig);

      await dbService.writeGitServerConfig();

      expect(writeFile).toHaveBeenCalledWith(expect.any(String), mockConfig, true);
    });
  });

  describe('readGitServerConfigAll', () => {
    it('should return all git server configurations', async () => {
      const mockConfig = { gitServers: { server1: {}, server2: {} } };
      (gitServerConfig.getProperties as jest.Mock).mockReturnValue(mockConfig);

      const result = await dbService.readGitServerConfigAll();

      expect(result).toEqual(mockConfig);
      expect(gitServerConfig.getProperties).toHaveBeenCalled();
    });
  });

  describe('init', () => {
    it('should load git server config if file exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      const context = { gitServerPath: 'somePath' } as PluginContext;

      await dbService.init(context);

      expect(gitServerConfig.loadFile).toHaveBeenCalledWith('somePath');
    });

    it('should not load git server config if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const context = { gitServerPath: 'somePath' } as PluginContext;

      await dbService.init(context);

      expect(gitServerConfig.loadFile).not.toHaveBeenCalled();
    });
  });
});
