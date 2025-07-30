import { Pool, PoolClient } from 'pg';
import config from '@/config';
import logger from '@/utils/logger';

class DatabaseService {
  private pool: Pool | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.username,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: config.database.maxConnections,
        idleTimeoutMillis: config.database.idleTimeoutMillis,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', { error: err.message });
        this.isConnected = false;
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      logger.info('Connected to PostgreSQL database');
      
      // Initialize tables
      await this.initializeTables();
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Disconnected from PostgreSQL');
    }
  }

  private async initializeTables(): Promise<void> {
    try {
      const client = await this.getClient();
      
      // Create analysis_results table
      await client.query(`
        CREATE TABLE IF NOT EXISTS analysis_results (
          id SERIAL PRIMARY KEY,
          request_hash VARCHAR(64) UNIQUE NOT NULL,
          language VARCHAR(20) NOT NULL,
          code_length INTEGER NOT NULL,
          analysis_data JSONB NOT NULL,
          processing_time_ms INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create analysis_metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS analysis_metrics (
          id SERIAL PRIMARY KEY,
          analysis_id INTEGER REFERENCES analysis_results(id),
          metric_name VARCHAR(50) NOT NULL,
          metric_value DECIMAL(10,4) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create cache_stats table
      await client.query(`
        CREATE TABLE IF NOT EXISTS cache_stats (
          id SERIAL PRIMARY KEY,
          cache_key VARCHAR(255) NOT NULL,
          hit_count INTEGER DEFAULT 0,
          miss_count INTEGER DEFAULT 0,
          last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_analysis_results_hash ON analysis_results(request_hash);
        CREATE INDEX IF NOT EXISTS idx_analysis_results_language ON analysis_results(language);
        CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);
        CREATE INDEX IF NOT EXISTS idx_analysis_metrics_analysis_id ON analysis_metrics(analysis_id);
        CREATE INDEX IF NOT EXISTS idx_cache_stats_key ON cache_stats(cache_key);
      `);

      client.release();
      logger.info('Database tables initialized successfully');
    } catch (error) {
      logger.error('Error initializing database tables', { error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    return await this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Database query executed', {
        query: text,
        duration,
        rowCount: result.rowCount,
      });
      
      return result;
    } catch (error) {
      logger.error('Database query error', { query: text, error });
      throw error;
    }
  }

  async saveAnalysisResult(data: {
    requestHash: string;
    language: string;
    codeLength: number;
    analysisData: any;
    processingTime: number;
  }): Promise<void> {
    const { requestHash, language, codeLength, analysisData, processingTime } = data;
    
    try {
      await this.query(
        `INSERT INTO analysis_results (request_hash, language, code_length, analysis_data, processing_time_ms)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (request_hash) 
         DO UPDATE SET 
           analysis_data = EXCLUDED.analysis_data,
           processing_time_ms = EXCLUDED.processing_time_ms,
           updated_at = CURRENT_TIMESTAMP`,
        [requestHash, language, codeLength, JSON.stringify(analysisData), processingTime]
      );
      
      logger.debug('Analysis result saved to database', { requestHash });
    } catch (error) {
      logger.error('Error saving analysis result', { requestHash, error });
      throw error;
    }
  }

  async getAnalysisResult(requestHash: string): Promise<any | null> {
    try {
      const result = await this.query(
        'SELECT * FROM analysis_results WHERE request_hash = $1',
        [requestHash]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          ...row,
          analysis_data: JSON.parse(row.analysis_data),
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting analysis result', { requestHash, error });
      return null;
    }
  }

  async saveMetrics(analysisId: number, metrics: Record<string, number>): Promise<void> {
    try {
      const client = await this.getClient();
      
      for (const [metricName, metricValue] of Object.entries(metrics)) {
        await client.query(
          'INSERT INTO analysis_metrics (analysis_id, metric_name, metric_value) VALUES ($1, $2, $3)',
          [analysisId, metricName, metricValue]
        );
      }
      
      client.release();
      logger.debug('Metrics saved to database', { analysisId });
    } catch (error) {
      logger.error('Error saving metrics', { analysisId, error });
      throw error;
    }
  }

  async updateCacheStats(cacheKey: string, isHit: boolean): Promise<void> {
    try {
      if (isHit) {
        await this.query(
          `INSERT INTO cache_stats (cache_key, hit_count) VALUES ($1, 1)
           ON CONFLICT (cache_key) 
           DO UPDATE SET 
             hit_count = cache_stats.hit_count + 1,
             last_accessed = CURRENT_TIMESTAMP`,
          [cacheKey]
        );
      } else {
        await this.query(
          `INSERT INTO cache_stats (cache_key, miss_count) VALUES ($1, 1)
           ON CONFLICT (cache_key) 
           DO UPDATE SET 
             miss_count = cache_stats.miss_count + 1,
             last_accessed = CURRENT_TIMESTAMP`,
          [cacheKey]
        );
      }
    } catch (error) {
      logger.error('Error updating cache stats', { cacheKey, isHit, error });
    }
  }

  async getStats(): Promise<{
    totalAnalyses: number;
    averageProcessingTime: number;
    cacheHitRate: number;
    topLanguages: Array<{ language: string; count: number }>;
  }> {
    try {
      const [analysesResult, cacheResult, languagesResult] = await Promise.all([
        this.query(`
          SELECT 
            COUNT(*) as total_analyses,
            AVG(processing_time_ms) as avg_processing_time
          FROM analysis_results
        `),
        this.query(`
          SELECT 
            SUM(hit_count) as total_hits,
            SUM(miss_count) as total_misses
          FROM cache_stats
        `),
        this.query(`
          SELECT 
            language,
            COUNT(*) as count
          FROM analysis_results
          GROUP BY language
          ORDER BY count DESC
          LIMIT 5
        `),
      ]);

      const totalHits = parseInt(cacheResult.rows[0]?.total_hits || '0');
      const totalMisses = parseInt(cacheResult.rows[0]?.total_misses || '0');
      const totalRequests = totalHits + totalMisses;
      const cacheHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

      return {
        totalAnalyses: parseInt(analysesResult.rows[0]?.total_analyses || '0'),
        averageProcessingTime: parseFloat(analysesResult.rows[0]?.avg_processing_time || '0'),
        cacheHitRate,
        topLanguages: languagesResult.rows.map((row: any) => ({
          language: row.language,
          count: parseInt(row.count),
        })),
      };
    } catch (error) {
      logger.error('Error getting database stats', { error });
      return {
        totalAnalyses: 0,
        averageProcessingTime: 0,
        cacheHitRate: 0,
        topLanguages: [],
      };
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export default new DatabaseService(); 