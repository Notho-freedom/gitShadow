import { parse } from '@babel/parser';
import crypto from 'crypto';
import logger from '@/utils/logger';
import {
  CodeAnalysisRequest,
  CodeAnalysisResponse,
  ASTNode,
  CodeMetrics,
  SecurityAnalysis,
  SecurityVulnerability,
  PerformanceAnalysis,
  PerformanceBottleneck,
  DocumentationResult,
  FunctionDoc,
  ClassDoc,
  ModuleDoc,
  ComplexityAnalysis,
  MaintainabilityScore,
} from '@/types';
import { analysisTotal, analysisDuration } from '@/utils/metrics';

class CodeAnalyzerService {
  private supportedLanguages = ['javascript', 'typescript', 'jsx', 'tsx'];

  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    const startTime = Date.now();
    const requestHash = this.generateRequestHash(request);

    try {
      logger.info('Starting code analysis', {
        language: request.language,
        codeLength: request.code.length,
        options: request.options,
      });

      // Validate language support
      if (!this.supportedLanguages.includes(request.language)) {
        throw new Error(`Unsupported language: ${request.language}`);
      }

      // Parse AST
      const ast = await this.parseAST(request.code, request.language);
      
      // Initialize response
      const response: CodeAnalysisResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        processingTime: 0,
      };

      // Include AST if requested
      if (request.options?.includeAST) {
        response.data = { ...response.data, ast };
      }

      // Calculate metrics
      if (request.options?.includeMetrics !== false) {
        const metrics = this.calculateMetrics(request.code, ast);
        response.data = { ...response.data, metrics };
      }

      // Security analysis
      if (request.options?.includeSecurity !== false) {
        const security = this.analyzeSecurity(request.code, ast);
        response.data = { ...response.data, security };
      }

      // Performance analysis
      if (request.options?.includePerformance !== false) {
        const performance = this.analyzePerformance(request.code, ast);
        response.data = { ...response.data, performance };
      }

      // Documentation generation
      if (request.options?.includeDocumentation !== false) {
        const documentation = this.generateDocumentation(request.code, ast);
        response.data = { ...response.data, documentation };
      }

      // Complexity analysis
      const complexity = this.analyzeComplexity(ast);
      response.data = { ...response.data, complexity };

      // Maintainability score
      const maintainability = this.calculateMaintainabilityScore(request.code, complexity);
      response.data = { ...response.data, maintainability };

      const processingTime = Date.now() - startTime;
      response.processingTime = processingTime;

      // Update metrics
      analysisTotal.inc({ language: request.language, success: 'true' });
      analysisDuration.observe({ language: request.language }, processingTime / 1000);

