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

async function testStripePrices() {
  console.log('🧪 Test des Prix Stripe');
  console.log('========================\n');

  try {
    // Test des IDs de prix existants
    const priceIds = [
      'price_1RqJC73x7zjrTOGvj5lGkqYF', // Pro mensuel
      'price_1RqJC83x7zjrTOGvi5X8hj3q', // Team mensuel
      'price_1RqJAu3x7zjrTOGvqr1dHVp0', // Pro annuel
      'price_1RqJAu3x7zjrTOGvPv4s94gj'  // Team annuel
    ];

    console.log('🔍 Vérification des IDs de prix...\n');

    for (const priceId of priceIds) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ ${priceId}: ${price.product} - ${price.unit_amount / 100}${price.currency.toUpperCase()}/${price.recurring?.interval || 'one-time'}`);
      } catch (error) {
        console.log(`❌ ${priceId}: ${error.message}`);
      }
    }

    console.log('\n📊 Test de création de session...');
    
    // Test de création d'une session de checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1RqJC73x7zjrTOGvj5lGkqYF',
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

    console.log('\n✨ Test Stripe terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test Stripe:', error.message);
  }
}

testStripePrices(); 