import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/api-error.js';
import { isTest } from '../config/index.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.rateLimited());
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.rateLimited('Too many authentication attempts. Please try again after 15 minutes.'));
  },
});
