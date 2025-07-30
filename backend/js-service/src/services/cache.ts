import { createClient, RedisClientType } from 'redis';
import config from '@/config';
import logger from '@/utils/logger';
import { cacheHitsTotal, cacheMissesTotal } from '@/utils/metrics';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.cache.host,
          port: config.cache.port,
        },
        ...(config.cache.password && { password: config.cache.password }),
        database: config.cache.db,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Disconnected from Redis');
    }
  }

  private getKey(key: string): string {
    return `${config.cache.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not connected, returning null');
      return null;
    }

    try {
      const value = await this.client.get(this.getKey(key));
      if (value) {
        cacheHitsTotal.inc();
        return JSON.parse(value);
      } else {
        cacheMissesTotal.inc();
        return null;
      }
    } catch (error) {
      logger.error('Error getting value from cache', { key, error });
      cacheMissesTotal.inc();
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not connected, skipping set operation');
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const finalTtl = ttl || config.cache.ttl;
      
      await this.client.setEx(this.getKey(key), finalTtl, serializedValue);
      logger.debug('Value cached successfully', { key, ttl: finalTtl });
    } catch (error) {
      logger.error('Error setting value in cache', { key, error });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not connected, skipping delete operation');
      return;
    }

    try {
      await this.client.del(this.getKey(key));
      logger.debug('Value deleted from cache', { key });
    } catch (error) {
      logger.error('Error deleting value from cache', { key, error });
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Error checking if key exists in cache', { key, error });
      return false;
    }
  }

  async flush(): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Redis not connected, skipping flush operation');
      return;
    }

    try {
      await this.client.flushDb();
      logger.info('Cache flushed successfully');
    } catch (error) {
      logger.error('Error flushing cache', { error });
      throw error;
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: any;
  }> {
    if (!this.client || !this.isConnected) {
      return {
        connected: false,
        keys: 0,
        memory: null,
      };
    }

    try {
      const info = await this.client.info('memory');
      const keys = await this.client.dbSize();
      
      return {
        connected: true,
        keys,
        memory: this.parseRedisInfo(info),
      };
    } catch (error) {
      logger.error('Error getting cache stats', { error });
      return {
        connected: false,
        keys: 0,
        memory: null,
      };
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const memory: any = {};
    
    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        memory.used = parseInt(line.split(':')[1] || '0');
      } else if (line.startsWith('used_memory_peak:')) {
        memory.peak = parseInt(line.split(':')[1] || '0');
      } else if (line.startsWith('used_memory_rss:')) {
        memory.rss = parseInt(line.split(':')[1] || '0');
      }
    }
    
    return memory;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

export default new CacheService(); 