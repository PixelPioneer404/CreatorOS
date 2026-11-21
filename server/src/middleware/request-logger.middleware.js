import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId: req.id,
      timestamp: new Date().toISOString(),
      method: req.method,
      route: req.originalUrl,
      statusCode: res.statusCode,
      userId: req.user?.id || null,
      workspaceId: req.workspace?.id || req.params?.workspaceId || null,
      durationMs: duration,
    }, `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });

  next();
}
