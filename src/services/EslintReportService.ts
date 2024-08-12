import path from 'path';
import { copy, logger, readPluginConfig } from '../utils';
import SetUpService from './SetUpService';
import { startEslintServer } from '../server';
import { PluginContext } from '../shared';
import Inquirer from 'inquirer';
class EslintReportService {
  setUpService: SetUpService;
  targetDir: string;
  constructor(context: PluginContext) {
    this.targetDir = context.targetDir;
    this.setUpService = new SetUpService(context.targetDir);
  }
  async copyEslintConfig() {
    const originPath = path.resolve(__dirname, '../resources/extensions/eslint');
    await copy(originPath, this.targetDir);
  }
  async installEslintDependencies() {
    const { eslintPkgs } = await readPluginConfig();
    const command = ['add', ...eslintPkgs, '-D'];
    await this.setUpService.exec('yarn', [...command], 'Installing eslint dependencies ');
  }
  async genertingReportHtml() {
    await this.setUpService.exec(
      'yarn',
      ['eslint -f html -o ./report/index.html || true'],
      'generating eslint reporter html'
    );
  }
  async generatorReportJson() {
    await this.setUpService.exec(
      'yarn',
      ['eslint -f json -o eslint-report.json || true'],
      'generating eslint reporter json'
    );
  }
  async copyLocalStaticHtml() {
    const originPath = path.resolve(__dirname, '../resources/public/local/eslint');
    await copy(originPath, this.targetDir);
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
  async initInnerEslint() {
    await this.copyEslintConfig();
    await this.installEslintDependencies();
    this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await startEslintServer(this.targetDir);
  }
  async initCustomEslint() {
    await this.initEslintPlugin();
    this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await startEslintServer(this.targetDir);
  }
}

export default EslintReportService;
