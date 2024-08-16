import { PluginContext } from '../shared';
import { readFile, writeFile } from '../utils';
import path from 'path';
class PackageService {
  context;
  constructor(context: PluginContext) {
    this.context = context;
  }
  async writePkg() {
    const pkgPath = path.join(this.context.targetDir, 'package.json');
    let pInfo: any = await readFile(pkgPath, true);
    if (!pInfo) return;
    pInfo.name = this.context.projectName;
    await writeFile(pkgPath, pInfo, true);
  }
  async init() {
    await this.writePkg();
  }
}
export default PackageService;
