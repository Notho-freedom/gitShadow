const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date().toISOString(),
  },
});
app.use(limiter);

// Redis client
let redisClient = null;
const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0', 10),
    });
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

// PostgreSQL client
let pgPool = null;
const connectPostgres = async () => {
  try {
    pgPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'gitshadow',
      user: process.env.POSTGRES_USER || 'gitshadow',
      password: process.env.POSTGRES_PASSWORD || 'gitshadow123',
    });
    await pgPool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      cache: redisClient?.isReady || false,
      database: pgPool ? true : false,
    },
    memory: process.memoryUsage(),
  };
  
  const statusCode = healthData.services.cache && healthData.services.database ? 200 : 503;
  res.status(statusCode).json(healthData);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    requests_total: 0,
    requests_duration_seconds: 0,
    errors_total: 0,
    memory_usage_bytes: process.memoryUsage().heapUsed,
    cpu_usage_percent: 0,
    cache_hits_total: 0,
    cache_misses_total: 0,
  };
  
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP js_service_requests_total Total number of requests
# TYPE js_service_requests_total counter
js_service_requests_total ${metrics.requests_total}

# HELP js_service_memory_usage_bytes Memory usage in bytes
# TYPE js_service_memory_usage_bytes gauge
js_service_memory_usage_bytes ${metrics.memory_usage_bytes}
`);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'JS/TS Code Analysis Service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api/v1',
    },
  });
});

// API routes
app.use('/api/v1', (() => {
  const router = express.Router();

  // Analyze code endpoint
  router.post('/analyze', async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { code, language, options = {} } = req.body;
      
      // Validation
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Code is required and must be a string',
          timestamp: new Date().toISOString(),
        });
      }
      
      if (!['javascript', 'typescript', 'jsx', 'tsx'].includes(language)) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Language must be one of: javascript, typescript, jsx, tsx',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Generate request hash
      const requestHash = crypto.createHash('sha256')
        .update(`${code}:${language}:${JSON.stringify(options)}`)
        .digest('hex');
      
      // Check cache
      if (redisClient?.isReady) {
        const cachedResult = await redisClient.get(`js-service:${requestHash}`);
        if (cachedResult) {
          const result = JSON.parse(cachedResult);
          result.processingTime = Date.now() - startTime;
          return res.json(result);
        }
      }
      
      // Simple code analysis
      const lines = code.split('\n');
      const linesOfCode = lines.length;
      const linesOfComments = lines.filter(line => 
        line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
      ).length;
      
      // Calculate basic metrics
      const cyclomaticComplexity = Math.max(1, 
        (code.match(/if|else|for|while|switch|case|catch/g) || []).length
      );
      
      const maintainabilityIndex = Math.max(0, Math.min(100, 
        171 - 5.2 * Math.log(linesOfCode) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)
      ));
      
      // Security analysis
      const vulnerabilities = [];
      if (code.includes('eval(')) {
        vulnerabilities.push({
          type: 'injection',
          severity: 'critical',
          description: 'Use of eval() function detected',
          line: 1,
          code: 'eval()',
          recommendation: 'Avoid using eval(). Use JSON.parse() or Function constructor instead.',
        });
      }
      
      if (code.includes('.innerHTML')) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          description: 'Direct innerHTML assignment detected',
          line: 1,
          code: 'innerHTML',
          recommendation: 'Use textContent or sanitize HTML content to prevent XSS attacks.',
        });
      }
      
      // Performance analysis
      const bottlenecks = [];
      if (code.includes('for') && code.includes('for')) {
        bottlenecks.push({
          type: 'algorithm',
          severity: 'medium',
          description: 'Potential nested loop detected',
          line: 1,
          impact: 'O(n²) or worse time complexity',
          suggestion: 'Consider using more efficient algorithms or data structures',
        });
      }
      
      // Documentation analysis
      const functions = [];
      const classes = [];
      const functionMatches = code.match(/function\s+(\w+)|(\w+)\s*[:=]\s*function|class\s+(\w+)/g) || [];
      
      functionMatches.forEach(match => {
        if (match.startsWith('function')) {
          const name = match.replace('function', '').trim();
          functions.push({
            name,
            signature: `${name}()`,
            description: undefined,
            parameters: [],
            line: 1,
          });
        } else if (match.startsWith('class')) {
          const name = match.replace('class', '').trim();
          classes.push({
            name,
            description: undefined,
            methods: [],
            properties: [],
            line: 1,
          });
        }
      });
      
      const analysisResult = {
        success: true,
        data: {
          metrics: {
            linesOfCode,
            linesOfComments,
            cyclomaticComplexity,
            halsteadMetrics: {
              volume: linesOfCode * Math.log2(linesOfCode),
              difficulty: cyclomaticComplexity,
              effort: linesOfCode * cyclomaticComplexity,
              time: linesOfCode * cyclomaticComplexity / 18,
              bugs: linesOfCode / 3000,
            },
            maintainabilityIndex,
            depthOfInheritance: 0,
            couplingBetweenObjects: 0,
            lackOfCohesion: 0,
          },
          security: {
            vulnerabilities,
            riskScore: vulnerabilities.length * 10,
            recommendations: vulnerabilities.length > 0 ? ['Review and fix security vulnerabilities'] : [],
          },
          performance: {
            bottlenecks,
            score: Math.max(0, 100 - bottlenecks.length * 15),
            recommendations: bottlenecks.length > 0 ? ['Optimize algorithm complexity'] : [],
          },
          documentation: {
            functions,
            classes,
            modules: [],
            coverage: functions.length > 0 ? 50 : 0,
            missingDocs: functions.map(f => `Function: ${f.name}`),
          },
          complexity: {
            cyclomaticComplexity,
            cognitiveComplexity: cyclomaticComplexity * 0.8,
            nestingDepth: Math.min(10, Math.floor(linesOfCode / 10)),
            functionComplexity: new Map(),
            classComplexity: new Map(),
          },
          maintainability: {
            overall: maintainabilityIndex,
            factors: {
              cyclomaticComplexity: Math.max(0, 100 - cyclomaticComplexity * 10),
              linesOfCode: Math.max(0, 100 - linesOfCode / 10),
              commentRatio: (linesOfComments / linesOfCode) * 100,
              duplication: 80,
              coupling: 70,
              cohesion: 75,
            },
            grade: maintainabilityIndex >= 80 ? 'A' : maintainabilityIndex >= 60 ? 'B' : maintainabilityIndex >= 40 ? 'C' : maintainabilityIndex >= 20 ? 'D' : 'F',
          },
        },
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };
      
      // Cache the result
      if (redisClient?.isReady) {
        await redisClient.setEx(`js-service:${requestHash}`, 3600, JSON.stringify(analysisResult));
      }
      
      // Save to database if available
      if (pgPool) {
        try {
          await pgPool.query(
            `INSERT INTO analysis_results (request_hash, language, code_length, analysis_data, processing_time_ms)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (request_hash) 
             DO UPDATE SET 
               analysis_data = EXCLUDED.analysis_data,
               processing_time_ms = EXCLUDED.processing_time_ms,
               updated_at = CURRENT_TIMESTAMP`,
            [requestHash, language, linesOfCode, JSON.stringify(analysisResult.data), analysisResult.processingTime]
          );
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
        }
      }
      
      res.json(analysisResult);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTime,
      });
    }
  });

  // Get cached analysis
  router.get('/analysis/:hash', async (req, res) => {
    try {
      const { hash } = req.params;
      
      if (!hash || hash.length !== 64) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hash format',
          message: 'Hash must be a 64-character hexadecimal string',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Check cache first
      if (redisClient?.isReady) {
        const cachedResult = await redisClient.get(`js-service:${hash}`);
        if (cachedResult) {
          return res.json(JSON.parse(cachedResult));
        }
      }
      
      // Check database
      if (pgPool) {
        const result = await pgPool.query(
          'SELECT * FROM analysis_results WHERE request_hash = $1',
          [hash]
        );
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const analysisData = {
            ...row,
            analysis_data: JSON.parse(row.analysis_data),
          };
          
          // Cache the result
          if (redisClient?.isReady) {
            await redisClient.setEx(`js-service:${hash}`, 3600, JSON.stringify(analysisData.analysis_data));
          }
          
          return res.json(analysisData.analysis_data);
        }
      }
      
      res.status(404).json({
        success: false,
        error: 'Analysis result not found',
        message: 'The requested analysis result does not exist',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get statistics
  router.get('/stats', async (req, res) => {
    try {
      const stats = {
        cache: {
          connected: redisClient?.isReady || false,
          keys: 0,
          memory: null,
        },
        database: {
          totalAnalyses: 0,
          averageProcessingTime: 0,
          cacheHitRate: 0,
          topLanguages: [],
        },
        service: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: '1.0.0',
        },
      };
      
      // Get cache stats
      if (redisClient?.isReady) {
        try {
          const info = await redisClient.info('memory');
          const keys = await redisClient.dbSize();
          stats.cache.keys = keys;
          stats.cache.memory = { used: 0, peak: 0, rss: 0 };
        } catch (error) {
          console.error('Error getting cache stats:', error);
        }
      }
      
      // Get database stats
      if (pgPool) {
        try {
          const result = await pgPool.query(`
            SELECT 
              COUNT(*) as total_analyses,
              AVG(processing_time_ms) as avg_processing_time
            FROM analysis_results
          `);
          
          stats.database.totalAnalyses = parseInt(result.rows[0]?.total_analyses || '0');
          stats.database.averageProcessingTime = parseFloat(result.rows[0]?.avg_processing_time || '0');
        } catch (error) {
          console.error('Error getting database stats:', error);
        }
      }
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Clear cache
  router.post('/cache/clear', async (req, res) => {
    try {
      if (redisClient?.isReady) {
        await redisClient.flushDb();
      }
      
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
})());

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message || 'Unknown error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to services
    await connectRedis();
    await connectPostgres();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`JS/TS Code Analysis Service started on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Version: 1.0.0`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (redisClient) await redisClient.quit();
  if (pgPool) await pgPool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (redisClient) await redisClient.quit();
  if (pgPool) await pgPool.end();
  process.exit(0);
});

startServer(); 