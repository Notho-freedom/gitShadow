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

// Produits GitShadow valides (ceux qu'on veut garder)
const VALID_PRODUCTS = [
  'GitShadow Pro - Mensuel',
  'GitShadow Pro - Annuel', 
  'GitShadow Team - Mensuel',
  'GitShadow Team - Annuel'
];

const VALID_LOOKUP_KEYS = [
  'gitshadow_pro_monthly',
  'gitshadow_pro_yearly',
  'gitshadow_team_monthly', 
  'gitshadow_team_yearly'
];

async function cleanupStripeProducts() {
  console.log('🧹 Nettoyage des Produits Stripe');
  console.log('================================\n');

  try {
    console.log('📋 Produits GitShadow valides :');
    VALID_PRODUCTS.forEach(product => console.log(`   ✅ ${product}`));
    console.log('');

    // Récupérer tous les produits
    console.log('🔍 Récupération de tous les produits Stripe...\n');
    
    const allProducts = [];
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const products = await stripe.products.list(params);
      allProducts.push(...products.data);

      if (products.has_more) {
        startingAfter = products.data[products.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    console.log(`📊 Total des produits trouvés : ${allProducts.length}\n`);

    // Récupérer tous les prix
    console.log('🔍 Récupération de tous les prix Stripe...\n');
    
    const allPrices = [];
    hasMore = true;
    startingAfter = null;

    while (hasMore) {
      const params = { limit: 100 };
      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const prices = await stripe.prices.list(params);
      allPrices.push(...prices.data);

      if (prices.has_more) {
        startingAfter = prices.data[prices.data.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    console.log(`📊 Total des prix trouvés : ${allPrices.length}\n`);

    // Analyser les produits
    const productsToKeep = [];
    const productsToArchive = [];
    const pricesToArchive = [];

    console.log('🔍 Analyse des produits...\n');

    for (const product of allProducts) {
      const isGitShadowProduct = VALID_PRODUCTS.includes(product.name);
      
      if (isGitShadowProduct) {
        productsToKeep.push(product);
        console.log(`✅ À conserver : ${product.name} (${product.id})`);
      } else {
        productsToArchive.push(product);
        console.log(`🗑️ À archiver : ${product.name} (${product.id})`);
      }
    }

    // Analyser les prix
    console.log('\n🔍 Analyse des prix...\n');

    for (const price of allPrices) {
      const isGitShadowPrice = VALID_LOOKUP_KEYS.includes(price.lookup_key);
      
      if (isGitShadowPrice) {
        console.log(`✅ Prix à conserver : ${price.lookup_key} (${price.id})`);
      } else {
        pricesToArchive.push(price);
        console.log(`🗑️ Prix à archiver : ${price.lookup_key || 'Pas de lookup key'} (${price.id})`);
      }
    }

    // Résumé
    console.log('\n📊 Résumé :');
    console.log(`   Produits à conserver : ${productsToKeep.length}`);
    console.log(`   Produits à archiver : ${productsToArchive.length}`);
    console.log(`   Prix à archiver : ${pricesToArchive.length}`);

    if (productsToArchive.length === 0 && pricesToArchive.length === 0) {
      console.log('\n✨ Aucun produit à archiver ! Tout est propre.');
      return;
    }

    // Demander confirmation
    console.log('\n⚠️ ATTENTION : Cette action va archiver les produits non-GitShadow !');
    console.log('Les produits archivés ne seront plus visibles dans le dashboard.');
    
    // En mode automatique, on archive directement
    console.log('\n🚀 Archivage en cours...\n');

    // Archiver les produits non-GitShadow
    for (const product of productsToArchive) {
      try {
        console.log(`🗑️ Archivage du produit : ${product.name} (${product.id})`);
        
        // Vérifier si le produit a un prix par défaut
        if (product.default_price) {
          console.log(`   ⚠️ Produit avec prix par défaut : ${product.default_price}`);
          
          // Supprimer la référence du prix par défaut du produit
          try {
            await stripe.products.update(product.id, { default_price: null });
            console.log(`   ✅ Prix par défaut supprimé du produit`);
          } catch (error) {
            console.log(`   ❌ Erreur suppression prix par défaut : ${error.message}`);
          }
        }
        
        // Vérifier tous les prix du produit
        const prices = await stripe.prices.list({ product: product.id });
        console.log(`   📊 Prix trouvés : ${prices.data.length}`);
        
        // Désactiver tous les prix du produit
        for (const price of prices.data) {
          try {
            await stripe.prices.update(price.id, { active: false });
            console.log(`   ✅ Prix désactivé : ${price.id}`);
          } catch (error) {
            console.log(`   ❌ Erreur désactivation prix ${price.id}: ${error.message}`);
          }
        }
        
        // Archiver le produit (changer le nom pour indiquer qu'il est archivé)
        try {
          await stripe.products.update(product.id, { 
            name: `[ARCHIVÉ] ${product.name}`,
            active: false 
          });
          console.log(`✅ Produit archivé : ${product.name} (${product.id})`);
        } catch (error) {
          console.log(`❌ Erreur archivage produit ${product.id}: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur lors du traitement du produit ${product.id}: ${error.message}`);
      }
    }

    console.log('\n✨ Archivage terminé !');
    console.log('\n📋 Produits conservés :');
    productsToKeep.forEach(product => {
      console.log(`   ✅ ${product.name} (${product.id})`);
    });

    console.log('\n📋 Produits archivés :');
    productsToArchive.forEach(product => {
      console.log(`   🗑️ [ARCHIVÉ] ${product.name} (${product.id})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

cleanupStripeProducts(); 