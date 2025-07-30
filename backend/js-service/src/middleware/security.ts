import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import logger from '@/utils/logger';
import config from '@/config';

// Rate limiting middleware
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General rate limiter
export const generalRateLimiter = createRateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests
);

// Strict rate limiter for analysis endpoints
export const analysisRateLimiter = createRateLimiter(60000, 10); // 10 requests per minute

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};

// Helmet security configuration
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' as any },
};

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Security headers middleware
export const securityHeadersMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  // Sanitize request body
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  next();
};

// Content length validation
export const validateContentLength = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      logger.warn('Request too large', {
        contentLength,
        maxSize,
        ip: req.ip,
        path: req.path,
      });
      
      res.status(413).json({
        success: false,
        error: 'Payload too large',
        message: `Request body exceeds maximum size of ${maxSize} bytes`,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    next();
  };
};

// JWT authentication middleware (placeholder)
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or invalid authorization header', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid authorization header required',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    // In a real implementation, you would verify the JWT token here
    // const decoded = jwt.verify(token, config.jwt.secret);
    // req.user = decoded;
    
    // For now, we'll just check if the token exists
    if (!token || token.length < 10) {
      throw new Error('Invalid token');
    }
    
    next();
  } catch (error) {
    logger.warn('Invalid JWT token', {
      ip: req.ip,
      path: req.path,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    logger.warn('Missing API key', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'API key required',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  // In a real implementation, you would validate the API key against a database
  // For now, we'll just check if it exists and has a reasonable length
  if (apiKey.length < 10) {
    logger.warn('Invalid API key format', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid API key',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;
  
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      requestId,
    });
  });
  
  next();
};

// Utility functions
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key]
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Export all security middlewares
export const securityMiddlewares = {
  helmet: helmet(helmetConfig),
  cors: cors(corsOptions),
  requestId: requestIdMiddleware,
  securityHeaders: securityHeadersMiddleware,
  sanitizeInput,
  validateContentLength: validateContentLength(),
  authenticateJWT,
  validateApiKey,
  requestLogger,
  generalRateLimiter,
  analysisRateLimiter,
}; 