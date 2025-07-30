const fetch = require('node-fetch').default;

const BASE_URL = 'http://localhost:3004';
const TEST_CODE = `
/**
 * Example JavaScript class for testing
 */
class Calculator {
  constructor() {
    this.history = [];
  }

  add(a, b) {
    const result = a + b;
    this.history.push({ operation: 'add', a, b, result });
    return result;
  }

  subtract(a, b) {
    const result = a - b;
    this.history.push({ operation: 'subtract', a, b, result });
    return result;
  }

  multiply(a, b) {
    const result = a * b;
    this.history.push({ operation: 'multiply', a, b, result });
    return result;
  }

  divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    const result = a / b;
    this.history.push({ operation: 'divide', a, b, result });
    return result;
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }
}

// Example usage
const calc = new Calculator();
console.log(calc.add(5, 3));
console.log(calc.multiply(4, 2));
`;

const TEST_TYPESCRIPT_CODE = `
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserService {
  private users: User[] = [];

  async addUser(user: User): Promise<User> {
    if (this.users.find(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    this.users.push(user);
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

export { UserService, User };
`;

async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check passed');
      console.log('Status:', data.status);
      console.log('Uptime:', data.uptime);
      console.log('Services:', data.services);
    } else {
      console.log('❌ Health check failed');
      console.log('Status:', response.status);
      console.log('Response:', data);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

async function testMetrics() {
  console.log('\n📊 Testing Metrics...');
  
  try {
    const response = await fetch(`${BASE_URL}/metrics`);
    
    if (response.ok) {
      console.log('✅ Metrics endpoint working');
      const metrics = await response.text();
      console.log('Metrics sample:', metrics.substring(0, 200) + '...');
    } else {
      console.log('❌ Metrics endpoint failed');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Metrics error:', error.message);
  }
}

async function testCodeAnalysis(language, code, description) {
  console.log(`\n🔬 Testing ${description}...`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        options: {
          includeAST: true,
          includeMetrics: true,
          includeSecurity: true,
          includePerformance: true,
          includeDocumentation: true,
        },
      }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Analysis completed successfully');
      console.log('Processing time:', data.processingTime, 'ms');
      
      if (data.data) {
        if (data.data.metrics) {
          console.log('📈 Metrics:');
          console.log('  - Lines of code:', data.data.metrics.linesOfCode);
          console.log('  - Cyclomatic complexity:', data.data.metrics.cyclomaticComplexity);
          console.log('  - Maintainability index:', data.data.metrics.maintainabilityIndex);
        }
        
        if (data.data.security) {
          console.log('🔒 Security:');
          console.log('  - Risk score:', data.data.security.riskScore);
          console.log('  - Vulnerabilities found:', data.data.security.vulnerabilities.length);
        }
        
        if (data.data.performance) {
          console.log('⚡ Performance:');
          console.log('  - Performance score:', data.data.performance.score);
          console.log('  - Bottlenecks found:', data.data.performance.bottlenecks.length);
        }
        
        if (data.data.documentation) {
          console.log('📚 Documentation:');
          console.log('  - Coverage:', data.data.documentation.coverage, '%');
          console.log('  - Functions documented:', data.data.documentation.functions.length);
          console.log('  - Classes documented:', data.data.documentation.classes.length);
        }
        
        if (data.data.maintainability) {
          console.log('🛠️ Maintainability:');
          console.log('  - Overall score:', data.data.maintainability.overall);
          console.log('  - Grade:', data.data.maintainability.grade);
        }
      }
    } else {
      console.log('❌ Analysis failed');
      console.log('Status:', response.status);
      console.log('Error:', data.error || data.message);
    }
  } catch (error) {
    console.log('❌ Analysis error:', error.message);
  }
}

async function testCacheRetrieval() {
  console.log('\n💾 Testing Cache Retrieval...');
  
  try {
    // First, perform an analysis to cache the result
    const analysisResponse = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'function test() { return "hello"; }',
        language: 'javascript',
      }),
    });
    
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      
      if (analysisData.success) {
        // Generate a hash (in a real scenario, this would be returned by the service)
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256')
          .update('function test() { return "hello"; }:javascript:{}')
          .digest('hex');
        
        // Try to retrieve from cache
        const cacheResponse = await fetch(`${BASE_URL}/api/v1/analysis/${hash}`);
        
        if (cacheResponse.ok) {
          console.log('✅ Cache retrieval working');
        } else if (cacheResponse.status === 404) {
          console.log('ℹ️ Cache miss (expected for test)');
        } else {
          console.log('❌ Cache retrieval failed');
          console.log('Status:', cacheResponse.status);
        }
      }
    }
  } catch (error) {
    console.log('❌ Cache test error:', error.message);
  }
}

async function testStatistics() {
  console.log('\n📈 Testing Statistics...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/stats`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Statistics retrieved successfully');
      console.log('Cache connected:', data.data.cache.connected);
      console.log('Cache keys:', data.data.cache.keys);
      console.log('Total analyses:', data.data.database.totalAnalyses);
      console.log('Cache hit rate:', data.data.database.cacheHitRate, '%');
    } else {
      console.log('❌ Statistics failed');
      console.log('Status:', response.status);
      console.log('Error:', data.error || data.message);
    }
  } catch (error) {
    console.log('❌ Statistics error:', error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test invalid language
  try {
    const response = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: 'console.log("test");',
        language: 'invalid-language',
      }),
    });
    
    const data = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Validation error handling working');
    } else {
      console.log('❌ Validation error handling failed');
      console.log('Expected 400, got:', response.status);
    }
  } catch (error) {
    console.log('❌ Error handling test error:', error.message);
  }
  
  // Test empty code
  try {
    const response = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: '',
        language: 'javascript',
      }),
    });
    
    const data = await response.json();
    
    if (response.status === 400) {
      console.log('✅ Empty code validation working');
    } else {
      console.log('❌ Empty code validation failed');
      console.log('Expected 400, got:', response.status);
    }
  } catch (error) {
    console.log('❌ Empty code test error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting JS/TS Service Tests...');
  console.log('Service URL:', BASE_URL);
  
  // Test basic endpoints
  await testHealthCheck();
  await testMetrics();
  
  // Test code analysis
  await testCodeAnalysis('javascript', TEST_CODE, 'JavaScript Analysis');
  await testCodeAnalysis('typescript', TEST_TYPESCRIPT_CODE, 'TypeScript Analysis');
  
  // Test additional features
  await testCacheRetrieval();
  await testStatistics();
  await testErrorHandling();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testMetrics,
  testCodeAnalysis,
  testCacheRetrieval,
  testStatistics,
  testErrorHandling,
  runAllTests,
}; 