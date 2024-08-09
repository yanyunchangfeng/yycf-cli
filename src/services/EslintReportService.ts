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
    const originPath = path.resolve(__dirname, '../resources/extensions/eslint/eslint.config.mjs');
    const targetPath = path.join(this.targetDir, 'eslint.config.mjs');
    await copy(originPath, targetPath);
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
    const originPath = path.resolve(__dirname, '../resources/public/local/index.html');
    const targetPath = path.join(this.targetDir, 'index.html');
    await copy(originPath, targetPath);
  }
  async addEslintPlugin() {
    // yarn 会出现node版本 以及安装不了插件的问题
    const { eslintPlugin } = await readPluginConfig();
    await this.setUpService.exec('npm', ['init', ...eslintPlugin], 'npm init eslint plugin');
  }
  async init() {
    // await this.copyEslintConfig();
    // await this.installEslintDependencies();
    await this.addEslintPlugin();
    await this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await stopServer();
    await startServer(this.targetDir);
  }
}

export default EslintReportService;
