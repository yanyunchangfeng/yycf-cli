import fs from 'fs-extra';
import { safeJsonParse } from '.';
import { configPath } from '../shared';
import config from '../config/config';

export const readFile = async (path: string, needParse = false) => {
  if (!fs.existsSync(path)) return;
  try {
    const content = await fs.readFile(path, 'utf-8');
    return needParse ? safeJsonParse(content) : content;
  } catch (err) {
    console.error(`async readFile path ${path} fail:  ${err}`);
    return;
  }
};

export const writeFile = async (path: string, content: any, needJsonStringify = false) => {
  if (!fs.existsSync(path)) return;
  try {
    await fs.writeFile(path, needJsonStringify ? JSON.stringify(content, null, 2) + require('os').EOL : content);
  } catch (err) {
    console.error(`async writeFile path ${path} fail:  ${err}`);
  }
};

export const copy = async (originPath: string, targetPath: string) => {
  console.log(`copy oringinPath ${originPath} to targetPath ${targetPath}`);
  try {
    await fs.copy(originPath, targetPath);
  } catch (err) {
    console.error(`copy oringinPath ${originPath} to targetPath ${targetPath} fail:  ${err}`);
  }
};

export const readConfig = async () => {
  const gitServer = config.get('defaults.defaultGitServer');
  const gitServerConfig = config.get(`gitServers.${gitServer}` as any);
  const gitServerList = Object.keys(config.get('gitServers'));
  const orgs = gitServerConfig.orgs;
  const user = gitServerConfig.user;
  const origin = gitServerConfig.origin;
  const Authorization = gitServerConfig.Authorization;
  const eslintPkgs = config.get('defaults.eslintPkgs');

  return {
    gitServer,
    gitServerConfig,
    gitServerList,
    orgs,
    user,
    origin,
    Authorization,
    eslintPkgs
  };
};

export const writeConfig = async () => {
  return await writeFile(configPath, config.getProperties(), true);
};

export { config };
