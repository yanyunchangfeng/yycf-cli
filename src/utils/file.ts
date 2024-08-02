import fs from 'fs-extra';
import { safeJsonParse } from '.';
import { configPath } from '../shared';

export const readFile = async (path: string) => {
  if (!fs.existsSync(path)) return;
  try {
    const content = await fs.readFile(path, 'utf-8');
    return safeJsonParse(content);
  } catch (err) {
    console.error(`async readFile path ${path} fail:  ${err}`);
    return;
  }
};
export const readFileSync = (path: string) => {
  if (!fs.existsSync(path)) return;
  try {
    const content = fs.readFileSync(path, 'utf-8');
    return safeJsonParse(content);
  } catch (err) {
    console.error(`readFileSync path ${path} fail:  ${err}`);
    return;
  }
};

export const writeFile = async (path: string, content: any) => {
  if (!fs.existsSync(path)) return;
  try {
    await fs.writeFile(path, JSON.stringify(content, null, 2) + require('os').EOL);
  } catch (err) {
    console.error(`async writeFile path ${path} fail:  ${err}`);
  }
};
export const writeFileSync = (path: string, content: any) => {
  if (!fs.existsSync(path)) return;
  try {
    fs.writeFileSync(path, JSON.stringify(content, null, 2) + require('os').EOL);
  } catch (err) {
    console.error(`writeFileSync path ${path} fail:  ${err}`);
  }
};

export const copyFile = async (originPath: string, targetPath: string) => {
  console.log(`copyFile oringinPath ${originPath} to targetPath ${targetPath}`);
  try {
    await fs.copyFile(originPath, targetPath);
  } catch (err) {
    console.error(`copyFile oringinPath ${originPath} to targetPath ${targetPath} fail:  ${err}`);
  }
};

export const readConfig = async () => {
  return await readFile(configPath);
};

export const writeConfig = async (content: any) => {
  return await writeFile(configPath, content);
};
