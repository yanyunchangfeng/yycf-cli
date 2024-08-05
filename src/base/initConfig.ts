import config from '../config/config';
import path from 'path';
import { logger } from '../utils';

config.loadFile(path.join(__dirname, '../resources/extensions/configJson/index.json'));

logger.info('config loaded');
