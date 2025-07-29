#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration des Paiements GitShadow');
console.log('=====================================\n');

// Vérifier si .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Création du fichier .env.local...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Fichier .env.local créé à partir de env.example');
  } else {
    console.log('❌ Fichier env.example non trouvé');
    process.exit(1);
  }
} else {
  console.log('✅ Fichier .env.local existe déjà');
}

console.log('\n📋 Étapes suivantes :');
console.log('1. Configurez vos clés Stripe dans .env.local');
console.log('2. Créez les produits et prix dans votre dashboard Stripe');
console.log('3. Configurez les webhooks Stripe');
console.log('4. Testez avec les cartes de test');

console.log('\n🔗 Liens utiles :');
console.log('- Dashboard Stripe : https://dashboard.stripe.com');
console.log('- Documentation : https://stripe.com/docs');
console.log('- Guide complet : PAYMENT_SETUP.md');

console.log('\n💳 Cartes de test Stripe :');
console.log('- Succès : 4242 4242 4242 4242');
console.log('- Échec : 4000 0000 0000 0002');
console.log('- 3D Secure : 4000 0025 0000 3155');

console.log('\n🎯 Pour tester :');
console.log('1. npm run dev');
console.log('2. Allez sur http://localhost:8000/pricing');
console.log('3. Connectez-vous avec "Test Auth"');
console.log('4. Sélectionnez un plan payant');
console.log('5. Utilisez une carte de test');

console.log('\n✨ Configuration terminée !'); 