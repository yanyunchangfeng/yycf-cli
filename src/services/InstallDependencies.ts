import SetUpService from './SetUpService';
import { PluginContext, Repo } from '../shared';
import fs from 'fs-extra';
import path from 'path';
class InstallDependencies {
  setUpService: SetUpService;
  repo: Repo;
  context: PluginContext;
  packageManager: 'npm' | 'yarn' | 'pnpm' = 'pnpm';
  constructor(context: PluginContext, repo: Repo) {
    this.repo = repo;
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
  }
  detectPackageManager() {
    if (fs.existsSync(path.join(this.context.targetDir, 'package-lock.json'))) {
      return 'npm';
    }
    if (fs.existsSync(path.join(this.context.targetDir, 'yarn.lock'))) {
      return 'yarn';
    }
    if (fs.existsSync(path.join(this.context.targetDir, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    return 'pnpm';
  }
  async install() {
    this.packageManager = this.detectPackageManager();
    await this.setUpService.setup(this.packageManager);
    await this.setUpService.exec(
      this.packageManager,
      ['install', '||', 'true'],
      `Install ${this.repo.name} dependencies`
    );
  }
  async buildResource() {
    await this.setUpService.exec(this.packageManager, ['build', '||', 'true'], `Build ${this.repo.name} resource`);
  }
  async build() {
    await this.install();
    await this.buildResource();
  }
  async init() {
    await this.install();
  }
}

export default InstallDependencies;
