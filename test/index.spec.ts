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
import { setupContextAndCopyFile, uniqueId, createTempPath } from 'test/utils';
import { tempDir, resourcePublicServerPath } from 'test/shared';
import { PluginContext } from 'src/shared';
import {
  CacheRepositoryService,
  dbService,
  PromptService,
  DownLoadService,
  JsCpdService,
  ServerService,
  MadgeReportService,
  EslintReportService,
  PlatoReportService,
  InstallDependencies
} from 'src/services';
import { copy, logger } from 'src/utils';
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

    // 下载所有 无需写入package.json
    await writePkg(context);

    await initGit(context);
    const gitPath = path.join(context.targetDir, context.repos[0].name, '.git');
    expect(fs.existsSync(gitPath)).toBe(true);

    let madgeInitCalled = false;
    const madgeInit = MadgeReportService.prototype.init;
    MadgeReportService.prototype.init = async function () {
      madgeInitCalled = true;
      await madgeInit.call(this);
    };
    await madgeReport(context);
    expect(madgeInitCalled).toBe(true);

    const startServer = ServerService.prototype.startServer;
    ServerService.prototype.startServer = async function () {
      const originJsPath = path.join(resourcePublicServerPath, this.ServerParams.staticPath, 'index.js');
      const targetJsPath = path.join(this.context.targetDir, this.ServerParams.reportPath, 'index.js');
      copy(originJsPath, targetJsPath);
      await startServer.call(this);
    };

    let jscpdInitCalled = false;
    const jscpdInit = JsCpdService.prototype.init;
    JsCpdService.prototype.init = async function () {
      jscpdInitCalled = true;
      await jscpdInit.call(this);
    };
    await jscpdReport(context);
    expect(jscpdInitCalled).toBe(true);

    let innerEslintInitCalled = false;
    const innerEslintInit = EslintReportService.prototype.initInnerEslint;
    EslintReportService.prototype.initInnerEslint = async function () {
      innerEslintInitCalled = true;
      await innerEslintInit.call(this);
    };
    await innerEslintReport(context);
    expect(innerEslintInitCalled).toBe(true);

    let installInitCalled = false;
    const installInit = InstallDependencies.prototype.init;
    InstallDependencies.prototype.init = async function () {
      installInitCalled = true;
      await installInit.call(this);
    };
    await installDependencies(context);
    expect(installInitCalled).toBe(true);

    let platoInitCalled = false;
    const platoInit = PlatoReportService.prototype.init;
    PlatoReportService.prototype.init = async function () {
      platoInitCalled = true;
      await platoInit.call(this);
    };

    await platoReport(context);
    expect(platoInitCalled).toBe(true);
  });

  afterEach(async () => {
    fs.remove(cacheDir);
  });
});
