import { PluginContext, resourcePublicLocalPath } from '../shared';
import { readPluginConfig, copy } from '../utils';
import { SetUpService, ServerService } from '.';
import path from 'path';

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
  async copyLocalStaticHtml() {
    const originPath = path.join(resourcePublicLocalPath, this.staticPath);
    const targetPath = path.join(this.context.targetDir, this.reportPath);
    await copy(originPath, targetPath);
  }
  async generatorReportJson() {
    const { platoCommand } = await readPluginConfig();
    await this.setUpService.exec('yarn', platoCommand, `generator ${this.staticPath} report json`);
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', ['add', this.staticPath, '-D'], `Install ${this.staticPath} dependencies`);
  }
  async buildTargetResource() {
    await this.setUpService.exec('yarn', ['build'], `build target resource`);
  }
  async init() {
    await this.installDependencies();
    await this.buildTargetResource();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await this.serverService.startServer();
  }
}

export default PlatoReportService;
