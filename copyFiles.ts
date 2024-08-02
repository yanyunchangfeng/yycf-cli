import fs from 'fs-extra';

const copyFiles = async () => {
  try {
    await fs.copy('src/config', 'bin/config');
    console.log('Files copied successfully!');
  } catch (err) {
    console.error('Error copying files:', err);
  }
};

copyFiles();
