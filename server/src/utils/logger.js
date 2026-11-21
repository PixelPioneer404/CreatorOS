import pino from 'pino';
import { isDev, isTest } from '../config/index.js';

export const logger = pino({
  level: isTest ? 'silent' : isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
});
