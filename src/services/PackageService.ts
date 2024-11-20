import { PluginContext } from '../shared';
import { readFile, writeFile } from '../utils';
import path from 'path';
import url, { URL } from 'url';
class PackageService {
  context;
  constructor(context: PluginContext) {
    this.context = context;
  }
  async writePkg() {
    const pkgPath = path.join(this.context.targetDir, 'package.json');
    const pInfo: any = await readFile(pkgPath, true);
    if (!pInfo) return;
    pInfo.name = this.context.projectName;
    const repoUrl = pInfo.repository?.url;
    if (repoUrl) {
      const parsedUrl = new URL(repoUrl);
      const baseUrl = path.join(parsedUrl.origin, parsedUrl.pathname.split('/').filter(Boolean).slice(0, 1).join('/'));
      pInfo.repository.url = path.join(baseUrl, `${pInfo.name}.git`);
    }
    await writeFile(pkgPath, pInfo, true);
  }
  async init() {
    await this.writePkg();
  }
}
export default PackageService;
