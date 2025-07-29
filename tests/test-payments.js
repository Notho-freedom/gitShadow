#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de Configuration des Paiements GitShadow');
console.log('=============================================\n');

// Vérifier les fichiers de configuration
const filesToCheck = [
  '.env.local',
  'src/lib/stripe.js',
  'src/lib/pricing.js',
  'src/app/api/payment/create-checkout-session/route.js',
  'src/app/api/payment/webhook/route.js'
];

console.log('📁 Vérification des fichiers de configuration...');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
  }
});

// Vérifier les variables d'environnement
console.log('\n🔧 Vérification des variables d\'environnement...');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_THIN_SECRET'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - MANQUANTE`);
    }
  });
} else {
  console.log('❌ Fichier .env.local manquant');
}

// Instructions de test
console.log('\n🎯 Instructions de test :');
console.log('1. Lancez l\'application : npm run dev');
console.log('2. Allez sur http://localhost:8000/pricing');
console.log('3. Connectez-vous avec "Test Auth"');
console.log('4. Sélectionnez un plan payant');
console.log('5. Utilisez une carte de test Stripe');

console.log('\n💳 Cartes de test :');
console.log('- Succès : 4242 4242 4242 4242');
console.log('- Échec : 4000 0000 0000 0002');
console.log('- 3D Secure : 4000 0025 0000 3155');

console.log('\n🔗 Liens utiles :');
console.log('- Dashboard Stripe : https://dashboard.stripe.com');
console.log('- Webhooks Stripe : https://dashboard.stripe.com/webhooks');
console.log('- Guide complet : PAYMENT_SETUP.md');

console.log('\n✨ Test de configuration terminé !'); 