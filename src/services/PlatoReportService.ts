import { PluginContext, resourcePath } from '../shared';
import { readPluginConfig, copy } from '../utils';
import { startPlatoServer } from '../server';
import { SetUpService } from '.';
import path from 'path';

class PlatoReportService {
  context;
  setUpService: SetUpService;
  targetDir: string;
  constructor(context: PluginContext) {
    this.context = context;
    this.targetDir = context.targetDir;
    this.setUpService = new SetUpService(context.targetDir);
  }
  async copyLocalStaticHtml() {
    const originPath = path.resolve(resourcePath, 'public/local/plato');
    const targetPath = path.resolve(this.targetDir, 'plato-report');
    await copy(originPath, targetPath);
  }
  async generatorPlatoReportJson() {
    const { platoCommand } = await readPluginConfig();
    await this.setUpService.exec('yarn', [...platoCommand], 'generator-plato-report-json');
  }
  async installPlatoDependencies() {
    await this.setUpService.exec('yarn', ['add', 'plato', '-D'], 'install-plato-dependencies');
  }
  async buildTargetResource() {
    await this.setUpService.exec('yarn', ['build'], 'build-target-resource');
  }
  async init() {
    await this.installPlatoDependencies();
    await this.buildTargetResource();
    await this.generatorPlatoReportJson();
    await this.copyLocalStaticHtml();
    await startPlatoServer(this.targetDir);
  }
}

export default PlatoReportService;