      logger.info('Code analysis completed successfully', {
        requestHash,
        processingTime,
        language: request.language,
      });

      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Code analysis failed', {
        requestHash,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        language: request.language,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTime,
      };
    }
  }

  private generateRequestHash(request: CodeAnalysisRequest): string {
    const data = `${request.code}:${request.language}:${JSON.stringify(request.options || {})}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async parseAST(code: string, language: string): Promise<ASTNode> {
    try {
      const plugins = language === 'typescript' || language === 'tsx' 
        ? ['typescript', 'jsx'] 
        : ['jsx'];
      
              const ast = parse(code, {
          sourceType: 'module',
          plugins: plugins as any,
          tokens: true,
        });

      return this.transformAST(ast);
    } catch (error) {
      logger.error('AST parsing failed', { error, language });
      throw new Error(`Failed to parse ${language} code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformAST(ast: any): ASTNode {
    const transformNode = (node: any): ASTNode => {
      const transformed: ASTNode = {
        type: node.type,
        start: node.start,
        end: node.end,
        loc: node.loc ? {
          start: { line: node.loc.start.line, column: node.loc.start.column },
          end: { line: node.loc.end.line, column: node.loc.end.column },
        } : undefined,
      } as ASTNode;

      // Add specific properties based on node type
      if (node['name']) transformed['name'] = node['name'];
      if (node['value'] !== undefined) transformed['value'] = node['value'];
      if (node['operator']) transformed['operator'] = node['operator'];
      if (node['argument']) transformed['argument'] = transformNode(node['argument']);
      if (node['callee']) transformed['callee'] = transformNode(node['callee']);
      if (node['arguments']) transformed['arguments'] = node['arguments'].map(transformNode);
      if (node['body']) transformed['body'] = transformNode(node['body']);
      if (node['test']) transformed['test'] = transformNode(node['test']);
      if (node['consequent']) transformed['consequent'] = transformNode(node['consequent']);
      if (node['alternate']) transformed['alternate'] = transformNode(node['alternate']);
      if (node['declarations']) transformed['declarations'] = node['declarations'].map(transformNode);
      if (node['init']) transformed['init'] = transformNode(node['init']);
      if (node['update']) transformed['update'] = transformNode(node['update']);
      if (node['left']) transformed['left'] = transformNode(node['left']);
      if (node['right']) transformed['right'] = transformNode(node['right']);
      if (node['expression']) transformed['expression'] = transformNode(node['expression']);
      if (node['object']) transformed['object'] = transformNode(node['object']);
      if (node['property']) transformed['property'] = transformNode(node['property']);
      if (node['computed'] !== undefined) transformed['computed'] = node['computed'];
      if (node['optional'] !== undefined) transformed['optional'] = node['optional'];
      if (node['shorthand'] !== undefined) transformed['shorthand'] = node['shorthand'];
      if (node['key']) transformed['key'] = transformNode(node['key']);
      if (node['value']) transformed['value'] = transformNode(node['value']);
      if (node['kind']) transformed['kind'] = node['kind'];
      if (node['static'] !== undefined) transformed['static'] = node['static'];
      if (node['computed'] !== undefined) transformed['computed'] = node['computed'];
      if (node['method'] !== undefined) transformed['method'] = node['method'];
      if (node['optional'] !== undefined) transformed['optional'] = node['optional'];
      if (node['shorthand'] !== undefined) transformed['shorthand'] = node['shorthand'];
      if (node['abstract'] !== undefined) transformed['abstract'] = node['abstract'];
      if (node['accessibility']) transformed['accessibility'] = node['accessibility'];
      if (node['decorators']) transformed['decorators'] = node['decorators'].map(transformNode);
      if (node['leadingComments']) transformed['leadingComments'] = node['leadingComments'];
      if (node['trailingComments']) transformed['trailingComments'] = node['trailingComments'];
      if (node['innerComments']) transformed['innerComments'] = node['innerComments'];
      if (node['extra']) transformed['extra'] = node['extra'];

      // Handle arrays of nodes
      if (node['expressions']) transformed['expressions'] = node['expressions'].map(transformNode);
      if (node['elements']) transformed['elements'] = node['elements'].map(transformNode);
      if (node['properties']) transformed['properties'] = node['properties'].map(transformNode);
      if (node['params']) transformed['params'] = node['params'].map(transformNode);
      if (node['specifiers']) transformed['specifiers'] = node['specifiers'].map(transformNode);
      if (node['directives']) transformed['directives'] = node['directives'].map(transformNode);
      if (node['body'] && Array.isArray(node['body'])) {
        transformed['body'] = node['body'].map(transformNode);
      }

      return transformed;
    };

    return transformNode(ast);
  }

  private calculateMetrics(code: string, ast: ASTNode): CodeMetrics {
    const lines = code.split('\n');
    const linesOfCode = lines.length;
    const linesOfComments = this.countCommentLines(code);
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
    const halsteadMetrics = this.calculateHalsteadMetrics(code);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(code, cyclomaticComplexity, linesOfCode);

    return {
      linesOfCode,
      linesOfComments,
      cyclomaticComplexity,
      halsteadMetrics,
      maintainabilityIndex,
      depthOfInheritance: 0, // Not applicable for JS/TS
      couplingBetweenObjects: 0, // Would need more complex analysis
      lackOfCohesion: 0, // Would need more complex analysis
    };
  }

  private countCommentLines(code: string): number {
    const lines = code.split('\n');
    return lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || 
             trimmed.startsWith('/*') || 
             trimmed.startsWith('*') ||
             trimmed.startsWith('*/');
    }).length;
  }

  private calculateCyclomaticComplexity(ast: ASTNode): number {
    let complexity = 1; // Base complexity

    const countComplexity = (node: ASTNode): void => {
      // Decision points increase complexity
      if (node.type === 'IfStatement' || 
          node.type === 'SwitchCase' || 
          node.type === 'ForStatement' || 
          node.type === 'WhileStatement' || 
          node.type === 'DoWhileStatement' ||
          node.type === 'ForInStatement' ||
          node.type === 'ForOfStatement' ||
          node.type === 'CatchClause') {
        complexity++;
      }

      // Logical operators can increase complexity
              if (node.type === 'LogicalExpression' &&
            (node['operator'] === '&&' || node['operator'] === '||')) {
        complexity++;
      }

      // Recursively check children
      if (node.children) {
        node.children.forEach(countComplexity);
      }
    };

    countComplexity(ast);
    return complexity;
  }

  private calculateHalsteadMetrics(code: string): CodeMetrics['halsteadMetrics'] {
    const tokens = this.tokenize(code);
    const uniqueTokens = new Set(tokens);
    const n1 = uniqueTokens.size; // Number of unique operators
    const n2 = tokens.length - n1; // Number of unique operands (approximation)
    const N1 = tokens.length; // Total operators
    const N2 = tokens.length; // Total operands (approximation)

    const volume = (N1 + N2) * Math.log2(n1 + n2);
    const difficulty = (n1 / 2) * (N2 / n2);
    const effort = volume * difficulty;
    const time = effort / 18;
    const bugs = volume / 3000;

    return {
      volume,
      difficulty,
      effort,
      time,
      bugs,
    };
  }

  private tokenize(code: string): string[] {
    // Simple tokenization - split by common delimiters
    return code
      .replace(/[(){}\[\];,.\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private calculateMaintainabilityIndex(code: string, cyclomaticComplexity: number, linesOfCode: number): number {
    const halsteadVolume = this.calculateHalsteadMetrics(code).volume;
    return Math.max(0, Math.min(100, 171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)));
  }

  private analyzeSecurity(_code: string, ast: ASTNode): SecurityAnalysis {
    const vulnerabilities: SecurityVulnerability[] = [];
    
    this.findSecurityVulnerabilities(ast, vulnerabilities);

    const riskScore = this.calculateRiskScore(vulnerabilities);
    const recommendations = this.generateSecurityRecommendations(vulnerabilities);

    return {
      vulnerabilities,
      riskScore,
      recommendations,
    };
  }

  private findSecurityVulnerabilities(ast: ASTNode, vulnerabilities: SecurityVulnerability[]): void {
    const checkNode = (node: ASTNode, line: number): void => {
              // Check for eval() usage
        if (node.type === 'CallExpression' && 
            node['callee'] &&
            node['callee']['name'] === 'eval') {
        vulnerabilities.push({
          type: 'injection',
          severity: 'critical',
          description: 'Use of eval() function detected',
          line,
          code: 'eval()',
          recommendation: 'Avoid using eval(). Use JSON.parse() or Function constructor instead.',
        });
      }

              // Check for innerHTML usage
        if (node.type === 'AssignmentExpression' && 
            node['left'] &&
            node['left'].type === 'MemberExpression' &&
            node['left']['property'] &&
            node['left']['property']['name'] === 'innerHTML') {
        vulnerabilities.push({
          type: 'xss',
          severity: 'high',
          description: 'Direct innerHTML assignment detected',
          line,
          code: 'innerHTML',
          recommendation: 'Use textContent or sanitize HTML content to prevent XSS attacks.',
        });
      }

      // Check for console.log in production
      if (node.type === 'CallExpression' && 
          node['callee'] && 
          node['callee'].type === 'MemberExpression' && 
          node['callee']['object'] && 
          node['callee']['object']['name'] === 'console' && 
          node['callee']['property'] && 
          node['callee']['property']['name'] === 'log') {
        vulnerabilities.push({
          type: 'other',
          severity: 'low',
          description: 'Console.log detected in code',
          line,
          code: 'console.log()',
          recommendation: 'Remove console.log statements for production code.',
        });
      }

      // Check for hardcoded secrets
      if (node.type === 'StringLiteral' && 
          node['value'] && 
          (node['value'].includes('password') || 
           node['value'].includes('secret') || 
           node['value'].includes('key'))) {
        vulnerabilities.push({
          type: 'auth',
          severity: 'medium',
          description: 'Potential hardcoded secret detected',
          line,
          code: node['value'],
          recommendation: 'Use environment variables for sensitive data.',
        });
      }

      // Recursively check children
      if (node.children) {
        node.children.forEach(child => checkNode(child, line));
      }
    };

    checkNode(ast, 1);
  }

  private calculateRiskScore(vulnerabilities: SecurityVulnerability[]): number {
    const severityScores = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    };

    return vulnerabilities.reduce((score, vuln) => {
      return score + (severityScores[vuln.severity] || 0);
    }, 0);
  }

  private generateSecurityRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
    const recommendations = new Set<string>();
    
    vulnerabilities.forEach(vuln => {
      recommendations.add(vuln.recommendation);
    });

    return Array.from(recommendations);
  }

  private analyzePerformance(_code: string, ast: ASTNode): PerformanceAnalysis {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    this.findPerformanceBottlenecks(ast, bottlenecks);

    const score = this.calculatePerformanceScore(bottlenecks);
    const recommendations = this.generatePerformanceRecommendations(bottlenecks);

    return {
      bottlenecks,
      score,
      recommendations,
    };
  }

  private findPerformanceBottlenecks(ast: ASTNode, bottlenecks: PerformanceBottleneck[]): void {
    const checkNode = (node: ASTNode, line: number): void => {
      // Check for nested loops
      if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
        // This is a simplified check - in a real implementation, you'd need to track nesting
        bottlenecks.push({
          type: 'algorithm',
          severity: 'medium',
          description: 'Loop detected - check for nested loops',
          line,
          impact: 'Potential O(n²) or worse time complexity',
          suggestion: 'Consider using more efficient algorithms or data structures',
        });
      }

      // Check for synchronous operations that could be async
      if (node.type === 'CallExpression' && 
          node['callee'] && 
          node['callee']['name'] && 
          ['readFileSync', 'writeFileSync', 'execSync'].includes(node['callee']['name'])) {
        bottlenecks.push({
          type: 'io',
          severity: 'high',
          description: 'Synchronous I/O operation detected',
          line,
          impact: 'Blocks event loop',
          suggestion: 'Use async/await or promises for I/O operations',
        });
      }

      // Check for large object creation
      if (node.type === 'ObjectExpression' && 
          node['properties'] && 
          node['properties'].length > 10) {
        bottlenecks.push({
          type: 'memory',
          severity: 'low',
          description: 'Large object creation detected',
          line,
          impact: 'High memory usage',
          suggestion: 'Consider breaking down large objects',
        });
      }

      // Recursively check children
      if (node.children) {
        node.children.forEach(child => checkNode(child, line));
      }
    };

    checkNode(ast, 1);
  }

  private calculatePerformanceScore(bottlenecks: PerformanceBottleneck[]): number {
    const severityScores = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5,
    };

    const totalDeduction = bottlenecks.reduce((score, bottleneck) => {
      return score + (severityScores[bottleneck.severity] || 0);
    }, 0);

    return Math.max(0, 100 - totalDeduction);
  }

  private generatePerformanceRecommendations(bottlenecks: PerformanceBottleneck[]): string[] {
    const recommendations = new Set<string>();
    
    bottlenecks.forEach(bottleneck => {
      recommendations.add(bottleneck.suggestion);
    });

    return Array.from(recommendations);
  }

  private generateDocumentation(_code: string, ast: ASTNode): DocumentationResult {
    const functions: FunctionDoc[] = [];
    const classes: ClassDoc[] = [];
    const modules: ModuleDoc[] = [];

    this.extractDocumentation(ast, functions, classes, modules);

    const totalItems = functions.length + classes.length;
    const documentedItems = functions.filter(f => f.description).length + 
                          classes.filter(c => c.description).length;
    const coverage = totalItems > 0 ? (documentedItems / totalItems) * 100 : 0;

    const missingDocs = this.findMissingDocumentation(functions, classes);

    return {
      functions,
      classes,
      modules,
      coverage,
      missingDocs,
    };
  }

  private extractDocumentation(ast: ASTNode, functions: FunctionDoc[], classes: ClassDoc[], _modules: ModuleDoc[]): void {
    const extractFromNode = (node: ASTNode): void => {
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
        const functionDoc: FunctionDoc = {
          name: node['name'] || 'anonymous',
          signature: this.generateFunctionSignature(node),
          description: this.extractJSDoc(node),
          parameters: this.extractParameters(node),
          returnType: this.extractReturnType(node),
          line: node.loc?.start.line || 1,
        } as FunctionDoc;
        functions.push(functionDoc);
      }

      if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
        const classDoc: ClassDoc = {
          name: node['name'] || 'anonymous',
          description: this.extractJSDoc(node),
          methods: [],
          properties: [],
          line: node.loc?.start.line || 1,
        } as ClassDoc;
        classes.push(classDoc);
      }

      // Recursively check children
      if (node.children) {
        node.children.forEach(extractFromNode);
      }
    };

    extractFromNode(ast);
  }

  private generateFunctionSignature(node: ASTNode): string {
    const name = node['name'] || 'function';
    const params = this.extractParameters(node);
    return `${name}(${params.map(p => p.name).join(', ')})`;
  }

  private extractJSDoc(_node: ASTNode): string | undefined {
    // In a real implementation, you'd parse JSDoc comments
    return undefined;
  }

  private extractParameters(node: ASTNode): FunctionDoc['parameters'] {
    const params = node['params'] || [];
    return params.map((param: any) => ({
      name: param['name'] || 'param',
      type: 'any',
      description: undefined,
      required: true,
    }));
  }

  private extractReturnType(_node: ASTNode): string | undefined {
    // In a real implementation, you'd extract return type from JSDoc or TypeScript
    return undefined;
  }

  private findMissingDocumentation(functions: FunctionDoc[], classes: ClassDoc[]): string[] {
    const missing: string[] = [];

    functions.forEach(func => {
      if (!func.description) {
        missing.push(`Function: ${func.name}`);
      }
    });

    classes.forEach(cls => {
      if (!cls.description) {
        missing.push(`Class: ${cls.name}`);
      }
    });

    return missing;
  }

  private analyzeComplexity(ast: ASTNode): ComplexityAnalysis {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(ast);
    const cognitiveComplexity = this.calculateCognitiveComplexity(ast);
    const nestingDepth = this.calculateNestingDepth(ast);

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      nestingDepth,
      functionComplexity: new Map(),
      classComplexity: new Map(),
    };
  }

  private calculateCognitiveComplexity(ast: ASTNode): number {
    // Simplified cognitive complexity calculation
    return this.calculateCyclomaticComplexity(ast) * 0.8;
  }

  private calculateNestingDepth(ast: ASTNode): number {
    let maxDepth = 0;

    const calculateDepth = (node: ASTNode, currentDepth: number): void => {
      maxDepth = Math.max(maxDepth, currentDepth);

      if (node.children) {
        node.children.forEach(child => calculateDepth(child, currentDepth + 1));
      }
    };

    calculateDepth(ast, 0);
    return maxDepth;
  }

  private calculateMaintainabilityScore(code: string, complexity: ComplexityAnalysis): MaintainabilityScore {
    const linesOfCode = code.split('\n').length;
    const commentLines = this.countCommentLines(code);
    const commentRatio = linesOfCode > 0 ? (commentLines / linesOfCode) * 100 : 0;

    const overall = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(complexity.cyclomaticComplexity) - 
      0.23 * complexity.cognitiveComplexity - 
      16.2 * Math.log(linesOfCode)
    ));

    return {
      overall,
      factors: {
        cyclomaticComplexity: Math.max(0, 100 - complexity.cyclomaticComplexity * 10),
        linesOfCode: Math.max(0, 100 - linesOfCode / 10),
        commentRatio,
        duplication: 80, // Would need more complex analysis
        coupling: 70, // Would need more complex analysis
        cohesion: 75, // Would need more complex analysis
      },
      grade: overall >= 80 ? 'A' : 
             overall >= 60 ? 'B' : 
             overall >= 40 ? 'C' : 
             overall >= 20 ? 'D' : 'F',
    };
  }
}

export default new CodeAnalyzerService(); 