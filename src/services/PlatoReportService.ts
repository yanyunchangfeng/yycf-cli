import { PluginContext } from '../shared';
import { readPluginConfig } from '../utils';
import { SetUpService, ServerService } from '.';

class PlatoReportService {
  context;
  setUpService: SetUpService;
  serverService: ServerService;
  staticPath = 'plato';
  reportPath = 'plato-report';
  constructor(context: PluginContext) {
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
    this.serverService = new ServerService(context, {
      staticPath: this.staticPath,
      reportPath: this.reportPath
    });
  }
  async generatorReportJson() {
    const { platoArgs } = await readPluginConfig();
    await this.setUpService.exec(this.staticPath, platoArgs, `generator ${this.staticPath} report json`);
  }
  async buildTargetResource() {
    await this.setUpService.exec('yarn', [], `Install dependencies`);
    await this.setUpService.exec('yarn', ['build'], `build resource`);
  }
  async init() {
    await this.setUpService.setup(this.staticPath);
    await this.buildTargetResource();
    await this.generatorReportJson();
    await this.serverService.copyServerStaticHtml();
    await this.serverService.startServer();
  }
}

export default PlatoReportService;
