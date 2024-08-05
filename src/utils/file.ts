import fs from 'fs-extra';
import { safeJsonParse } from '.';
import { configPath } from '../shared';
import config from '../config/config';
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

export const readConfig = async () => {
  const gitServer = config.get('defaults.defaultGitServer');
  const ignoresGitServers: string[] = config.get('defaults.ignoresGitServers');
  const gitServers: any = config.get('gitServers');
  const gitServerList = Object.keys(gitServers).filter((key) => !ignoresGitServers.includes(gitServers[key].type));
  const gitServerConfig = config.get(gitServer ? `gitServers.${gitServer}` : (`gitServers.${gitServerList[0]}` as any));
  const orgs = gitServerConfig.orgs;
  const user = gitServerConfig.user;
  const origin = gitServerConfig.origin;
  const Authorization = gitServerConfig.Authorization;
  const gitServerType = gitServerConfig.type;
  const eslintPkgs = config.get('defaults.eslintPkgs');

  return {
    gitServer,
    gitServerConfig,
    gitServerList,
    orgs,
    user,
    origin,
    Authorization,
    eslintPkgs,
    gitServerType
  };
};

export const writeConfig = async () => {
  return await writeFile(configPath, config.getProperties(), true);
};

export { config };
