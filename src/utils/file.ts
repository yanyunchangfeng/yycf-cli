import fs from 'fs-extra';
import { safeJsonParse } from '.';
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

export const copy = async (originPath: string, targetPath: string, options?: fs.CopyOptions) => {
  logger.info(`copy oringinPath ${originPath} to targetPath ${targetPath}`);
  try {
    await fs.copy(originPath, targetPath, options);
  } catch (err) {
    logger.error(`copy oringinPath ${originPath} to targetPath ${targetPath} fail:  ${err}`);
  }
};
