import { PluginContext, Repo } from '../shared';
import { SetUpService, ServerService } from '.';
import { readPluginConfig } from '../utils';

class MadgeReportService {
  context;
  setUpService: SetUpService;
  serverService: ServerService;
  staticPath = 'madge';
  reportPath = 'madge-report';
  constructor(context: PluginContext, repo: Repo) {
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
    this.serverService = new ServerService(context, {
      staticPath: this.staticPath,
      reportPath: this.reportPath,
      repo
    });
  }
  async generatorReport() {
    const { madgeArgs } = await readPluginConfig();
    await this.setUpService.exec(this.staticPath, madgeArgs, `Generate ${this.staticPath} report`);
  }
  async init() {
    await this.setUpService.setup(this.staticPath);
    await this.serverService.copyServerStatic();
    await this.serverService.generateHTML();
    await this.generatorReport();
    await this.serverService.startServer();
  }
}
export default MadgeReportService;
