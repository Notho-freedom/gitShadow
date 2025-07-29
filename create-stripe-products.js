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

async function createStripeProducts() {
  console.log('🚀 Vérification et Création des Produits Stripe');
  console.log('==============================================\n');

  try {
    // Configuration des produits
    const products = [
      {
        name: 'GitShadow Pro - Mensuel',
        description: 'Plan Pro mensuel pour GitShadow',
        price: 1900, // 19.00 EUR en centimes
        interval: 'month',
        lookupKey: 'gitshadow_pro_monthly'
      },
      {
        name: 'GitShadow Pro - Annuel',
        description: 'Plan Pro annuel pour GitShadow (2 mois gratuits)',
        price: 19000, // 190.00 EUR en centimes
        interval: 'year',
        lookupKey: 'gitshadow_pro_yearly'
      },
      {
        name: 'GitShadow Team - Mensuel',
        description: 'Plan Team mensuel pour GitShadow',
        price: 4900, // 49.00 EUR en centimes
        interval: 'month',
        lookupKey: 'gitshadow_team_monthly'
      },
      {
        name: 'GitShadow Team - Annuel',
        description: 'Plan Team annuel pour GitShadow (2 mois gratuits)',
        price: 49000, // 490.00 EUR en centimes
        interval: 'year',
        lookupKey: 'gitshadow_team_yearly'
      }
    ];

    console.log('🔍 Vérification des produits existants...\n');

    for (const productConfig of products) {
      try {
        // Vérifier si le prix existe déjà avec cette lookup key
        const existingPrices = await stripe.prices.list({
          lookup_keys: [productConfig.lookupKey],
          limit: 1
        });

        if (existingPrices.data.length > 0) {
          const existingPrice = existingPrices.data[0];
          console.log(`✅ Produit existant trouvé: ${productConfig.name}`);
          console.log(`   Prix ID: ${existingPrice.id}`);
          console.log(`   Lookup Key: ${productConfig.lookupKey}`);
          console.log(`   Montant: ${existingPrice.unit_amount / 100}€/${productConfig.interval}\n`);
          continue;
        }

        // Si le prix n'existe pas, créer le produit et le prix
        console.log(`📦 Création du produit: ${productConfig.name}`);

        // Créer le produit
        const product = await stripe.products.create({
          name: productConfig.name,
          description: productConfig.description,
        });

        console.log(`✅ Produit créé: ${product.name} (${product.id})`);

        // Créer le prix avec lookup key
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: productConfig.price,
          currency: 'eur',
          recurring: {
            interval: productConfig.interval,
          },
          lookup_key: productConfig.lookupKey,
        });

        console.log(`✅ Prix créé: ${price.id} - ${productConfig.lookupKey}`);
        console.log(`💰 Montant: ${price.unit_amount / 100}€/${productConfig.interval}\n`);

      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${productConfig.name}:`, error.message);
      }
    }

    console.log('✨ Vérification et création terminées !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Les produits sont maintenant configurés dans votre dashboard Stripe');
    console.log('2. Configurez les webhooks dans votre dashboard Stripe');
    console.log('3. Testez avec les cartes de test');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification/création des produits:', error.message);
  }
}

createStripeProducts(); 