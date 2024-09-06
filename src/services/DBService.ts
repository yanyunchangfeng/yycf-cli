import { writeFile } from '../utils';
import { pluginConfig, gitServerConfig } from '../config';
import { pluginPath, gitSeverPath, PluginContext } from '../shared';
import fs from 'fs';
class DBService {
  pluginConfigDb = pluginConfig;
  gitServerConfigDb = gitServerConfig;

  async setSinglePluginEnabled(pluginName: string) {
    const { plugins } = await this.readPluginConfig();
    const plugin = plugins.find((plugin) => plugin.name === pluginName);
    const index = plugins.findIndex((plugin) => plugin.name === pluginName);
    if (plugin) {
      pluginConfig.set('plugins', [
        ...plugins.slice(0, index),
        { ...plugin, enabled: true },
        ...plugins.slice(index + 1)
      ] as any);
      await this.writePluginConfig();
    }
  }

  async readPluginConfig() {
    return this.pluginConfigDb.getProperties();
  }
  async writePluginConfig() {
    return await writeFile(pluginPath, this.pluginConfigDb.getProperties(), true);
  }
  async readGitServerConfig() {
    const gitServer = dbService.gitServerConfigDb.get('defaults.defaultGitServer');
    const gitServers: any = dbService.gitServerConfigDb.get('gitServers');
    const gitServerList = Object.keys(gitServers);
    const gitServerConfig = dbService.gitServerConfigDb.get(
      gitServer ? `gitServers.${gitServer}` : (`gitServers.${gitServerList[0]}` as any)
    );
    const orgs = gitServerConfig.orgs;
    const user = gitServerConfig.user;
    const origin = gitServerConfig.origin;
    const Authorization = gitServerConfig.Authorization;
    const gitServerType = gitServerConfig.type;

    return {
      gitServer,
      gitServerConfig,
      gitServerList,
      orgs,
      user,
      origin,
      Authorization,
      gitServerType
    };
  }
  async writeGitServerConfig(context?: PluginContext) {
    const curGitServerPath = context?.gitServerPath || gitSeverPath;
    return await writeFile(curGitServerPath, this.gitServerConfigDb.getProperties(), true);
  }
  async readGitServerConfigAll() {
    return this.gitServerConfigDb.getProperties();
  }
  async init(context: PluginContext) {
    const curGitServerPath = context.gitServerPath || gitSeverPath;
    if (fs.existsSync(curGitServerPath)) {
      this.gitServerConfigDb.loadFile(curGitServerPath);
    }
  }
}

const dbService = new DBService();

export default dbService;
