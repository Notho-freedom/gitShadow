const fetch = require('node-fetch');

async function testService(name, url, testData) {
  console.log(`\n🧪 Test du service ${name}...`);
  
  try {
    // Test health check
    const healthResponse = await fetch(`${url}/health`);
    const healthData = await healthResponse.json();
    console.log(`✅ ${name} Health Check:`, healthData.status);
    
    // Test API if testData provided
    if (testData) {
      const apiResponse = await fetch(`${url}${testData.endpoint}`, {
        method: testData.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData.body),
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log(`✅ ${name} API Test: Success`);
        console.log(`   Response:`, JSON.stringify(apiData, null, 2).substring(0, 200) + '...');
      } else {
        const errorData = await apiResponse.text();
        console.log(`❌ ${name} API Test: HTTP ${apiResponse.status}`);
        console.log(`   Error:`, errorData.substring(0, 200));
      }
    }
    
  } catch (error) {
    console.log(`❌ ${name} Error:`, error.message);
  }
}

async function runIntegrationTests() {
  console.log('🚀 Test d\'intégration du Backend GitShadow\n');
  
  // Test JS Service
  await testService('JavaScript', 'http://localhost:3004', {
    endpoint: '/api/v1/analyze',
    method: 'POST',
    body: {
      code: 'function test() { return 1; }',
      language: 'javascript'
    }
  });
  
  // Test Python Service
  await testService('Python', 'http://localhost:3002', {
    endpoint: '/generate',
    method: 'POST',
    body: {
      code: 'def test(): return 1',
      filename: 'test.py',
      language: 'Python'
    }
  });
  
  // Test Gateway
  await testService('Gateway', 'http://localhost:3001');
  
  console.log('\n🎯 Tests d\'intégration terminés !');
}

runIntegrationTests().catch(console.error); 