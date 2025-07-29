#!/usr/bin/env node

const Stripe = require('stripe');

// Lire les variables d'environnement depuis .env.local
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnvFile();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function testNewPrices() {
  console.log('🧪 Test des Nouveaux Prix Stripe');
  console.log('=================================\n');

  try {
    // Test des nouveaux IDs de prix créés
    const priceIds = [
      'price_1RqJLI4AxuUKnAS0dbZL5O9E', // Pro mensuel
      'price_1RqJLK4AxuUKnAS0SYwlpZe9', // Team mensuel
      'price_1RqJLJ4AxuUKnAS0YPfCwI0n', // Pro annuel
      'price_1RqJLK4AxuUKnAS019HJUl0G'  // Team annuel
    ];

    console.log('🔍 Vérification des nouveaux IDs de prix...\n');

    for (const priceId of priceIds) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ ${priceId}: ${price.product} - ${price.unit_amount / 100}${price.currency.toUpperCase()}/${price.recurring?.interval || 'one-time'}`);
      } catch (error) {
        console.log(`❌ ${priceId}: ${error.message}`);
      }
    }

    console.log('\n🔍 Test des lookup keys...\n');

    // Test des lookup keys
    const lookupKeys = [
      'gitshadow_pro_monthly',
      'gitshadow_team_monthly',
      'gitshadow_pro_yearly',
      'gitshadow_team_yearly'
    ];

    for (const lookupKey of lookupKeys) {
      try {
        const prices = await stripe.prices.list({
          lookup_keys: [lookupKey],
        });
        
        if (prices.data.length > 0) {
          const price = prices.data[0];
          console.log(`✅ ${lookupKey}: ${price.id} - ${price.unit_amount / 100}${price.currency.toUpperCase()}/${price.recurring?.interval || 'one-time'}`);
        } else {
          console.log(`❌ ${lookupKey}: Aucun prix trouvé`);
        }
      } catch (error) {
        console.log(`❌ ${lookupKey}: ${error.message}`);
      }
    }

    console.log('\n📊 Test de création de session avec lookup key...');
    
    // Test de création d'une session de checkout avec lookup key
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1RqJLI4AxuUKnAS0dbZL5O9E',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:8000/success',
      cancel_url: 'http://localhost:8000/cancel',
      customer_email: 'test@example.com',
    });

    console.log(`✅ Session créée: ${session.id}`);
    console.log(`🔗 URL: ${session.url}`);

    console.log('\n✨ Test des nouveaux prix terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testNewPrices(); 