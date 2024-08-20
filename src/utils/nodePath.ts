import { execSync } from 'child_process';
import { logger } from '.';

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
export const initNodePath = () => {
  process.env.NODE_PATH = getGlobalPath();
};
