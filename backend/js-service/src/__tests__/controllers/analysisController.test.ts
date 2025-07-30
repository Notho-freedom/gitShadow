import request from 'supertest';
import express from 'express';
import AnalysisController from '../../controllers/analysisController';

const app = express();
app.use(express.json());

// Add routes
app.post('/analyze', AnalysisController.analyzeCode);
app.get('/analysis/:hash', AnalysisController.getCachedAnalysis);
app.get('/stats', AnalysisController.getAnalysisStats);
app.post('/cache/clear', AnalysisController.clearCache);
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

// Mock the services
jest.mock('../../services/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  isHealthy: jest.fn(() => true),
}));

jest.mock('../../services/database', () => ({
  saveAnalysisResult: jest.fn(),
  updateCacheStats: jest.fn(),
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

describe('AnalysisController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /analyze', () => {
    it('should analyze code successfully', async () => {
      const testCode = `
        function add(a, b) {
          return a + b;
        }
      `;

      const response = await request(app)
        .post('/analyze')
        .send({
          code: testCode,
          language: 'javascript',
          options: {
            includeMetrics: true,
            includeSecurity: true,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.processingTime).toBeDefined();
    });

    it('should return 400 for invalid language', async () => {
      const response = await request(app)
        .post('/analyze')
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
        .post('/analyze')
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
        .post('/analyze')
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
        .get('/analysis/invalid-hash')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid hash format');
    });

    it('should return 404 for non-existent hash', async () => {
      const validHash = 'a'.repeat(64); // 64-character hash

      const response = await request(app)
        .get(`/analysis/${validHash}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Analysis result not found');
    });
  });

  describe('GET /stats', () => {
    it('should return service statistics', async () => {
      const response = await request(app)
        .get('/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.cache).toBeDefined();
      expect(response.body.data.database).toBeDefined();
      expect(response.body.data.service).toBeDefined();
    });
  });

  describe('POST /cache/clear', () => {
    it('should clear cache successfully', async () => {
      const response = await request(app)
        .post('/cache/clear')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cache cleared successfully');
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
    });
  });
}); 