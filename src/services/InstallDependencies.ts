import SetUpService from './SetUpService';
import { PluginContext, Repo } from '../shared';
class InstallDependencies {
  setUpService: SetUpService;
  repo: Repo;
  constructor(context: PluginContext, repo: Repo) {
    this.repo = repo;
    this.setUpService = new SetUpService(context.targetDir);
  }
  async install() {
    await this.setUpService.exec('yarn', ['install', '||', 'true'], `Install ${this.repo.name} dependencies`);
  }
  async buildResource() {
    await this.setUpService.exec('yarn', ['build', '||', 'true'], `Build ${this.repo.name} resource`);
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
