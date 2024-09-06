import { init as clearLogs } from 'src/plugins/clearLogs';
import { init as initLogs } from 'src/plugins/initLogs';
import { init as clearCacheRepository } from 'src/plugins/clearCacheRepository';
import { init as loadConfig } from 'src/plugins/loadConfig';
import { init as userPrompts } from 'src/plugins/userPrompts';
import { init as createProject } from 'src/plugins/createProject';
import { init as cacheRepository } from 'src/plugins/cacheRepository';
import { init as downloadRepository } from 'src/plugins/downloadRepository';
import { init as writePkg } from 'src/plugins/writePkg';
import { init as initGit } from 'src/plugins/initGit';
import { init as madgeReport } from 'src/plugins/madgeReport';
import { init as innerEslintReport } from 'src/plugins/innerEslintReport';
import { init as jscpdReport } from 'src/plugins/jscpdReport';
import { init as platoReport } from 'src/plugins/platoReport';
import { init as installDependencies } from 'src/plugins/installDependencies';
import { setupContextAndCopyFile, uniqueId, createTempPath, tempDir } from 'test/utils';
import { PluginContext } from 'src/shared';
import {
  CacheRepositoryService,
  dbService,
  PromptService,
  DownLoadService,
  JsCpdService,
  SetUpService,
  ServerService
} from 'src/services';
import { logger } from 'src/utils';
import fs from 'fs-extra';
import path from 'path';

describe('Main Workflow', () => {
  let logDir: string;
  let cacheDir: string;
  let tempGitServerPath: string;
  let context: PluginContext;
  let targetDir: string;

  beforeEach(async () => {
    await fs.remove(tempDir);
    context = {} as PluginContext;
    logDir = createTempPath('logs');
    context.logPath = logDir;
    context.cacheDirName = uniqueId('test-cache-repos');
    cacheDir = new CacheRepositoryService(context).cacheDir;
    tempGitServerPath = await setupContextAndCopyFile(context);
    targetDir = createTempPath('projects');
    context.targetDir = targetDir;
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
    const configLoaded = await dbService.readGitServerConfigAll();
    expect(configLoaded).toBeDefined();
    expect(configLoaded.defaults.gitServerConfigured).toBe(true);
    context.skipPrompts = true;
    let promptInitCalled = false;
    const promptInit = PromptService.prototype.init;
    PromptService.prototype.init = async function () {
      promptInitCalled = true;
      await promptInit.call(this);
    };
    await userPrompts(context);
    expect(promptInitCalled).toBe(false);
    context.all = true;
    await createProject(context);
    logger.info(`createProject after context: ${JSON.stringify(context)}`);
    expect(context.repos).toBeDefined();
    await cacheRepository(context);
    logger.info(`cacheRepository after context: ${JSON.stringify(context)}`);
    expect(context.destDirs).toBeDefined();
    let downloadInitCalled = false;
    const downloadInit = DownLoadService.prototype.init;
    DownLoadService.prototype.init = async function () {
      downloadInitCalled = true;
      await downloadInit.call(this);
    };
    await downloadRepository(context);
    expect(downloadInitCalled).toBe(true);
    await writePkg(context);
    await initGit(context);

    // 编译目标ts文件
    const startServer = ServerService.prototype.startServer;
    ServerService.prototype.startServer = async function () {
      const setUpService = new SetUpService(this.context.targetDir);
      const tsFile = path.join(this.context.targetDir, this.ServerParams.reportPath, 'index.ts');
      await setUpService.exec('tsc', [tsFile, '--target', 'es6', '--module', 'esnext'], 'complile ts files');
      await startServer.call(this);
    };

    await madgeReport(context);

    let jscpdInitCalled = false;
    const jscpdInit = JsCpdService.prototype.init;
    JsCpdService.prototype.init = async function () {
      jscpdInitCalled = true;
      await jscpdInit.call(this);
    };
    await jscpdReport(context);
    expect(jscpdInitCalled).toBe(true);
    // await innerEslintReport(context);
    // await installDependencies(context);
    // await platoReport(context);
  });

  afterEach(async () => {
    fs.remove(cacheDir);
  });
});
