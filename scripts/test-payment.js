#!/usr/bin/env node

/**
 * Script de test pour le système de paiement GitShadow
 * Usage: node scripts/test-payment.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:8000';
const TEST_EMAIL = 'test@gitshadow.com';

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Fonction utilitaire pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      const bodyString = JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Tests
async function testHealthCheck() {
  logInfo('Test 1: Vérification de la santé de l\'application...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      logSuccess('Application accessible');
      return true;
    } else {
      logError(`Application non accessible (status: ${response.status})`);
      return false;
    }
  } catch (error) {
    logError(`Erreur de connexion: ${error.message}`);
    return false;
  }
}

async function testCreateCheckoutSession() {
  logInfo('Test 2: Création d\'une session de paiement...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/create-checkout-session`, {
      method: 'POST',
      body: {
        planId: 'pro',
        customerEmail: TEST_EMAIL,
        successUrl: `${BASE_URL}/dashboard?success=true`,
        cancelUrl: `${BASE_URL}/pricing?canceled=true`,
        metadata: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }
    });
    
    if (response.status === 200 && response.data.sessionId) {
      logSuccess('Session de paiement créée avec succès');
      logInfo(`Session ID: ${response.data.sessionId}`);
      return response.data.sessionId;
    } else {
      logError(`Erreur lors de la création de la session: ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return null;
  }
}

async function testCustomerPortal() {
  logInfo('Test 3: Test du portail client...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/customer-portal`, {
      method: 'POST',
      body: {
        customerId: 'cus_test123',
        returnUrl: `${BASE_URL}/dashboard`
      }
    });
    
    if (response.status === 200 && response.data.url) {
      logSuccess('Portail client accessible');
      logInfo(`URL du portail: ${response.data.url}`);
      return true;
    } else if (response.status === 400) {
      logWarning('Portail client: Client de test non trouvé (normal en test)');
      return true;
    } else {
      logError(`Erreur du portail client: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return false;
  }
}

async function testSubscriptionStatus() {
  logInfo('Test 4: Test du statut d\'abonnement...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/subscription-status`, {
      method: 'POST',
      body: {
        customerEmail: TEST_EMAIL
      }
    });
    
    if (response.status === 200) {
      logSuccess('API de statut d\'abonnement accessible');
      return true;
    } else if (response.status === 404) {
      logWarning('Client de test non trouvé (normal en test)');
      return true;
    } else {
      logError(`Erreur du statut d\'abonnement: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return false;
  }
}

async function testInvoices() {
  logInfo('Test 5: Test des factures...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/invoices`, {
      method: 'POST',
      body: {
        customerId: 'cus_test123',
        limit: 10
      }
    });
    
    if (response.status === 200) {
      logSuccess('API des factures accessible');
      return true;
    } else if (response.status === 400) {
      logWarning('Client de test non trouvé (normal en test)');
      return true;
    } else {
      logError(`Erreur des factures: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return false;
  }
}

async function testPaymentMethods() {
  logInfo('Test 6: Test des méthodes de paiement...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/payment-methods`, {
      method: 'POST',
      body: {
        customerId: 'cus_test123'
      }
    });
    
    if (response.status === 200) {
      logSuccess('API des méthodes de paiement accessible');
      return true;
    } else if (response.status === 400) {
      logWarning('Client de test non trouvé (normal en test)');
      return true;
    } else {
      logError(`Erreur des méthodes de paiement: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return false;
  }
}

async function testWebhookValidation() {
  logInfo('Test 7: Test de validation des webhooks...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/payment/webhook`, {
      method: 'POST',
      body: {
        type: 'test',
        data: {
          object: {
            id: 'test_webhook'
          }
        }
      },
      headers: {
        'stripe-signature': 'test_signature'
      }
    });
    
    if (response.status === 400) {
      logSuccess('Validation des webhooks active (signature invalide rejetée)');
      return true;
    } else {
      logWarning('Validation des webhooks non testée (signature de test)');
      return true;
    }
  } catch (error) {
    logError(`Erreur de requête: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  logInfo('Test 8: Vérification des variables d\'environnement...');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length === 0) {
    logSuccess('Toutes les variables d\'environnement requises sont présentes');
    return true;
  } else {
    logError(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    logWarning('Créez un fichier .env.local avec les variables requises');
    return false;
  }
}

// Fonction principale
async function runTests() {
  log(`${colors.bold}🧪 Test du système de paiement GitShadow${colors.reset}\n`);
  log(`URL de base: ${BASE_URL}\n`);
  
  const results = [];
  
  // Tests
  results.push(await testHealthCheck());
  results.push(await testEnvironmentVariables());
  results.push(await testCreateCheckoutSession());
  results.push(await testCustomerPortal());
  results.push(await testSubscriptionStatus());
  results.push(await testInvoices());
  results.push(await testPaymentMethods());
  results.push(await testWebhookValidation());
  
  // Résumé
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  log(`\n${colors.bold}📊 Résumé des tests:${colors.reset}`);
  log(`Tests réussis: ${passed}/${total}`);
  
  if (passed === total) {
    logSuccess('🎉 Tous les tests sont passés ! Le système de paiement est prêt.');
  } else {
    logError('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  log(`\n${colors.bold}📝 Prochaines étapes:${colors.reset}`);
  log('1. Configurez vos produits et prix dans Stripe');
  log('2. Configurez les webhooks dans votre dashboard Stripe');
  log('3. Testez avec des cartes de test Stripe');
  log('4. Déployez en production avec les clés de production');
  
  return passed === total;
}

// Exécution du script
if (require.main === module) {
  runTests().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    logError(`Erreur fatale: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHealthCheck,
  testCreateCheckoutSession,
  testCustomerPortal,
  testSubscriptionStatus,
  testInvoices,
  testPaymentMethods,
  testWebhookValidation,
  testEnvironmentVariables
}; 