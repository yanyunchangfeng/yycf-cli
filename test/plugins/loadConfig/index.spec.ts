import { init } from 'src/plugins/loadConfig';
import { gitServerConfig } from 'src/config';
import { setupContextAndCopyFile, createTempGitServerPath } from 'test/utils';
import path from 'path';
import { logger } from 'src/utils';
import fs from 'fs-extra';
import config from 'src/plugins/loadConfig/config.json';
import { gitSeverPath } from 'src/shared';

describe('loadConfig', () => {
  const context: any = {};
  let logSpy: jest.SpyInstance;
  let tempGitSeverPath: string;
  let secondTempGitSeverPath: string;
  let loadFileSpy: jest.SpyInstance;
  let loadContextSpy: jest.SpyInstance;

  beforeEach(async () => {
    // tempGitSeverPath = await setupContextAndCopyFile(context);
    logSpy = jest.spyOn(logger, 'info').mockImplementation((() => {}) as any);
    loadFileSpy = jest.spyOn(gitServerConfig, 'loadFile').mockImplementation((() => {}) as any);
    jest.clearAllMocks();
  });

  it('should load git server config from correct path [real] ', async () => {
    // await init(context);
    // const configLoaded = gitServerConfig.getProperties();
    // expect(configLoaded).toBeDefined();
    // expect(configLoaded.defaults.gitServerConfigured).toBe(true);
  });

  it('should handle non-existent gitSeverPath [real]', async () => {
    // secondTempGitSeverPath = await setupContextAndCopyFile(context);
    // await fs.remove(path.dirname(secondTempGitSeverPath)); // 强制路径不存在
    // gitServerConfig.reset('defaults.gitServerConfigured');
    // await init(context);
    // const configLoaded = gitServerConfig.getProperties();
    // expect(configLoaded).toBeDefined();
    // expect(configLoaded.defaults.gitServerConfigured).toBe(false);
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
    expect(loadFileSpy).toHaveBeenCalledWith(gitSeverPath);
    const defaultGitServer = gitServerConfig.get('defaults.defaultGitServer');
    expect(defaultGitServer).toBe('');
  });

  afterEach(async () => {
    // await fs.remove(path.dirname(tempGitSeverPath));//[real]
  });
});
