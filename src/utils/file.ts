import fs from 'fs-extra';
import { safeJsonParse } from '.';
import { gitSeverPath, pluginPath } from '../shared';
import { gitServerConfig as gitServersConfig, pluginConfig } from '../config';
import { logger } from '../utils';

export const readFile = async (path: string, needParse = false) => {
  if (!fs.existsSync(path)) return;
  try {
    const content = await fs.readFile(path, 'utf-8');
    return needParse ? safeJsonParse(content) : content;
  } catch (err) {
    logger.error(`async readFile path ${path} fail:  ${err}`);
    return;
  }
};

export const writeFile = async (path: string, content: any, needJsonStringify = false) => {
  if (!fs.existsSync(path)) return;
  try {
    await fs.writeFile(path, needJsonStringify ? JSON.stringify(content, null, 2) + require('os').EOL : content);
  } catch (err) {
    logger.error(`async writeFile path ${path} fail:  ${err}`);
  }
};

export const copy = async (originPath: string, targetPath: string) => {
  logger.info(`copy oringinPath ${originPath} to targetPath ${targetPath}`);
  try {
    await fs.copy(originPath, targetPath);
  } catch (err) {
    logger.error(`copy oringinPath ${originPath} to targetPath ${targetPath} fail:  ${err}`);
  }
};

export const readGitServerConfig = async () => {
  const gitServer = gitServersConfig.get('defaults.defaultGitServer');
  const gitServers: any = gitServersConfig.get('gitServers');
  const gitServerList = Object.keys(gitServers);
  const gitServerConfig = gitServersConfig.get(
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
};

export const writeGitServerConfig = async () => {
  return await writeFile(gitSeverPath, gitServersConfig.getProperties(), true);
};

export const readPluginConfig = async () => {
  return pluginConfig.getProperties();
};
export const writePluginConfig = async () => {
  return await writeFile(pluginPath, pluginConfig.getProperties(), true);
};
