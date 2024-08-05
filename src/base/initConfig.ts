import config from '../config/config';
import path from 'path';

config.loadFile(path.join(__dirname, '../resources/extensions/configJson/index.json'));
