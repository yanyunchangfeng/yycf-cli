import { execSync } from 'child_process';
import { logger } from '.';
import os from 'os';

export const getGlobalPath = () => {
  let globalModulesPath;
  try {
    globalModulesPath = execSync('npm root -g').toString().trim();
  } catch (error) {
    logger.error(`can't get global path: ${error}`);
    process.exit(1);
  }
  return globalModulesPath;
};
const initNodePath = () => {
  process.env.NODE_PATH = getGlobalPath();
  logger.info(`SET NODE_PATH: ${process.env.NODE_PATH}`);
};

const initNodeOptions = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  logger.info(`totalMemory: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`);
  logger.info(`freeMemory: ${(freeMemory / 1024 / 1024).toFixed(2)} MB`);
  const optimalMemoryLimit = Math.floor((totalMemory * 0.75) / 1024 / 1024); // 转换为MB
  process.env.NODE_OPTIONS = `--max-old-space-size=${optimalMemoryLimit}`;
  logger.info(`SET NODE_OPTIONS: ${process.env.NODE_OPTIONS}`);
};

export const initNodeEnv = () => {
  initNodePath();
  initNodeOptions();
};
