import { PluginContext, Repo } from '../shared';
import { readPluginConfig } from '../utils';
import { SetUpService, ServerService, InstallDependencies } from '.';

class PlatoReportService {
  context;
  setUpService: SetUpService;
  serverService: ServerService;
  installDependencies: InstallDependencies;
  staticPath = 'plato';
  reportPath = 'plato-report';
  constructor(context: PluginContext, repo: Repo) {
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
    this.serverService = new ServerService(context, {
      staticPath: this.staticPath,
      reportPath: this.reportPath,
      repo
    });
    this.installDependencies = new InstallDependencies(context, repo);
  }
  async generatorReportJson() {
    const { platoArgs } = await readPluginConfig();
    await this.setUpService.exec(this.staticPath, platoArgs, `generator ${this.staticPath} report json`);
  }
  async init() {
    await this.setUpService.setup(this.staticPath);
    await this.installDependencies.build();
    await this.generatorReportJson();
    await this.serverService.copyServerStatic();
    await this.serverService.generateHTML();
    await this.serverService.startServer();
  }
}

export default PlatoReportService;
