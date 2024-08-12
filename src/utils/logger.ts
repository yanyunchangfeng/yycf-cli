import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { logPath } from '../shared';

const genInfoTransport = () =>
  new DailyRotateFile({
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: logPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
const genErrorTransport = () =>
  new DailyRotateFile({
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: logPath,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  });
const genExceptionTransport = () =>
  new DailyRotateFile({
    filename: 'exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: logPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
const genRejectionTransport = () =>
  new DailyRotateFile({
    filename: 'rejections-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: logPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
export const init = () => {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf((info) => {
        return `${info.timestamp} ${info.level}: ${info.message}`;
      }),
      winston.format.colorize()
    ),
    transports: [new winston.transports.Console(), genInfoTransport(), genErrorTransport()],
    exceptionHandlers: [genExceptionTransport()],
    rejectionHandlers: [genRejectionTransport()],
    exitOnError: false
  });
};
let logger = init();
logger.info('Logger initialized');

const generatorNewLogger = () => {
  logger = init();
  logger.info('Logger reinitialized');
};

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
});

export { logger, generatorNewLogger };
