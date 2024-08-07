import fs from 'fs-extra';
import { logger } from './src/utils';
import path from 'path';

const originDbJsonPath = path.join(__dirname, 'src/resources/dbConfigJson/index.json');
const targetDbJsonPath = path.join(__dirname, 'bin/resources/dbConfigJson/index.json');

const filter = (src: string, dest: string) => {
  if (src.includes('dbConfigJson')) {
    return false;
  }
  return true;
};

const copyFiles = async () => {
  try {
    await fs.copy('src/resources', 'bin/resources', { filter });
    await fs.copy('src/config.json', 'bin/config.json');
    if (!fs.existsSync(targetDbJsonPath)) {
      await fs.copy(originDbJsonPath, targetDbJsonPath);
    }
    logger.info('Files copied successfully!');
  } catch (err) {
    logger.error('Error copying files:', err);
  }
};

copyFiles();
