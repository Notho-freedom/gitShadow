#!/usr/bin/env node
/**
 * API Gateway Ultra-Robuste pour GitShadow Documentation
 * Orchestre tous les services de documentation avec load balancing, cache, monitoring
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const Redis = require('ioredis');
const { createClient } = require('redis');
const prometheus = require('prom-client');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const cluster = require('cluster');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  port: process.env.GATEWAY_PORT || 3001,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  services: {
    python: process.env.PYTHON_SERVICE_URL || 'http://localhost:3002',
    javascript: process.env.JS_SERVICE_URL || 'http://localhost:3004',
    java: process.env.JAVA_SERVICE_URL || 'http://localhost:3003',
    rust: process.env.RUST_SERVICE_URL || 'http://localhost:3005',
    web: process.env.WEB_SERVICE_URL || 'http://localhost:3006',
    ai: process.env.AI_SERVICE_URL || 'http://localhost:3007',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3008',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite par IP
  },
};

// Logging structuré
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gateway' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Métriques Prometheus
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ register: prometheus.register });

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

// Clients Redis
const redis = new Redis(config.redis);
const redisCache = createClient(config.redis);

// Service Discovery et Health Check
class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthChecks = new Map();
  }

  async registerService(name, url) {
    this.services.set(name, {
      url,
      healthy: false,
      lastCheck: null,
      responseTime: null,
    });
    
    // Démarrer le health check
    await this.startHealthCheck(name);
  }

  async startHealthCheck(serviceName) {
    const checkHealth = async () => {
      try {
        const start = Date.now();
        const response = await fetch(`${this.services.get(serviceName).url}/health`);
        const duration = Date.now() - start;
        
        this.services.get(serviceName).healthy = response.ok;
        this.services.get(serviceName).lastCheck = new Date();
        this.services.get(serviceName).responseTime = duration;
        
        logger.info('Health check', { service: serviceName, healthy: response.ok, duration });
      } catch (error) {
        this.services.get(serviceName).healthy = false;
        logger.error('Health check failed', { service: serviceName, error: error.message });
      }
    };

    // Premier check immédiat
    await checkHealth();
    
    // Check périodique toutes les 30 secondes
    setInterval(checkHealth, 30000);
  }

  getHealthyService(name) {
    const service = this.services.get(name);
    return service && service.healthy ? service : null;
  }

  getAllServices() {
    return Array.from(this.services.entries()).map(([name, service]) => ({
      name,
      url: service.url,
      healthy: service.healthy,
      lastCheck: service.lastCheck,
      responseTime: service.responseTime,
    }));
  }
}

// Load Balancer intelligent
class IntelligentLoadBalancer {
  constructor(serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
    this.requestCounts = new Map();
  }

  async routeRequest(serviceType, request, response) {
    const service = this.serviceRegistry.getHealthyService(serviceType);
    
    if (!service) {
      throw new Error(`Service ${serviceType} non disponible`);
    }

    // Incrémenter le compteur de requêtes
    this.requestCounts.set(serviceType, (this.requestCounts.get(serviceType) || 0) + 1);

    // Log de la requête
    logger.info('Routing request', {
      service: serviceType,
      url: service.url,
      method: request.method,
      path: request.path,
    });

    return service.url;
  }

  getStats() {
    return {
      requestCounts: Object.fromEntries(this.requestCounts),
      services: this.serviceRegistry.getAllServices(),
    };
  }
}

// Cache intelligent avec TTL
class IntelligentCache {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 heure
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidate error', { pattern, error: error.message });
      return 0;
    }
  }
}

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware de validation des requêtes
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

// Application Express
const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use(limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Métriques Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(await prometheus.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Initialisation des services
const serviceRegistry = new ServiceRegistry();
const loadBalancer = new IntelligentLoadBalancer(serviceRegistry);
const cache = new IntelligentCache(redisCache);

// Enregistrement des services
Object.entries(config.services).forEach(([name, url]) => {
  serviceRegistry.registerService(name, url);
});

// Routes principales
app.get('/health', (req, res) => {
  const services = serviceRegistry.getAllServices();
  const healthyServices = services.filter(s => s.healthy).length;
  const totalServices = services.length;
  
  res.json({
    status: 'healthy',
    service: 'gateway',
    timestamp: new Date().toISOString(),
    services: {
      total: totalServices,
      healthy: healthyServices,
      unhealthy: totalServices - healthyServices,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get('/services', (req, res) => {
  res.json({
    services: serviceRegistry.getAllServices(),
    stats: loadBalancer.getStats(),
  });
});

// Route de documentation principale
app.post('/api/v1/docs/generate', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { code, filename, language, doc_type, custom_prompt, user_id, project_id } = req.body;
    
    // Validation des paramètres
    if (!code || !filename) {
      return res.status(400).json({ error: 'Code et filename requis' });
    }

    // Déterminer le service approprié basé sur le langage
    const serviceMap = {
      'python': 'python',
      'javascript': 'javascript',
      'typescript': 'javascript',
      'java': 'java',
      'kotlin': 'java',
      'c': 'rust',
      'cpp': 'rust',
      'rust': 'rust',
      'go': 'rust',
      'html': 'web',
      'css': 'web',
      'scss': 'web',
      'vue': 'web',
      'svelte': 'web',
    };

    const serviceType = serviceMap[language.toLowerCase()] || 'python';
    
    // Vérifier le cache
    const cacheKey = `doc:${Buffer.from(`${filename}:${code}`).toString('base64')}`;
    const cachedResult = await cache.get(cacheKey);
    
    if (cachedResult) {
      logger.info('Cache hit', { filename, service: serviceType });
      return res.json({ ...cachedResult, cache_hit: true });
    }

    // Router vers le service approprié
    const serviceUrl = await loadBalancer.routeRequest(serviceType, req, res);
    
    // Appel au service
    const response = await fetch(`${serviceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      },
      body: JSON.stringify({
        code,
        filename,
        language,
        doc_type,
        custom_prompt,
        user_id,
        project_id,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Service ${serviceType} error: ${error}`);
    }

    const result = await response.json();
    
    // Mettre en cache
    await cache.set(cacheKey, result);
    
    // Métriques
    const duration = Date.now() - startTime;
    httpRequestDurationMicroseconds.observe({ method: 'POST', route: '/api/v1/docs/generate', code: 200 }, duration / 1000);
    httpRequestsTotal.inc({ method: 'POST', route: '/api/v1/docs/generate', code: 200 });
    
    logger.info('Documentation generated', {
      filename,
      service: serviceType,
      duration,
      quality_score: result.quality_score,
    });

    res.json({ ...result, cache_hit: false });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    httpRequestDurationMicroseconds.observe({ method: 'POST', route: '/api/v1/docs/generate', code: 500 }, duration / 1000);
    httpRequestsTotal.inc({ method: 'POST', route: '/api/v1/docs/generate', code: 500 });
    
    logger.error('Documentation generation error', {
      error: error.message,
      stack: error.stack,
      duration,
    });
    
    res.status(500).json({ error: 'Erreur lors de la génération de documentation' });
  }
});

// Route d'analyse de code
app.post('/api/v1/docs/analyze', authenticateToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { code, filename, language } = req.body;
    
    if (!code || !filename) {
      return res.status(400).json({ error: 'Code et filename requis' });
    }

    const serviceMap = {
      'python': 'python',
      'javascript': 'javascript',
      'typescript': 'javascript',
      'java': 'java',
      'kotlin': 'java',
      'c': 'rust',
      'cpp': 'rust',
      'rust': 'rust',
      'go': 'rust',
    };

    const serviceType = serviceMap[language.toLowerCase()] || 'python';
    const serviceUrl = await loadBalancer.routeRequest(serviceType, req, res);
    
    const response = await fetch(`${serviceUrl}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization,
      },
      body: JSON.stringify({ code, filename, language }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Service ${serviceType} error: ${error}`);
    }

    const result = await response.json();
    
    const duration = Date.now() - startTime;
    httpRequestDurationMicroseconds.observe({ method: 'POST', route: '/api/v1/docs/analyze', code: 200 }, duration / 1000);
    httpRequestsTotal.inc({ method: 'POST', route: '/api/v1/docs/analyze', code: 200 });
    
    logger.info('Code analysis completed', {
      filename,
      service: serviceType,
      duration,
    });

    res.json(result);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    httpRequestDurationMicroseconds.observe({ method: 'POST', route: '/api/v1/docs/analyze', code: 500 }, duration / 1000);
    httpRequestsTotal.inc({ method: 'POST', route: '/api/v1/docs/analyze', code: 500 });
    
    logger.error('Code analysis error', {
      error: error.message,
      stack: error.stack,
      duration,
    });
    
    res.status(500).json({ error: 'Erreur lors de l\'analyse de code' });
  }
});

// Route pour récupérer une documentation
app.get('/api/v1/docs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier le cache
    const cacheKey = `doc:${id}`;
    const cachedResult = await cache.get(cacheKey);
    
    if (cachedResult) {
      return res.json({ ...cachedResult, cache_hit: true });
    }
    
    // TODO: Récupérer depuis la base de données
    res.status(404).json({ error: 'Documentation non trouvée' });
    
  } catch (error) {
    logger.error('Get documentation error', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Route pour les analytics
app.get('/api/v1/analytics/usage', authenticateToken, async (req, res) => {
  try {
    const stats = loadBalancer.getStats();
    const services = serviceRegistry.getAllServices();
    
    res.json({
      services,
      request_counts: stats.requestCounts,
      cache_stats: {
        // TODO: Ajouter les stats de cache
      },
    });
    
  } catch (error) {
    logger.error('Analytics error', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
  }
});

// Route pour invalider le cache
app.post('/api/v1/cache/invalidate', authenticateToken, async (req, res) => {
  try {
    const { pattern } = req.body;
    const invalidatedCount = await cache.invalidate(pattern || '*');
    
    logger.info('Cache invalidated', { pattern, count: invalidatedCount });
    
    res.json({ 
      message: 'Cache invalidé avec succès',
      invalidated_count: invalidatedCount 
    });
    
  } catch (error) {
    logger.error('Cache invalidation error', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'invalidation du cache' });
  }
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });
  
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Gestionnaire pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const startServer = () => {
  const server = app.listen(config.port, () => {
    logger.info('Gateway démarré', {
      port: config.port,
      pid: process.pid,
      nodeVersion: process.version,
      uptime: process.uptime(),
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM reçu, arrêt gracieux...');
    server.close(() => {
      logger.info('Serveur arrêté');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT reçu, arrêt gracieux...');
    server.close(() => {
      logger.info('Serveur arrêté');
      process.exit(0);
    });
  });
};

// Clustering pour la production
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  
  logger.info(`Master ${process.pid} démarré`);
  logger.info(`Démarrage de ${numCPUs} workers...`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} mort (${signal || code}). Redémarrage...`);
    cluster.fork();
  });
} else {
  startServer();
}

module.exports = app; 