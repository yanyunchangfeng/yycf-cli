import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDirectory = path.resolve(__dirname, '../../logs');
const infoTransport = new DailyRotateFile({
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  dirname: logDirectory,
  maxSize: '20m',
  maxFiles: '14d'
});
const errorTransport = new DailyRotateFile({
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  dirname: logDirectory,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error'
});
const exceptionTransport = new DailyRotateFile({
  filename: 'exceptions-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  dirname: logDirectory,
  maxSize: '20m',
  maxFiles: '14d'
});
const rejectionTransport = new DailyRotateFile({
  filename: 'rejections-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  dirname: logDirectory,
  maxSize: '20m',
  maxFiles: '14d'
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.splat(),
    winston.format.printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    }),
    winston.format.colorize()
  ),
  transports: [new winston.transports.Console(), infoTransport, errorTransport],
  exceptionHandlers: [exceptionTransport],
  rejectionHandlers: [rejectionTransport],
  exitOnError: false
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
});
