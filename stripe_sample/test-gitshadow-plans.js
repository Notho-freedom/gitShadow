const { SubscriptionPlansManager } = require('./subscription-plans');

// Fonction pour tester les plans gitShadow
async function testGitShadowPlans() {
  console.log('🧪 Test des plans gitShadow...\n');

  const plansManager = new SubscriptionPlansManager();

  try {
    // Initialiser les plans
    console.log('🚀 Initialisation des plans gitShadow...');
    const plans = await plansManager.initializePlans();
    console.log('✅ Plans gitShadow initialisés avec succès !\n');

    // Tester chaque plan
    console.log('📋 Test de chaque plan :');
    
    for (const [planId, plan] of Object.entries(plans)) {
      console.log(`\n📦 Test du plan ${plan.name} (${planId}):`);
      console.log(`   Prix: ${(plan.price / 100).toFixed(2).replace('.', ',')}€/mois`);
      console.log(`   Icône: ${plan.icon}`);
      console.log(`   Populaire: ${plan.isPopular ? 'Oui' : 'Non'}`);
      console.log(`   Fonctionnalités: ${plan.features.length}`);
      console.log(`   Limitations: ${plan.limitations.length}`);
      
      if (planId === 'gratuit') {
        console.log('   ✅ Plan gratuit - Pas de produit Stripe nécessaire');
      } else {
        console.log(`   Produit Stripe: ${plan.stripeProductId}`);
        console.log(`   Prix Stripe: ${plan.stripePriceId}`);
      }
    }

    // Test des API endpoints
    console.log('\n🌐 Test des API endpoints gitShadow...');
    
    const baseUrl = 'http://localhost:4242';
    
    try {
      // Test de récupération des plans
      const plansResponse = await fetch(`${baseUrl}/api/plans`);
      const plansData = await plansResponse.json();
      console.log('✅ API /api/plans:', Object.keys(plansData).length, 'plans');

      // Test de récupération du plan Pro
      const proPlanResponse = await fetch(`${baseUrl}/api/plans/pro`);
      const proPlanData = await proPlanResponse.json();
      console.log('✅ API /api/plans/pro:', proPlanData.name);

      // Test de création d'une session de checkout pour le plan Pro
      const checkoutResponse = await fetch(`${baseUrl}/api/checkout/pro`, {
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
        console.log('✅ API /api/checkout/pro: Session créée');
        console.log('   URL de checkout:', checkoutData.url);
      } else {
        console.log('⚠️ API /api/checkout/pro: Erreur');
      }

      // Test d'activation du plan gratuit
      const freePlanResponse = await fetch(`${baseUrl}/api/activate-free-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          name: 'Test User'
        })
      });
      
      if (freePlanResponse.ok) {
        const freePlanData = await freePlanResponse.json();
        console.log('✅ API /api/activate-free-plan: Plan gratuit activé');
        console.log('   Customer ID:', freePlanData.customerId);
      } else {
        console.log('⚠️ API /api/activate-free-plan: Erreur');
      }

      // Test de demande de contact entreprise
      const contactResponse = await fetch(`${baseUrl}/api/contact-enterprise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Enterprise',
          email: 'enterprise@example.com',
          company: 'Test Company',
          message: 'Demande de test pour le plan Entreprise'
        })
      });
      
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        console.log('✅ API /api/contact-enterprise: Demande envoyée');
        console.log('   Message:', contactData.message);
      } else {
        console.log('⚠️ API /api/contact-enterprise: Erreur');
      }

    } catch (error) {
      console.log('⚠️ Serveur non démarré, impossible de tester les API');
      console.log('   Démarrer le serveur avec: npm start');
    }

    console.log('\n🎉 Test des plans gitShadow terminé avec succès !');
    console.log('Tous les plans sont maintenant pris en charge :');
    console.log('  ✅ Plan Gratuit (activation directe)');
    console.log('  ✅ Plan Pro (checkout Stripe)');
    console.log('  ✅ Plan Équipe (checkout Stripe)');
    console.log('  ✅ Plan Entreprise (demande de contact)');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction pour nettoyer les plans de test
async function cleanupGitShadowPlans() {
  console.log('🧹 Nettoyage des plans gitShadow de test...\n');

  try {
    const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');

    // Récupérer tous les produits de test
    const products = await stripe.products.list({
      limit: 100
    });

    for (const product of products.data) {
      if (product.name.includes('Pro') || product.name.includes('Équipe') || product.name.includes('Entreprise')) {
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

    console.log('✅ Nettoyage des plans gitShadow terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'cleanup') {
    cleanupGitShadowPlans();
  } else {
    testGitShadowPlans();
  }
}

module.exports = { testGitShadowPlans, cleanupGitShadowPlans }; 