const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');
const Database = require('./database');

// Fonction pour tester la base de données
async function testDatabase() {
  console.log('🧪 Test de la base de données JSON...\n');

  const db = new Database();

  try {
    // Attendre l'initialisation de la base de données
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Créer un client de test
    const customer = await stripe.customers.create({
      email: 'test-db@example.com',
      name: 'Test Database Customer'
    });
    console.log(`✅ Client Stripe créé: ${customer.id}`);

    // Créer un produit de test
    const product = await stripe.products.create({
      name: 'Test Database Product',
      description: 'Produit de test pour la base de données'
    });
    console.log(`✅ Produit Stripe créé: ${product.id}`);

    // Créer un prix de test
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2000, // 20€
      currency: 'eur',
      recurring: {
        interval: 'month'
      }
    });
    console.log(`✅ Prix Stripe créé: ${price.id}`);

    // Créer un abonnement de test
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      trial_period_days: 7
    });
    console.log(`✅ Abonnement Stripe créé: ${subscription.id}`);

    // Attendre un peu pour que les webhooks soient traités
    console.log('⏳ Attente du traitement des webhooks...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Créer une facture de test séparée (optionnel)
    try {
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'charge_automatically',
        auto_advance: true,
      });

      // Vérifier si la facture n'est pas déjà payée
      if (!invoice.paid) {
        await stripe.invoices.finalizeInvoice(invoice.id);
        await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
        console.log(`✅ Facture Stripe payée: ${invoice.id}`);
      } else {
        console.log(`✅ Facture Stripe déjà payée: ${invoice.id}`);
      }
    } catch (error) {
      console.log(`⚠️ Impossible de créer une facture supplémentaire: ${error.message}`);
    }

    // Test de la base de données
    console.log('\n📊 Test de la base de données...');

    // Vérifier les statistiques
    const stats = await db.getStats();
    console.log('📈 Statistiques:', stats);

    // Vérifier les clients
    const customers = await db.readFile(db.customersFile);
    console.log(`👥 Clients en base: ${customers.length}`);

    // Vérifier les abonnements
    const subscriptions = await db.readFile(db.subscriptionsFile);
    console.log(`📅 Abonnements en base: ${subscriptions.length}`);

    // Vérifier les paiements
    const payments = await db.readFile(db.paymentsFile);
    console.log(`💰 Paiements en base: ${payments.length}`);

    // Vérifier les événements
    const events = await db.readFile(db.eventsFile);
    console.log(`📝 Événements en base: ${events.length}`);

    // Test des API endpoints
    console.log('\n🌐 Test des API endpoints...');
    
    const baseUrl = 'http://localhost:4242';
    
    try {
      const statsResponse = await fetch(`${baseUrl}/api/stats`);
      const statsData = await statsResponse.json();
      console.log('✅ API /api/stats:', statsData);

      const customersResponse = await fetch(`${baseUrl}/api/customers`);
      const customersData = await customersResponse.json();
      console.log(`✅ API /api/customers: ${customersData.length} clients`);

      const subscriptionsResponse = await fetch(`${baseUrl}/api/subscriptions`);
      const subscriptionsData = await subscriptionsResponse.json();
      console.log(`✅ API /api/subscriptions: ${subscriptionsData.length} abonnements`);

      const paymentsResponse = await fetch(`${baseUrl}/api/payments`);
      const paymentsData = await paymentsResponse.json();
      console.log(`✅ API /api/payments: ${paymentsData.length} paiements`);

      const eventsResponse = await fetch(`${baseUrl}/api/events?limit=5`);
      const eventsData = await eventsResponse.json();
      console.log(`✅ API /api/events: ${eventsData.length} événements`);

    } catch (error) {
      console.log('⚠️ Serveur non démarré, impossible de tester les API');
    }

    console.log('\n🎉 Test de la base de données terminé avec succès !');
    console.log('Vérifiez le tableau de bord web pour voir les données.');

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
      email: 'test-db@example.com',
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
      if (product.name.includes('Test Database')) {
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
    testDatabase();
  }
}

module.exports = { testDatabase, cleanupTestData }; 