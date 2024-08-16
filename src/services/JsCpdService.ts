import { PluginContext, resourcePublicLocalPath } from '../shared';
import { SetUpService, ServerService } from '.';
import { readPluginConfig, copy } from '../utils';
import path from 'path';
import { rename } from 'fs-extra';
class JsCpdService {
  context;
  setUpService: SetUpService;
  serverService: ServerService;
  staticPath = 'jscpd';
  reportPath = 'jscpd-report';
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
    const { jscpdCommand } = await readPluginConfig();
    await this.setUpService.exec('yarn', jscpdCommand, `generator ${this.staticPath} Report Json`);
    await rename(
      path.join(this.context.targetDir, this.reportPath, 'jscpd-report.json'),
      path.join(this.context.targetDir, this.reportPath, 'report.json')
    );
  }
  async installDependencies() {
    await this.setUpService.exec('yarn', ['add', this.staticPath, '-D'], `Install ${this.staticPath} dependencies`);
  }
  async init() {
    await this.installDependencies();
    await this.generatorReportJson();
    await this.copyLocalStaticHtml();
    await this.serverService.startServer();
  }
}

export default JsCpdService;
