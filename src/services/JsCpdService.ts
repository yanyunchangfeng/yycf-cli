import { PluginContext, Repo } from '../shared';
import { SetUpService, ServerService, dbService } from '.';
import path from 'path';
import { rename } from 'fs-extra';
class JsCpdService {
  context;
  setUpService: SetUpService;
  serverService: ServerService;
  staticPath = 'jscpd';
  reportPath = 'jscpd-report';
  constructor(context: PluginContext, repo: Repo) {
    this.context = context;
    this.setUpService = new SetUpService(context.targetDir);
    this.serverService = new ServerService(context, {
      staticPath: this.staticPath,
      reportPath: this.reportPath,
      repo
    });
  }
  async generatorReportJson() {
    const { jscpdArgs } = await dbService.readPluginConfig();
    await this.setUpService.exec(
      this.staticPath,
      jscpdArgs,
      `generator ${this.serverService.getRepoTitle()} ${this.staticPath} Report Json`
    );
    await rename(
      path.join(this.context.targetDir, this.reportPath, 'jscpd-report.json'),
      path.join(this.context.targetDir, this.reportPath, 'report.json')
    );
  }
  async init() {
    await this.setUpService.setup(this.staticPath);
    await this.serverService.copyServerStatic();
    await this.serverService.generateHTML();
    await this.generatorReportJson();
    await this.serverService.startServer();
  }
}

export default JsCpdService;
