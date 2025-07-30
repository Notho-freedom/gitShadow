import express from 'express';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from '@/config';
import logger from '@/utils/logger';
import { initializeMetrics, getMetrics, metricsMiddleware } from '@/utils/metrics';
import cacheService from '@/services/cache';
import databaseService from '@/services/database';
import AnalysisController from '@/controllers/analysisController';
import { errorHandler, notFoundHandler, setupErrorHandlers } from '@/middleware/errorHandler';
import { securityMiddlewares } from '@/middleware/security';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JS/TS Code Analysis Service API',
      version: '1.0.0',
      description: 'Robust JavaScript/TypeScript code analysis service with AST parsing, security analysis, and documentation generation',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

class App {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  private setupMiddlewares(): void {
    // Security middlewares
    this.app.use(securityMiddlewares.helmet);
    this.app.use(securityMiddlewares.cors);
    this.app.use(securityMiddlewares.requestId);
    this.app.use(securityMiddlewares.securityHeaders);
    this.app.use(securityMiddlewares.sanitizeInput);
    this.app.use(securityMiddlewares.validateContentLength);
    this.app.use(securityMiddlewares.requestLogger);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Metrics middleware
    this.app.use(metricsMiddleware);

    // General rate limiting
    this.app.use(securityMiddlewares.generalRateLimiter);
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', AnalysisController.healthCheck);

    // Metrics endpoint (Prometheus)
    this.app.get('/metrics', async (_req, res) => {
      try {
        const metrics = await getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
      } catch (error) {
        logger.error('Error generating metrics', { error });
        res.status(500).send('Error generating metrics');
      }
    });

    // API documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // API routes
    this.app.use('/api/v1', this.setupApiRoutes());

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        service: 'JS/TS Code Analysis Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          metrics: '/metrics',
          docs: '/api-docs',
          api: '/api/v1',
        },
      });
    });
  }

  private setupApiRoutes(): express.Router {
    const router = express.Router();

    /**
     * @swagger
     * /api/v1/analyze:
     *   post:
     *     summary: Analyze JavaScript/TypeScript code
     *     description: Performs comprehensive code analysis including AST parsing, metrics calculation, security analysis, and documentation generation
     *     tags: [Analysis]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - code
     *               - language
     *             properties:
     *               code:
     *                 type: string
     *                 description: The source code to analyze
     *               language:
     *                 type: string
     *                 enum: [javascript, typescript, jsx, tsx]
     *                 description: The programming language
     *               options:
     *                 type: object
     *                 properties:
     *                   includeAST:
     *                     type: boolean
     *                     description: Include AST in response
     *                   includeMetrics:
     *                     type: boolean
     *                     description: Include code metrics
     *                   includeSecurity:
     *                     type: boolean
     *                     description: Include security analysis
     *                   includePerformance:
     *                     type: boolean
     *                     description: Include performance analysis
     *                   includeDocumentation:
     *                     type: boolean
     *                     description: Include documentation generation
     *     responses:
     *       200:
     *         description: Analysis completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 timestamp:
     *                   type: string
     *                 processingTime:
     *                   type: number
     *       400:
     *         description: Validation error
     *       429:
     *         description: Rate limit exceeded
     *       500:
     *         description: Internal server error
     */
    router.post(
      '/analyze',
      securityMiddlewares.analysisRateLimiter,
      AnalysisController.validationRules,
      AnalysisController.analyzeCode
    );

    /**
     * @swagger
     * /api/v1/analysis/{hash}:
     *   get:
     *     summary: Get cached analysis result
     *     description: Retrieve a previously cached analysis result by its hash
     *     tags: [Cache]
     *     parameters:
     *       - in: path
     *         name: hash
     *         required: true
     *         schema:
     *           type: string
     *         description: The hash of the analysis result
     *     responses:
     *       200:
     *         description: Analysis result found
     *       404:
     *         description: Analysis result not found
     *       500:
     *         description: Internal server error
     */
    router.get('/analysis/:hash', AnalysisController.getCachedAnalysis);

    /**
     * @swagger
     * /api/v1/stats:
     *   get:
     *     summary: Get service statistics
     *     description: Retrieve comprehensive service statistics including cache and database metrics
     *     tags: [Statistics]
     *     responses:
     *       200:
     *         description: Statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                 timestamp:
     *                   type: string
     *       500:
     *         description: Internal server error
     */
    router.get('/stats', AnalysisController.getAnalysisStats);

    /**
     * @swagger
     * /api/v1/cache/clear:
     *   post:
     *     summary: Clear cache
     *     description: Clear all cached analysis results
     *     tags: [Cache]
     *     responses:
     *       200:
     *         description: Cache cleared successfully
     *       500:
     *         description: Internal server error
     */
    router.post('/cache/clear', AnalysisController.clearCache);

    return router;
  }

  private setupErrorHandlers(): void {
    // 404 handler (must be last)
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    try {
      // Initialize services
      logger.info('Initializing JS/TS Code Analysis Service...');
      
      // Initialize metrics
      initializeMetrics();
      
      // Connect to cache
      await cacheService.connect();
      logger.info('Cache service connected');
      
      // Connect to database
      await databaseService.connect();
      logger.info('Database service connected');
      
      // Setup global error handlers
      setupErrorHandlers();
      
      // Start server
      this.app.listen(config.port, () => {
        logger.info(`JS/TS Code Analysis Service started on port ${config.port}`, {
          port: config.port,
          environment: config.environment,
          version: '1.0.0',
        });
      });
    } catch (error) {
      logger.error('Failed to start service', { error });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      logger.info('Shutting down JS/TS Code Analysis Service...');
      
      // Disconnect services
      await cacheService.disconnect();
      await databaseService.disconnect();
      
      logger.info('Service stopped gracefully');
    } catch (error) {
      logger.error('Error during shutdown', { error });
    }
  }

  getApp(): express.Application {
    return this.app;
  }
}

// Create and start the application
const app = new App();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Start the application
app.start().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});

export default app; 