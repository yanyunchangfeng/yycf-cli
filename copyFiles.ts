import fs from 'fs-extra';
import path from 'path';

const originDbPath = path.join(__dirname, 'src/resources/db');
const targetDbPath = path.join(__dirname, 'bin/resources/db');

const filter = (src: string, dest: string) => {
  if (src.includes('db')) {
    return false;
  }
  return true;
};

const copyFiles = async () => {
  try {
    await fs.copy('src/resources', 'bin/resources', { filter });
    if (!fs.existsSync(targetDbPath)) {
      await fs.copy(originDbPath, targetDbPath);
    }
    // await fs.copy('src/resources/db/pluginJson', 'bin/resources/db/pluginJson');
    console.log('Files copied successfully!');
  } catch (err) {
    console.error('Error copying files:', err);
  }
};

copyFiles();
