import fs from 'fs-extra';
import { logger } from './src/utils';
const copyFiles = async () => {
  try {
    await fs.copy('src/resources', 'bin/resources');
    logger.info('Files copied successfully!');
  } catch (err) {
    logger.error('Error copying files:', err);
  }
};

copyFiles();
