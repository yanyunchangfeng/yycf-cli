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
  async isDestDirCached() {
    const { repo, tag } = this.context;
    this.context.destDir = path.join(this.cacheDir, `${repo.name}${tag ? `@${tag}` : ''}`);
    return fs.existsSync(this.context.destDir);
  }
  async copyFromCacheResponsitory() {
    await copy(this.context.destDir, this.context.targetDir);
  }
  async getCacheRepository() {
    const isDestDirCached = await this.isDestDirCached();
    if (isDestDirCached) {
      return await this.copyFromCacheResponsitory();
    }
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
