import { init } from 'src/plugins/loadConfig';
import { gitServerConfig } from 'src/config';
import { setupContextAndCopyFile } from 'test/utils';
import path from 'path';
import fs from 'fs-extra';

describe('loadConfig', () => {
  const context: any = {};
  let tempGitSeverPath: string;
  let secondTempGitSeverPath: string;

  beforeEach(async () => {
    tempGitSeverPath = await setupContextAndCopyFile(context);
  });

  it('should load git server config from correct path', async () => {
    await init(context);
    const configLoaded = gitServerConfig.getProperties();
    expect(configLoaded).toBeDefined();
    expect(configLoaded.defaults.gitServerConfigured).toBe(true);
  });

  it('should handle non-existent gitSeverPath', async () => {
    secondTempGitSeverPath = await setupContextAndCopyFile(context);
    await fs.remove(path.dirname(secondTempGitSeverPath)); // 强制路径不存在
    gitServerConfig.reset('defaults.gitServerConfigured');
    await init(context);
    const configLoaded = gitServerConfig.getProperties();
    expect(configLoaded).toBeDefined();
    expect(configLoaded.defaults.gitServerConfigured).toBe(false);
  });

  afterEach(async () => {
    await fs.remove(path.dirname(tempGitSeverPath));
  });
});
