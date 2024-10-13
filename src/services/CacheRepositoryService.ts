import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { PluginContext } from '../shared';
import { copy } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';

class CacheRepositoryService {
  cacheDir: any;
  context;
  downloadGitRepo = util.promisify(dowloadGitRepo);
  dirName = 'repository';
  constructor(context: PluginContext) {
    this.context = context;
    this.initCacheDir(this.context.cacheDirName || this.dirName);
  }
  async initCacheDir(dirName: string) {
    const plaform = os.platform();
    if (plaform === 'linux') {
      this.cacheDir = `/var/cache/${dirName}`; // 替换为实际的缓存目录
    } else if (plaform === 'darwin') {
      this.cacheDir = `/Library/Caches/${dirName}`; // 替换为实际的缓存目录
    } else if (plaform === 'win32') {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      this.cacheDir = path.join(appData, dirName); // 替换为实际的缓存目录
    } else {
      throw new Error('不支持的操作系统');
    }
  }
  async clearDestDir() {
    this.context.destDirs = [];
  }
  async getCacheRepository() {
    await this.clearDestDir();
    await Promise.all(
      this.context.repos.map(async (repo) => {
        const { name, tag } = repo;
        const destDir = path.join(this.cacheDir, name, tag ? tag : '');
        const targetDir = this.context.all ? path.join(this.context.targetDir, name) : this.context.targetDir;
        this.context.destDirs.push(destDir);
        if (fs.existsSync(destDir)) {
          // 手动删除远端的tag 会导致原有的缓存目拷贝到新项目下结构不对 需要清除原有的缓存目录
          await copy(destDir, targetDir);
        }
      })
    );
  }
  async clearCacheRepository() {
    await fs.remove(this.cacheDir);
  }
  async init() {
    await fs.ensureDir(this.cacheDir);
    await this.getCacheRepository();
  }
}

export default CacheRepositoryService;
