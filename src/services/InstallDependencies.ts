import SetUpService from './SetUpService';
import { PluginContext } from '../shared';
class InstallDependencies {
  setUpService: SetUpService;
  context;
  constructor(context: PluginContext) {
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], `Install ${this.context.targetDir} dependencies`);
  }
  async buildResource() {
    await this.setUpService.exec('yarn', ['build'], `Build ${this.context.targetDir} resource`);
  }
  async build() {
    await this.installDependencies();
    await this.buildResource();
  }
}

export default InstallDependencies;
