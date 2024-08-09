import SetUpService from './SetUpService';
import { PluginContext } from '../shared';
class InstallDependencies {
  setUpService: SetUpService;
  constructor(context: PluginContext) {
    this.setUpService = new SetUpService(context.targetDir);
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], 'Installing dependencies');
  }
}

export default InstallDependencies;
