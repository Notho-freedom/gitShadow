import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { errorsTotal } from '@/utils/metrics';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

// Error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const isOperational = error.isOperational !== false;

  // Log error
  const logData = {
    error: message,
    stack: error.stack,
    statusCode,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    isOperational,
  };

  if (statusCode >= 500) {
    logger.error('Server error', logData);
  } else {
    logger.warn('Client error', logData);
  }

  // Update metrics
  errorsTotal.inc({ type: isOperational ? 'operational' : 'system', endpoint: req.path });

  // Don't leak error details in production
  const isDevelopment = process.env['NODE_ENV'] === 'development';
  const errorResponse = {
    success: false,
    error: isDevelopment ? message : 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'] || 'unknown',
  };

  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  // const _error = new NotFoundError(`Route ${req.originalUrl} not found`);
  
  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
};

// Unhandled rejection handler
export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });

  // In production, you might want to exit the process
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
};

// Uncaught exception handler
export const handleUncaughtException = (error: Error): void => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });

  // In production, you might want to exit the process
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
};

// Setup global error handlers
export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
}; 