import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import logger from '@/utils/logger';
import codeAnalyzer from '@/services/codeAnalyzer';
import cacheService from '@/services/cache';
import databaseService from '@/services/database';
import { CodeAnalysisRequest, CodeAnalysisResponse } from '@/types';
import { analysisTotal, analysisDuration } from '@/utils/metrics';

class AnalysisController {
  // Validation rules for code analysis requests
  static validationRules = [
    body('code')
      .isString()
      .notEmpty()
      .withMessage('Code is required and must be a string')
      .isLength({ max: 100000 })
      .withMessage('Code must not exceed 100,000 characters'),
    
    body('language')
      .isIn(['javascript', 'typescript', 'jsx', 'tsx'])
      .withMessage('Language must be one of: javascript, typescript, jsx, tsx'),
    
    body('options.includeAST')
      .optional()
      .isBoolean()
      .withMessage('includeAST must be a boolean'),
    
    body('options.includeMetrics')
      .optional()
      .isBoolean()
      .withMessage('includeMetrics must be a boolean'),
    
    body('options.includeSecurity')
      .optional()
      .isBoolean()
      .withMessage('includeSecurity must be a boolean'),
    
    body('options.includePerformance')
      .optional()
      .isBoolean()
      .withMessage('includePerformance must be a boolean'),
    
    body('options.includeDocumentation')
      .optional()
      .isBoolean()
      .withMessage('includeDocumentation must be a boolean'),
  ];

  // Analyze code endpoint
  static async analyzeCode(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Validation error in code analysis request', {
          errors: errors.array(),
          ip: req.ip,
        });
        
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const request: CodeAnalysisRequest = req.body;
      const requestHash = this.generateRequestHash(request);

      logger.info('Code analysis request received', {
        language: request.language,
        codeLength: request.code.length,
        requestHash,
        ip: req.ip,
      });

      // Check cache first
      const cachedResult = await cacheService.get<CodeAnalysisResponse>(requestHash);
      if (cachedResult) {
        logger.info('Returning cached analysis result', { requestHash });
        
        analysisTotal.inc({ language: request.language, success: 'true' });
        analysisDuration.observe({ language: request.language }, (Date.now() - startTime) / 1000);
        
        res.json(cachedResult);
        return;
      }

      // Perform analysis
      const analysisResult = await codeAnalyzer.analyzeCode(request);
      
      if (analysisResult.success) {
        // Cache the result
        await cacheService.set(requestHash, analysisResult);
        
        // Save to database
        try {
          await databaseService.saveAnalysisResult({
            requestHash,
            language: request.language,
            codeLength: request.code.length,
            analysisData: analysisResult.data,
            processingTime: analysisResult.processingTime,
          });
        } catch (dbError) {
          logger.error('Failed to save analysis result to database', { 
            requestHash, 
            error: dbError 
          });
          // Don't fail the request if database save fails
        }
        
        // Update cache stats
        await databaseService.updateCacheStats(requestHash, false); // Miss
        
        logger.info('Code analysis completed successfully', {
          requestHash,
          processingTime: analysisResult.processingTime,
          language: request.language,
        });
      } else {
        // Update cache stats for failed requests
        await databaseService.updateCacheStats(requestHash, false);
        
        logger.error('Code analysis failed', {
          requestHash,
          error: analysisResult.error,
          language: request.language,
        });
      }
      
      res.json(analysisResult);
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Unexpected error in code analysis', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime,
        ip: req.ip,
      });
      
      analysisTotal.inc({ 
        language: req.body?.language || 'unknown', 
        success: 'false' 
      });
      analysisDuration.observe(
        { language: req.body?.language || 'unknown' }, 
        processingTime / 1000
      );
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred during code analysis',
        timestamp: new Date().toISOString(),
        processingTime,
      });
    }
  }

  // Get cached analysis result
  static async getCachedAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const hash = req.params['hash'];
      
      if (!hash || hash.length !== 64) {
        res.status(400).json({
          success: false,
          error: 'Invalid hash format',
          message: 'Hash must be a 64-character hexadecimal string',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      logger.info('Cache lookup request', { hash, ip: req.ip });

      // Check cache first
      const cachedResult = await cacheService.get<CodeAnalysisResponse>(hash);
      if (cachedResult) {
        await databaseService.updateCacheStats(hash, true); // Hit
        logger.info('Cache hit', { hash });
        res.json(cachedResult);
        return;
      }

      // Check database
      const dbResult = await databaseService.getAnalysisResult(hash);
      if (dbResult) {
        // Cache the result for future requests
        await cacheService.set(hash, dbResult.analysis_data);
        await databaseService.updateCacheStats(hash, false); // Miss (but found in DB)
        logger.info('Found analysis result in database', { hash });
        res.json(dbResult.analysis_data);
        return;
      }

      logger.info('Analysis result not found', { hash });
      res.status(404).json({
        success: false,
        error: 'Analysis result not found',
        message: 'The requested analysis result does not exist',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error retrieving cached analysis', {
        error: error instanceof Error ? error.message : 'Unknown error',
        hash: req.params['hash'],
        ip: req.ip,
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving the analysis result',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get analysis statistics
  static async getAnalysisStats(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Statistics request received', { ip: req.ip });

      const [cacheStats, dbStats] = await Promise.all([
        cacheService.getStats(),
        databaseService.getStats(),
      ]);

      const stats = {
        cache: {
          connected: cacheStats.connected,
          keys: cacheStats.keys,
          memory: cacheStats.memory,
        },
        database: {
          totalAnalyses: dbStats.totalAnalyses,
          averageProcessingTime: dbStats.averageProcessingTime,
          cacheHitRate: dbStats.cacheHitRate,
          topLanguages: dbStats.topLanguages,
        },
        service: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.env['npm_package_version'] || '1.0.0',
        },
      };

      logger.info('Statistics retrieved successfully');
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error retrieving statistics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip,
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving statistics',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Clear cache endpoint
  static async clearCache(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Cache clear request received', { ip: req.ip });
      
      await cacheService.flush();
      
      logger.info('Cache cleared successfully');
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error clearing cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip,
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while clearing the cache',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Health check endpoint
  static async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const cacheHealthy = cacheService.isHealthy();
      const dbHealthy = databaseService.isHealthy();
      const status = cacheHealthy && dbHealthy ? 'healthy' : 'degraded';
      
      const healthData = {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env['npm_package_version'] || '1.0.0',
        services: {
          cache: cacheHealthy,
          database: dbHealthy,
        },
        memory: process.memoryUsage(),
      };

      const statusCode = status === 'healthy' ? 200 : 503;
      
      logger.info('Health check completed', { 
        status, 
        cacheHealthy, 
        dbHealthy 
      });
      
      res.status(statusCode).json(healthData);
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private static generateRequestHash(request: CodeAnalysisRequest): string {
    const data = `${request.code}:${request.language}:${JSON.stringify(request.options || {})}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export default AnalysisController; 