import SetUpService from './SetUpService';

class InstallDependencies {
  setUpService: SetUpService;
  constructor(targetDir: string) {
    this.setUpService = new SetUpService(targetDir);
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', [], 'Installing dependencies');
  }
}

export default InstallDependencies;
