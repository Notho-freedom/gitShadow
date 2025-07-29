const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');

// Fonction pour tester les notifications
async function testNotifications() {
  console.log('🧪 Test des notifications Stripe...\n');

  try {
    // Créer un client de test
    const customer = await stripe.customers.create({
      email: 'test-notifications@example.com',
      name: 'Test Notifications'
    });
    console.log(`✅ Client créé: ${customer.id}`);

    // Créer un produit de test
    const product = await stripe.products.create({
      name: 'Test Notifications Product',
      description: 'Produit de test pour les notifications'
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

    // Créer un abonnement de test (déclenche customer.subscription.created)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 7
    });
    console.log(`✅ Abonnement créé: ${subscription.id}`);

    // Attendre un peu puis mettre à jour l'abonnement (déclenche customer.subscription.updated)
    setTimeout(async () => {
      try {
        await stripe.subscriptions.update(subscription.id, {
          metadata: { test: 'notification-test' }
        });
        console.log(`✅ Abonnement mis à jour: ${subscription.id}`);
      } catch (error) {
        console.log(`⚠️ Erreur lors de la mise à jour: ${error.message}`);
      }
    }, 2000);

    // Créer une facture de test (déclenche invoice.payment_succeeded)
    setTimeout(async () => {
      try {
        const invoice = await stripe.invoices.create({
          customer: customer.id,
          collection_method: 'charge_automatically',
          auto_advance: true,
        });

        await stripe.invoices.finalizeInvoice(invoice.id);
        await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
        
        console.log(`✅ Facture payée: ${invoice.id}`);
      } catch (error) {
        console.log(`⚠️ Erreur lors du paiement: ${error.message}`);
      }
    }, 4000);

    // Créer une session de checkout (déclenche checkout.session.completed)
    setTimeout(async () => {
      try {
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [{
            price: price.id,
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: 'http://localhost:3000?success=true',
          cancel_url: 'http://localhost:3000?canceled=true',
        });
        
        console.log(`✅ Session de checkout créée: ${session.id}`);
      } catch (error) {
        console.log(`⚠️ Erreur lors de la création du checkout: ${error.message}`);
      }
    }, 6000);

    console.log('\n🎉 Tests de notifications lancés !');
    console.log('Vérifiez l\'interface web pour voir les notifications en temps réel.');
    console.log('Les notifications apparaîtront dans les prochaines secondes...');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('🧹 Nettoyage des données de test...\n');

  try {
    // Récupérer tous les clients de test
    const customers = await stripe.customers.list({
      email: 'test-notifications@example.com',
      limit: 100
    });

    for (const customer of customers.data) {
      // Supprimer les abonnements
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.del(subscription.id);
        console.log(`🗑️ Abonnement supprimé: ${subscription.id}`);
      }

      // Supprimer le client
      await stripe.customers.del(customer.id);
      console.log(`🗑️ Client supprimé: ${customer.id}`);
    }

    // Supprimer les produits de test
    const products = await stripe.products.list({
      limit: 100
    });

    for (const product of products.data) {
      if (product.name.includes('Test Notifications')) {
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
    cleanupTestData();
  } else {
    testNotifications();
  }
}

module.exports = { testNotifications, cleanupTestData }; 