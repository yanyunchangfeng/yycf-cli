import path from 'path';
import { copy, readPluginConfig } from '../utils';
import SetUpService from './SetUpService';
import { startServer, stopServer } from '../server';

class EslintReportService {
  setUpService: SetUpService;
  targetDir: string;
  constructor(targetDir: string) {
    this.targetDir = targetDir;
    this.setUpService = new SetUpService(targetDir);
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
  async addEslintStandPlugin() {
    await this.setUpService.exec(
      'yarn',
      ['init', '@eslint/config@latest', '--config', 'eslint-config-standard'],
      'init eslint-config-standard'
    );
  }
  async generatorEslintReport() {
    await this.copyEslintConfig();
    await this.installEslintDependencies();
    // await this.addEslintStandPlugin();
    await this.genertingReportHtml();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await stopServer();
    await startServer(this.targetDir);
  }
}

export default EslintReportService;
