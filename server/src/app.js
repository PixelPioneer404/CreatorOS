import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limiter.middleware.js';
import { ApiResponse } from './utils/api-response.js';
import { ApiError } from './utils/api-error.js';
import { getDb } from './db/index.js';
import { AiService } from './modules/ai/ai.service.js';

// Route imports
import userRoutes from './modules/users/user.routes.js';
import workspaceRoutes from './modules/workspaces/workspace.routes.js';
import creatorRoutes from './modules/creator/creator.routes.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors({
  origin: config.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id', 'x-request-id'],
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  let dbStatus = 'unconfigured';
  const db = getDb();
  if (db) {
    try {
      await db.execute('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }
  }

  const aiStatus = AiService.getProviderStatus();

  return ApiResponse.success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      aiProvider: aiStatus.configured ? 'configured' : 'unconfigured',
      aiProviderName: aiStatus.provider,
    },
  });
});

// Mount module routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/workspaces/:workspaceId', creatorRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found.`));
});

// Central error handler
app.use(errorHandler);

export default app;
