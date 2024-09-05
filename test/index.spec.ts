import { init as clearLogs } from 'src/plugins/clearLogs';
import { init as initLogs } from 'src/plugins/initLogs';
import { init as clearCacheRepository } from 'src/plugins/clearCacheRepository';
import { init as loadConfig } from 'src/plugins/loadConfig';
import { init as userPrompts } from 'src/plugins/userPrompts';
import { init as createProject } from 'src/plugins/createProject';
import { setupContextAndCopyFile } from 'test/utils';
import { logPath, PluginContext } from 'src/shared';
import { CacheRepositoryService } from 'src/services';
import { gitServerConfig } from 'src/config';
import fs from 'fs-extra';
import path from 'path';

describe('Main Workflow', () => {
  let logDir: string;
  let cacheDir: string;
  let tempGitSeverPath: string;
  let context: PluginContext;

  beforeEach(async () => {
    context = {} as PluginContext;
    logDir = path.join(logPath, `log-${Date.now()}-${Math.random()}`);
    context.logPath = logDir;
    context.cacheDirName = `cache-${Date.now()}-${Math.random()}`;
    context.targetDir = path.join(process.cwd());
    cacheDir = new CacheRepositoryService(context).cacheDir;
    tempGitSeverPath = await setupContextAndCopyFile(context);
    await fs.ensureDir(logDir);
    await fs.ensureDir(cacheDir);
  });

  it('should execute the full workflow correctly', async () => {
    await clearLogs(context);
    expect(fs.existsSync(logDir)).toBe(false);
    await initLogs(context);
    expect(fs.existsSync(logDir)).toBe(true);
    await clearCacheRepository(context);
    expect(fs.existsSync(cacheDir)).toBe(false);
    await loadConfig(context);
    const configLoaded = gitServerConfig.getProperties();
    expect(configLoaded).toBeDefined();
    expect(configLoaded.defaults.gitServerConfigured).toBe(true);
  });

  afterEach(async () => {
    await fs.remove(logDir);
    await fs.remove(cacheDir);
    await fs.remove(path.dirname(tempGitSeverPath));
  });
});
