import codeAnalyzer from '../../services/codeAnalyzer';
import { CodeAnalysisRequest } from '../../types';

// Mock the metrics
jest.mock('../../utils/metrics', () => ({
  analysisTotal: {
    inc: jest.fn(),
  },
  analysisDuration: {
    observe: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('CodeAnalyzerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCode', () => {
    it('should analyze JavaScript code successfully', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          function add(a, b) {
            return a + b;
          }
          
          function multiply(a, b) {
            return a * b;
          }
        `,
        language: 'javascript',
        options: {
          includeMetrics: true,
          includeSecurity: true,
          includePerformance: true,
          includeDocumentation: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.metrics).toBeDefined();
      expect(result.data?.security).toBeDefined();
      expect(result.data?.performance).toBeDefined();
      expect(result.data?.documentation).toBeDefined();
      expect(result.data?.complexity).toBeDefined();
      expect(result.data?.maintainability).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should analyze TypeScript code successfully', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          interface User {
            id: number;
            name: string;
          }
          
          function getUser(id: number): User | null {
            return { id, name: 'John' };
          }
        `,
        language: 'typescript',
        options: {
          includeAST: true,
          includeMetrics: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.ast).toBeDefined();
      expect(result.data?.metrics).toBeDefined();
    });

    it('should handle unsupported language', async () => {
      const request: CodeAnalysisRequest = {
        code: 'print("Hello")',
        language: 'python' as any,
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported language');
    });

    it('should handle parsing errors gracefully', async () => {
      const request: CodeAnalysisRequest = {
        code: 'function test( { // Invalid syntax',
        language: 'javascript',
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include only requested options', async () => {
      const request: CodeAnalysisRequest = {
        code: 'function test() { return true; }',
        language: 'javascript',
        options: {
          includeMetrics: true,
          includeSecurity: false,
          includePerformance: false,
          includeDocumentation: false,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.metrics).toBeDefined();
      expect(result.data?.security).toBeUndefined();
      expect(result.data?.performance).toBeUndefined();
      expect(result.data?.documentation).toBeUndefined();
    });

    it('should detect security vulnerabilities', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          eval('console.log("dangerous")');
          element.innerHTML = userInput;
        `,
        language: 'javascript',
        options: {
          includeSecurity: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.security?.vulnerabilities).toHaveLength(2);
      expect(result.data?.security?.riskScore).toBeGreaterThan(0);
    });

    it('should calculate metrics correctly', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          // This is a comment
          function complex(a, b) {
            if (a > b) {
              for (let i = 0; i < 10; i++) {
                if (i % 2 === 0) {
                  return a + b;
                }
              }
            }
            return a * b;
          }
        `,
        language: 'javascript',
        options: {
          includeMetrics: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.metrics?.linesOfCode).toBeGreaterThan(0);
      expect(result.data?.metrics?.linesOfComments).toBeGreaterThan(0);
      expect(result.data?.metrics?.cyclomaticComplexity).toBeGreaterThan(1);
      expect(result.data?.metrics?.maintainabilityIndex).toBeGreaterThan(0);
    });

    it('should generate documentation analysis', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          /**
           * Adds two numbers
           * @param {number} a - First number
           * @param {number} b - Second number
           * @returns {number} The sum
           */
          function add(a, b) {
            return a + b;
          }
          
          class Calculator {
            constructor() {
              this.result = 0;
            }
            
            add(value) {
              this.result += value;
              return this;
            }
          }
        `,
        language: 'javascript',
        options: {
          includeDocumentation: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.documentation?.functions).toBeDefined();
      expect(result.data?.documentation?.classes).toBeDefined();
      expect(result.data?.documentation?.coverage).toBeGreaterThan(0);
    });

    it('should analyze performance bottlenecks', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          for (let i = 0; i < 1000; i++) {
            for (let j = 0; j < 1000; j++) {
              console.log(i + j);
            }
          }
        `,
        language: 'javascript',
        options: {
          includePerformance: true,
        },
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.performance?.bottlenecks).toBeDefined();
      expect(result.data?.performance?.score).toBeGreaterThan(0);
    });

    it('should calculate complexity metrics', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          function complex(a, b, c) {
            if (a > b) {
              if (b > c) {
                for (let i = 0; i < 10; i++) {
                  if (i % 2 === 0) {
                    return a + b + c;
                  }
                }
              }
            }
            return a * b * c;
          }
        `,
        language: 'javascript',
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.complexity?.cyclomaticComplexity).toBeGreaterThan(1);
      expect(result.data?.complexity?.cognitiveComplexity).toBeGreaterThan(0);
      expect(result.data?.complexity?.nestingDepth).toBeGreaterThan(0);
    });

    it('should calculate maintainability score', async () => {
      const request: CodeAnalysisRequest = {
        code: `
          // Simple function with good maintainability
          function simple(a, b) {
            return a + b;
          }
        `,
        language: 'javascript',
      };

      const result = await codeAnalyzer.analyzeCode(request);

      expect(result.success).toBe(true);
      expect(result.data?.maintainability?.overall).toBeGreaterThan(0);
      expect(result.data?.maintainability?.grade).toBeDefined();
      expect(result.data?.maintainability?.factors).toBeDefined();
    });
  });
}); 