import request from 'supertest';
import express from 'express';
import AnalysisController from '../../controllers/analysisController';

// Mock the services before importing the controller
jest.mock('../../services/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  isHealthy: jest.fn(() => true),
  flush: jest.fn(),
}));

jest.mock('../../services/database', () => ({
  saveAnalysisResult: jest.fn(),
  updateCacheStats: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  getStats: jest.fn(() => ({
    totalAnalyses: 10,
    averageProcessingTime: 150,
    cacheHitRate: 0.8,
    topLanguages: ['javascript', 'typescript'],
  })),
  isHealthy: jest.fn(() => true),
}));

jest.mock('../../services/codeAnalyzer', () => ({
  analyzeCode: jest.fn(() => ({
    success: true,
    data: {
      metrics: {
        linesOfCode: 50,
        cyclomaticComplexity: 3,
      },
    },
    timestamp: new Date().toISOString(),
    processingTime: 100,
  })),
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../utils/metrics', () => ({
  analysisTotal: {
    inc: jest.fn(),
  },
  analysisDuration: {
    observe: jest.fn(),
  },
}));

const app = express();
app.use(express.json());

// Add routes with correct prefixes
app.post('/api/v1/analyze', AnalysisController.validationRules, AnalysisController.analyzeCode);
app.get('/api/v1/analysis/:hash', AnalysisController.getCachedAnalysis);
app.get('/api/v1/stats', AnalysisController.getAnalysisStats);
app.post('/api/v1/cache/clear', AnalysisController.clearCache);
app.get('/health', AnalysisController.healthCheck);

// Add error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

describe('AnalysisController', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Get mocked services
    const cache = require('../../services/cache');
    const database = require('../../services/database');
    const codeAnalyzer = require('../../services/codeAnalyzer');
    
    // Reset mock implementations
    cache.get.mockResolvedValue(null); // No cached result by default
    cache.set.mockResolvedValue(undefined);
    cache.flush.mockResolvedValue(undefined);
    cache.isHealthy.mockReturnValue(true);
    
    database.saveAnalysisResult.mockResolvedValue(undefined);
    database.updateCacheStats.mockResolvedValue(undefined);
    database.getStats.mockResolvedValue({
      totalAnalyses: 10,
      averageProcessingTime: 150,
      cacheHitRate: 0.8,
      topLanguages: ['javascript', 'typescript'],
    });
    database.isHealthy.mockReturnValue(true);
    
    codeAnalyzer.analyzeCode.mockResolvedValue({
      success: true,
      data: {
        metrics: {
          linesOfCode: 50,
          cyclomaticComplexity: 3,
        },
      },
      timestamp: new Date().toISOString(),
      processingTime: 100,
    });
  });

  describe('POST /analyze', () => {
    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({
          code: 'function test() {}',
          language: 'python', // Invalid language
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({
          language: 'javascript',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for code too long', async () => {
      const longCode = 'a'.repeat(100001); // Exceeds 100,000 character limit

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({
          code: longCode,
          language: 'javascript',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /analysis/:hash', () => {
    it('should return 400 for invalid hash format', async () => {
      const response = await request(app)
        .get('/api/v1/analysis/invalid-hash')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid hash format');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
      expect(response.body.services.cache).toBe(true);
      expect(response.body.services.database).toBe(true);
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });
  });
}); 