import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import { GITSERVER, Repo } from '../shared';
import { readGitServerConfig, wrapLoading } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';

class CacheRepositoryService {
  cacheDir: any;
  downloadGitRepo = util.promisify(dowloadGitRepo);
  constructor(dirName: string = 'repository') {
    this.initCacheDir(dirName);
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
  async cacheRepository(repo: Repo, tag: string) {
    const { gitServerType, origin, orgs, user, Authorization } = await readGitServerConfig();
    await fs.ensureDir(this.cacheDir);
    const destDir = path.join(this.cacheDir, `${repo.name}${tag ? `@${tag}` : ''}`);
    let requestUrl;
    if (gitServerType !== GITSERVER.GITHUB) {
      requestUrl = `direct:${origin}/api/v4/projects/${repo.id}/repository/archive.zip${tag ? `?sha=${tag}` : ''} `;
      return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, destDir, {
        headers: { Authorization: `Bearer ${Authorization}` }
      });
    }
    if (gitServerType === GITSERVER.GITHUB) {
      requestUrl = `${orgs ? orgs : user}/${repo.name}${tag ? '#' + tag : ''}`;
    }
    return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, destDir);
  }
  async clearCacheRepository() {
    await fs.emptyDir(this.cacheDir);
  }
}

export default CacheRepositoryService;
