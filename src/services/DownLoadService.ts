import { GITSERVER, PluginContext, Repo } from '../shared';
import { logger, readGitServerConfig, wrapLoading, copy } from '../utils';
import util from 'util';
// @ts-ignore   正常不用忽略也没问题 因为typings里面有定义  主要是为了解决调式模式下的ts报错（调式编译器的问题）
import dowloadGitRepo from 'download-git-repo';
import fs from 'fs-extra';
import path from 'path';

class DownloadService {
  context;
  downloadGitRepo = util.promisify(dowloadGitRepo);
  constructor(context: PluginContext) {
    this.context = context;
  }
  async download(repo: Repo, destDir: string) {
    const { gitServerType, origin, orgs, user, Authorization } = await readGitServerConfig();
    const { tag, id } = repo;
    let requestUrl;
    if (gitServerType !== GITSERVER.GITHUB) {
      requestUrl = `direct:${origin}/api/v4/projects/${id}/repository/archive.zip${tag ? `?sha=${tag}` : ''} `;
      return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, destDir, {
        headers: { Authorization: `Bearer ${Authorization}` }
      });
    }
    requestUrl = `${orgs ? orgs : user}/${repo.name}${tag ? '#' + tag : ''}`;
    return await wrapLoading(this.downloadGitRepo, 'waiting for download ', requestUrl, destDir);
  }
  async copyFromCacheResponsitory() {
    if (this.context.destDir) {
      logger.info(`cacheRepository plugin enabled, need copy to targetDir`);
      return await copy(this.context.destDir, this.context.targetDir);
    }
  }
  async init() {
    await Promise.all(
      this.context.repos.map(async (repo, index) => {
        const { tag, name } = repo;
        const targetDir = this.context.all
          ? path.join(this.context.targetDir, `${name}${tag ? `@${tag}` : ''}`)
          : this.context.targetDir;
        if (fs.existsSync(targetDir)) {
          logger.info(`cacheRepository plugin enabled,target dir [${targetDir}] already exists don't need download`);
          return;
        }
        const destDir = this.context.destDirs?.[index] || targetDir;
        await this.download(repo, destDir);
        if (this.context.destDirs) {
          logger.info(`cacheRepository plugin enabled, need copy to targetDir`);
          await copy(destDir, targetDir);
        }
      })
    );
  }
}

export default DownloadService;
