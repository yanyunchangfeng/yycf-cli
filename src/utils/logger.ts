import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { logPath } from '../shared';

const genInfoTransport = (defaultLogPath: string = logPath) =>
  new DailyRotateFile({
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: defaultLogPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
const genErrorTransport = (defaultLogPath: string = logPath) =>
  new DailyRotateFile({
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: defaultLogPath,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error'
  });
const genExceptionTransport = (defaultLogPath: string = logPath) =>
  new DailyRotateFile({
    filename: 'exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: defaultLogPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
const genRejectionTransport = (defaultLogPath: string = logPath) =>
  new DailyRotateFile({
    filename: 'rejections-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    dirname: defaultLogPath,
    maxSize: '20m',
    maxFiles: '14d'
  });
const init = (defaultLogPath: string = logPath) => {
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
    transports: [new winston.transports.Console(), genInfoTransport(defaultLogPath), genErrorTransport(defaultLogPath)],
    exceptionHandlers: [genExceptionTransport(defaultLogPath)],
    rejectionHandlers: [genRejectionTransport(defaultLogPath)],
    exitOnError: false
  });
};
let logger = init();
logger.info('Logger initialized');

const initializeLogger = (defaultLogPath: string = logPath) => {
  logger = init(defaultLogPath);
  logger.info(`Logger reinitialized: ${defaultLogPath}`);
};

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
});

export { logger, initializeLogger };
