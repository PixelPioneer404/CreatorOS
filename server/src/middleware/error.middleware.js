import { ApiError } from '../utils/api-error.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred. Please try again.';
  let details = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details || [];
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation error.';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Log error with request ID without leaking secrets
  logger.error({
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    code,
    message,
    details,
    stack: err.stack,
  }, `API Error: ${code} - ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
