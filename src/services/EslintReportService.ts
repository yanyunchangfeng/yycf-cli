import path from 'path';
import { copy, readPluginConfig } from '../utils';
import SetUpService from './SetUpService';
import { startServer, stopServer } from '../server';
import { PluginContext } from '../shared';

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
    const originPath = path.resolve(__dirname, '../resources/public/local');
    await copy(originPath, this.targetDir);
  }
  async addEslintPlugin() {
    // 1. yarn 会出现node版本 以及安装不了插件的问题
    // 2. npm 可以然而需要很多交互命令选择
    const { eslintPlugin } = await readPluginConfig();
    await this.setUpService.exec('npm', ['init', ...eslintPlugin], 'npm init eslint plugin');
  }
  async init() {
    await this.copyEslintConfig();
    await this.installEslintDependencies();
    // await this.addEslintPlugin();
    await this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await stopServer();
    await startServer(this.targetDir);
  }
}

export default EslintReportService;
