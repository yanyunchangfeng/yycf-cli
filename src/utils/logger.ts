import winston from 'winston';
import path from 'path';
// 创建日志目录路径
const logDirectory = path.resolve(__dirname, '../logs');

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
  transports: [
    new winston.transports.Console(),
    // 文件输出
    new winston.transports.File({
      filename: path.join(logDirectory, 'app.log'),
      level: 'info'
    }),
    // 错误日志单独文件输出
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error'
    })
  ],
  exceptionHandlers: [new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') })],
  rejectionHandlers: [new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') })],
  exitOnError: false
});

logger.exceptions.handle(new winston.transports.File({ filename: path.join(logDirectory, 'exceptions.log') }));
logger.rejections.handle(new winston.transports.File({ filename: path.join(logDirectory, 'rejections.log') }));

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error}`);
});
