import path from 'path';
import { copy, logger, readPluginConfig } from '../utils';
import { PluginContext, resourcePath } from '../shared';
import Inquirer from 'inquirer';
import { ServerService, SetUpService } from '.';
class EslintReportService {
  setUpService: SetUpService;
  targetDir: string;
  serverService: ServerService;
  staticPath: string = 'eslint';
  reportPath: string = 'eslint-report';
  constructor(context: PluginContext) {
    this.targetDir = context.targetDir;
    this.setUpService = new SetUpService(context.targetDir);
    this.serverService = new ServerService(context, {
      staticPath: this.staticPath,
      reportPath: this.reportPath
    });
  }
  async copyEslintConfig() {
    const originPath = path.resolve(resourcePath, 'extensions/eslint');
    await copy(originPath, this.targetDir);
  }
  async installEslintDependencies() {
    const { eslintPkgs } = await readPluginConfig();
    const command = ['add', ...eslintPkgs, '-D'];
    await this.setUpService.exec('yarn', [...command], `Install ${this.staticPath} dependencies `);
  }
  async generatorInnerReport() {
    const { eslintArgs } = await readPluginConfig();
    await this.setUpService.exec(this.staticPath, eslintArgs, `generator ${this.staticPath} report json`);
  }
  async generatorCustomReport() {
    const { eslintArgs } = await readPluginConfig();
    await this.setUpService.exec('yarn', [this.staticPath, ...eslintArgs], `generator ${this.staticPath} report json`);
  }
  async initEslintPlugin() {
    // 1. yarn 会出现node版本 以及安装不了插件的问题
    // 2. npm 可以然而需要很多交互命令选择
    const { eslintPlugins } = await readPluginConfig();
    const { chooseEslintPlugin } = await Inquirer.prompt([
      {
        name: 'chooseEslintPlugin',
        type: 'list',
        choices: eslintPlugins,
        default: eslintPlugins[0],
        message: 'please choose a initial eslint config:'
      }
    ] as any);
    logger.info(`choose ${chooseEslintPlugin}`);

    await this.setUpService.exec('npm', ['init', `${chooseEslintPlugin}`], `npm init ${chooseEslintPlugin}`);
  }
  async setUpEslintGlobalPkg() {
    const { eslintPkgs } = await readPluginConfig();
    await Promise.all(eslintPkgs.map((pkg) => this.setUpService.ensurePkgInstalledGlobal(pkg)));
  }
  async initInnerEslint() {
    await this.copyEslintConfig();
    await this.setUpEslintGlobalPkg();
    await this.serverService.copyServerStaticHtml();
    await this.generatorInnerReport();
    await this.serverService.startServer();
  }
  async initCustomEslint() {
    await this.initEslintPlugin();
    await this.serverService.copyServerStaticHtml();
    await this.generatorCustomReport();
    await this.serverService.startServer();
  }
}

export default EslintReportService;
