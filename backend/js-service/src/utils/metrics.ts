import { register, Counter, Histogram, Gauge } from 'prom-client';
import logger from './logger';

// Counters
export const requestsTotal = new Counter({
  name: 'js_service_requests_total',
  help: 'Total number of requests',
  labelNames: ['method', 'endpoint', 'status'],
});

export const errorsTotal = new Counter({
  name: 'js_service_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'endpoint'],
});

export const cacheHitsTotal = new Counter({
  name: 'js_service_cache_hits_total',
  help: 'Total number of cache hits',
});

export const cacheMissesTotal = new Counter({
  name: 'js_service_cache_misses_total',
  help: 'Total number of cache misses',
});

export const analysisTotal = new Counter({
  name: 'js_service_analysis_total',
  help: 'Total number of code analyses',
  labelNames: ['language', 'success'],
});

// Histograms
export const requestDuration = new Histogram({
  name: 'js_service_request_duration_seconds',
  help: 'Request duration in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const analysisDuration = new Histogram({
  name: 'js_service_analysis_duration_seconds',
  help: 'Code analysis duration in seconds',
  labelNames: ['language'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

// Gauges
export const memoryUsage = new Gauge({
  name: 'js_service_memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

export const cpuUsage = new Gauge({
  name: 'js_service_cpu_usage_percent',
  help: 'CPU usage percentage',
});

export const activeConnections = new Gauge({
  name: 'js_service_active_connections',
  help: 'Number of active connections',
});

// Update system metrics
export const updateSystemMetrics = (): void => {
  const memUsage = process.memoryUsage();
  memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
  memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
  memoryUsage.set({ type: 'rss' }, memUsage.rss);
  memoryUsage.set({ type: 'external' }, memUsage.external);
};

// Metrics endpoint handler
export const getMetrics = async (): Promise<string> => {
  try {
    updateSystemMetrics();
    return await register.metrics();
  } catch (error) {
    logger.error('Error generating metrics', { error });
    throw error;
  }
};

// Middleware to track requests
export const metricsMiddleware = (req: any, res: any, next: any): void => {
  const start = Date.now();
  const { method, path } = req;

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const status = res.statusCode;

    requestsTotal.inc({ method, endpoint: path, status });
    requestDuration.observe({ method, endpoint: path }, duration);

    if (status >= 400) {
      errorsTotal.inc({ type: 'http_error', endpoint: path });
    }
  });

  next();
};

// Initialize metrics
export const initializeMetrics = (): void => {
  logger.info('Initializing Prometheus metrics');
  
  // Update system metrics every 30 seconds
  setInterval(updateSystemMetrics, 30000);
  
  logger.info('Prometheus metrics initialized');
}; 