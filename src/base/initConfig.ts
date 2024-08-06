import config from '../config/config';
import { logger } from '../utils';
import { configPath } from '../shared';

config.loadFile(configPath);

logger.info('config loaded');
