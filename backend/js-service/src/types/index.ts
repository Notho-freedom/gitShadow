export interface CodeAnalysisRequest {
  code: string;
  language: 'javascript' | 'typescript' | 'jsx' | 'tsx';
  options?: {
    includeAST?: boolean;
    includeMetrics?: boolean;
    includeSecurity?: boolean;
    includePerformance?: boolean;
    includeDocumentation?: boolean;
  };
}

export interface CodeAnalysisResponse {
  success: boolean;
  data?: {
    ast?: ASTNode;
    metrics?: CodeMetrics;
    security?: SecurityAnalysis;
    performance?: PerformanceAnalysis;
    documentation?: DocumentationResult;
    complexity?: ComplexityAnalysis;
    maintainability?: MaintainabilityScore;
  };
  error?: string;
  timestamp: string;
  processingTime: number;
}

export interface ASTNode {
  type: string;
  start: number;
  end: number;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  children?: ASTNode[];
  [key: string]: any;
}

export interface CodeMetrics {
  linesOfCode: number;
  linesOfComments: number;
  cyclomaticComplexity: number;
  halsteadMetrics: {
    volume: number;
    difficulty: number;
    effort: number;
    time: number;
    bugs: number;
  };
  maintainabilityIndex: number;
  depthOfInheritance: number;
  couplingBetweenObjects: number;
  lackOfCohesion: number;
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityVulnerability[];
  riskScore: number;
  recommendations: string[];
}

export interface SecurityVulnerability {
  type: 'injection' | 'xss' | 'sqli' | 'auth' | 'crypto' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line: number;
  code: string;
  recommendation: string;
}

export interface PerformanceAnalysis {
  bottlenecks: PerformanceBottleneck[];
  score: number;
  recommendations: string[];
}

export interface PerformanceBottleneck {
  type: 'memory' | 'cpu' | 'io' | 'network' | 'algorithm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  line: number;
  impact: string;
  suggestion: string;
}

export interface DocumentationResult {
  functions: FunctionDoc[];
  classes: ClassDoc[];
  modules: ModuleDoc[];
  coverage: number;
  missingDocs: string[];
}

export interface FunctionDoc {
  name: string;
  signature: string;
  description?: string;
  parameters: ParameterDoc[];
  returnType?: string;
  returnDescription?: string;
  examples?: string[];
  line: number;
}

export interface ParameterDoc {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: string;
}

export interface ClassDoc {
  name: string;
  description?: string;
  methods: FunctionDoc[];
  properties: PropertyDoc[];
  extends?: string;
  implements?: string[];
  line: number;
}

export interface PropertyDoc {
  name: string;
  type: string;
  description?: string;
  access: 'public' | 'private' | 'protected';
  readonly: boolean;
  line: number;
}

export interface ModuleDoc {
  name: string;
  description?: string;
  exports: string[];
  imports: string[];
  dependencies: string[];
}

export interface ComplexityAnalysis {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  functionComplexity: Map<string, number>;
  classComplexity: Map<string, number>;
}

export interface MaintainabilityScore {
  overall: number;
  factors: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    commentRatio: number;
    duplication: number;
    coupling: number;
    cohesion: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: boolean;
    redis: boolean;
    prometheus: boolean;
  };
  metrics: {
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface MetricsResponse {
  requests_total: number;
  requests_duration_seconds: number;
  errors_total: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
  cache_hits_total: number;
  cache_misses_total: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string | undefined;
  db: number;
  ttl: number;
  keyPrefix: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
}

export interface AppConfig {
  port: number;
  environment: 'development' | 'production' | 'test';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cache: CacheConfig;
  database: DatabaseConfig;
  prometheus: {
    enabled: boolean;
    port: number;
  };
} 