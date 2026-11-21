import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { closeDb } from './db/index.js';

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Creator OS Server running on port ${PORT} [${config.NODE_ENV}]`);
  logger.info(`Health check available at http://localhost:${PORT}/api/v1/health`);
});

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await closeDb();
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
