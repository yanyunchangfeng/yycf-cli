import SetUpService from './SetUpService';
import { PluginContext } from '../shared';
class InstallDependencies {
  setUpService: SetUpService;
  constructor(context: PluginContext) {
    this.setUpService = new SetUpService(context.targetDir);
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], `Install dependencies`);
  }
  async buildResource() {
    await this.setUpService.exec('yarn', ['build'], `Build resource`);
  }
  async build() {
    await this.installDependencies();
    await this.buildResource();
  }
}

export default InstallDependencies;
