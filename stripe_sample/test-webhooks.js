const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');

// Fonction pour tester les webhooks
async function testWebhooks() {
  console.log('🧪 Test des webhooks Stripe...\n');

  try {
    // Créer un client de test
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer'
    });
    console.log(`✅ Client créé: ${customer.id}`);

    // Créer un produit de test
    const product = await stripe.products.create({
      name: 'Test Product',
      description: 'Produit de test pour les webhooks'
    });
    console.log(`✅ Produit créé: ${product.id}`);

    // Créer un prix de test
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2000, // 20€
      currency: 'eur',
      recurring: {
        interval: 'month'
      }
    });
    console.log(`✅ Prix créé: ${price.id}`);

    // Créer un abonnement de test
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 7
    });
    console.log(`✅ Abonnement créé: ${subscription.id}`);

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('Vérifiez les logs du serveur pour voir les événements webhook reçus.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testWebhooks();
}

module.exports = { testWebhooks }; 