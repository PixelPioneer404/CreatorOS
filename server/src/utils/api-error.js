export class ApiError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'The supplied request is invalid.', details = []) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthenticated(message = 'Authentication is required to access this resource.') {
    return new ApiError(401, 'UNAUTHENTICATED', message);
  }

  static forbidden(message = 'You do not have permission to access this resource.') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'A conflict occurred with an existing resource.') {
    return new ApiError(409, 'CONFLICT', message);
  }

  static rateLimited(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static internal(message = 'An unexpected internal server error occurred.') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }

  static database(message = 'A database error occurred.') {
    return new ApiError(500, 'DATABASE_ERROR', message);
  }

  static externalProvider(message = 'An error occurred while communicating with an external service.') {
    return new ApiError(502, 'EXTERNAL_PROVIDER_ERROR', message);
  }

  static aiProvider(message = 'AI generation service encountered an error.') {
    return new ApiError(502, 'AI_PROVIDER_ERROR', message);
  }
}
