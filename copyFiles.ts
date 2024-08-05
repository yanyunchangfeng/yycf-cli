import fs from 'fs-extra';

const copyFiles = async () => {
  try {
    await fs.copy('src/resources', 'bin/resources');
    console.log('Files copied successfully!');
  } catch (err) {
    console.error('Error copying files:', err);
  }
};

copyFiles();
