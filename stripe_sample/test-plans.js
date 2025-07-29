const { SubscriptionPlansManager } = require('./subscription-plans');

// Fonction pour tester les plans d'abonnement
async function testPlans() {
  console.log('🧪 Test des plans d\'abonnement...\n');

  const plansManager = new SubscriptionPlansManager();

  try {
    // Initialiser les plans
    console.log('🚀 Initialisation des plans...');
    const plans = await plansManager.initializePlans();
    console.log('✅ Plans initialisés avec succès !\n');

    // Afficher tous les plans
    console.log('📋 Plans disponibles :');
    Object.entries(plans).forEach(([planId, plan]) => {
      console.log(`\n📦 ${plan.name} (${planId})`);
      console.log(`   Prix: ${(plan.price / 100).toFixed(2)}€/mois`);
      console.log(`   Description: ${plan.description}`);
      console.log(`   Produit Stripe: ${plan.stripeProductId}`);
      console.log(`   Prix Stripe: ${plan.stripePriceId}`);
      console.log('   Fonctionnalités:');
      plan.features.forEach(feature => {
        console.log(`     ✅ ${feature}`);
      });
    });

    // Test des API endpoints
    console.log('\n🌐 Test des API endpoints...');
    
    const baseUrl = 'http://localhost:4242';
    
    try {
      // Test de récupération des plans
      const plansResponse = await fetch(`${baseUrl}/api/plans`);
      const plansData = await plansResponse.json();
      console.log('✅ API /api/plans:', Object.keys(plansData).length, 'plans');

      // Test de récupération d'un plan spécifique
      const basicPlanResponse = await fetch(`${baseUrl}/api/plans/basic`);
      const basicPlanData = await basicPlanResponse.json();
      console.log('✅ API /api/plans/basic:', basicPlanData.name);

      // Test de création d'une session de checkout
      const checkoutResponse = await fetch(`${baseUrl}/api/checkout/basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          successUrl: 'http://localhost:3000/?success=true',
          cancelUrl: 'http://localhost:3000?canceled=true'
        })
      });
      
      if (checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();
        console.log('✅ API /api/checkout/basic: Session créée');
        console.log('   URL de checkout:', checkoutData.url);
      } else {
        console.log('⚠️ API /api/checkout/basic: Erreur');
      }

    } catch (error) {
      console.log('⚠️ Serveur non démarré, impossible de tester les API');
    }

    console.log('\n🎉 Test des plans d\'abonnement terminé avec succès !');
    console.log('Vous pouvez maintenant utiliser les plans dans votre application.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction pour nettoyer les plans de test
async function cleanupPlans() {
  console.log('🧹 Nettoyage des plans de test...\n');

  try {
    const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');

    // Récupérer tous les produits de test
    const products = await stripe.products.list({
      limit: 100
    });

    for (const product of products.data) {
      if (product.name.includes('Plan') || product.name.includes('Basique') || product.name.includes('Pro') || product.name.includes('Enterprise')) {
        // Supprimer les prix associés
        const prices = await stripe.prices.list({
          product: product.id
        });

        for (const price of prices.data) {
          await stripe.prices.update(price.id, { active: false });
          console.log(`🗑️ Prix supprimé: ${price.id}`);
        }

        // Supprimer le produit
        await stripe.products.del(product.id);
        console.log(`🗑️ Produit supprimé: ${product.id}`);
      }
    }

    console.log('✅ Nettoyage terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'cleanup') {
    cleanupPlans();
  } else {
    testPlans();
  }
}

module.exports = { testPlans, cleanupPlans }; 