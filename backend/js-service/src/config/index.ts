import dotenv from 'dotenv';
import { AppConfig } from '@/types';

dotenv.config();

const config: AppConfig = {
  port: parseInt(process.env['PORT'] || '3004', 10),
  environment: (process.env['NODE_ENV'] as 'development' | 'production' | 'test') || 'development',
  logLevel: (process.env['LOG_LEVEL'] as 'error' | 'warn' | 'info' | 'debug') || 'info',
  cors: {
    origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000'],
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your-super-secret-key-change-in-production',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '1h',
  },
  cache: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || undefined,
    db: parseInt(process.env['REDIS_DB'] || '0', 10),
    ttl: parseInt(process.env['CACHE_TTL'] || '3600', 10), // 1 hour
    keyPrefix: process.env['CACHE_KEY_PREFIX'] || 'js-service:',
  },
  database: {
    host: process.env['POSTGRES_HOST'] || 'localhost',
    port: parseInt(process.env['POSTGRES_PORT'] || '5432', 10),
    database: process.env['POSTGRES_DB'] || 'gitshadow',
    username: process.env['POSTGRES_USER'] || 'gitshadow',
    password: process.env['POSTGRES_PASSWORD'] || 'gitshadow123',
    ssl: process.env['POSTGRES_SSL'] === 'true',
    maxConnections: parseInt(process.env['POSTGRES_MAX_CONNECTIONS'] || '10', 10),
    idleTimeoutMillis: parseInt(process.env['POSTGRES_IDLE_TIMEOUT'] || '30000', 10),
  },
  prometheus: {
    enabled: process.env['PROMETHEUS_ENABLED'] === 'true',
    port: parseInt(process.env['PROMETHEUS_PORT'] || '9090', 10),
  },
};

export default config; 