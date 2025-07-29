// Charger les variables d'environnement
require('dotenv').config();

// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Database = require('./database');
const { SubscriptionPlansManager } = require('./subscription-plans');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const YOUR_DOMAIN = "http://localhost:3000";

// Webhook secrets from your Stripe dashboard
const WEBHOOK_SECRET_SNAPSHOT = process.env.WEBHOOK_SECRET_SNAPSHOT || 'whsec_ZBrup7oEMxq41NGuD6kVfsQ8BiNYvHps';
const WEBHOOK_SECRET_THIN = process.env.WEBHOOK_SECRET_THIN || 'whsec_Uvfxw888jdlp6ZECH8wxtXyJT77MMWld';

// Initialiser la base de données et le gestionnaire de plans
const db = new Database();
const plansManager = new SubscriptionPlansManager();

// Initialiser les plans au démarrage
plansManager.initializePlans().then(() => {
  console.log('✅ Plans d\'abonnement initialisés');
}).catch(error => {
  console.error('❌ Erreur lors de l\'initialisation des plans:', error);
});

// Stockage des notifications (en mémoire pour cet exemple)
let notifications = [];

// Fonction pour envoyer une notification
function sendNotification(type, title, message, data = {}) {
  const notification = {
    id: Date.now(),
    type,
    title,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  notifications.unshift(notification);
  
  // Garder seulement les 50 dernières notifications
  if (notifications.length > 50) {
    notifications = notifications.slice(0, 50);
  }
  
  // Envoyer à tous les clients connectés
  io.emit('notification', notification);
  
  console.log(`🔔 Notification: ${title} - ${message}`);
}

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('👤 Client connecté:', socket.id);
  
  // Envoyer les notifications existantes au nouveau client
  socket.emit('notifications', notifications);
  
  socket.on('disconnect', () => {
    console.log('👤 Client déconnecté:', socket.id);
  });
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    // Utiliser le gestionnaire de plans gitShadow
    const { lookup_key } = req.body;
    
    // Mapper les anciennes clés vers les nouveaux plans
    let planId = 'pro'; // Plan par défaut
    if (lookup_key === '{{PRICE_LOOKUP_KEY}}') {
      planId = 'pro';
    }
    
    // Créer une session de checkout avec le plan approprié
    const session = await plansManager.createCheckoutSession(
      planId,
      null, // customerId
      `${YOUR_DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      `${YOUR_DOMAIN}?canceled=true`
    );

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Erreur lors de la création de la session de checkout:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de checkout' });
  }
});

app.post('/create-portal-session', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  const { session_id } = req.body;
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // This is the url to which the customer will be redirected when they're done
  // managing their billing with the portal.
  const returnUrl = YOUR_DOMAIN;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });

  res.redirect(303, portalSession.url);
});

// API endpoints pour consulter les données
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await db.readFile(db.customersFile);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des clients' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await db.getCustomer(req.params.id);
    if (customer) {
      const subscriptions = await db.getCustomerSubscriptions(req.params.id);
      const payments = await db.getCustomerPayments(req.params.id);
      res.json({ customer, subscriptions, payments });
    } else {
      res.status(404).json({ error: 'Client non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du client' });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await db.readFile(db.subscriptionsFile);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des abonnements' });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    const payments = await db.readFile(db.paymentsFile);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = await db.getEvents(limit);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    const data = await db.exportData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="stripe-data-export.json"');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'export des données' });
  }
});

// API endpoints pour les plans d'abonnement
app.get('/api/plans', async (req, res) => {
  try {
    const plans = plansManager.getAllPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des plans' });
  }
});

app.get('/api/plans/:planId', async (req, res) => {
  try {
    const plan = plansManager.getPlan(req.params.planId);
    if (plan) {
      res.json(plan);
    } else {
      res.status(404).json({ error: 'Plan non trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du plan' });
  }
});

app.post('/api/checkout/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const { customerId, successUrl, cancelUrl } = req.body;

    const session = await plansManager.createCheckoutSession(
      planId,
      customerId,
      successUrl,
      cancelUrl
    );

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { planId, customerId, trialDays = 0 } = req.body;

    const subscription = await plansManager.createSubscription(
      planId,
      customerId,
      trialDays
    );

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { newPlanId } = req.body;

    const subscription = await plansManager.updateSubscription(
      subscriptionId,
      newPlanId
    );

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subscriptions/:subscriptionId/features', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    // Récupérer l'abonnement depuis Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Obtenir le plan et ses fonctionnalités
    const plan = plansManager.getUserPlan(subscription);
    const features = plan ? plan.features : [];

    res.json({ features, plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/check-feature', async (req, res) => {
  try {
    const { subscriptionId, feature } = req.body;
    
    // Récupérer l'abonnement depuis Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Vérifier l'accès à la fonctionnalité
    const hasAccess = plansManager.hasFeature(subscription, feature);

    res.json({ hasAccess, feature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activate-free-plan', async (req, res) => {
  try {
    // Créer un client gratuit dans la base de données
    const customerData = {
      id: `free_${Date.now()}`,
      email: req.body.email || 'free@example.com',
      name: req.body.name || 'Utilisateur Gratuit',
      plan: 'gratuit',
      status: 'active',
      createdAt: new Date().toISOString(),
      metadata: {
        planId: 'gratuit',
        isFreePlan: true
      }
    };

    await db.createCustomer(customerData);

    // Envoyer une notification
    sendNotification('success', 'Plan Gratuit Activé', 'Votre plan gratuit gitShadow a été activé avec succès !', {
      plan: 'gratuit',
      customerId: customerData.id
    });

    res.json({ 
      success: true, 
      message: 'Plan gratuit activé avec succès',
      customerId: customerData.id,
      plan: 'gratuit'
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation du plan gratuit:', error);
    res.status(500).json({ error: 'Erreur lors de l\'activation du plan gratuit' });
  }
});

app.post('/api/contact-enterprise', async (req, res) => {
  try {
    const { name, email, company, message } = req.body;
    
    // Enregistrer la demande de contact dans la base de données
    const contactData = {
      id: `contact_${Date.now()}`,
      name,
      email,
      company,
      message,
      plan: 'entreprise',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Ici vous pourriez envoyer un email ou enregistrer dans une base de données
    console.log('Demande de contact Entreprise:', contactData);

    // Envoyer une notification
    sendNotification('info', 'Demande Entreprise', `Nouvelle demande de contact pour le plan Entreprise de ${name}`, {
      contact: contactData
    });

    res.json({ 
      success: true, 
      message: 'Votre demande a été envoyée. Nous vous contacterons dans les plus brefs délais.'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la demande de contact:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de la demande' });
  }
});

// Webhook endpoint for Snapshot payload style
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    let event = request.body;
    
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        WEBHOOK_SECRET_SNAPSHOT
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }

    // Handle the event
    handleWebhookEvent(event);
    
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// Webhook endpoint for Thin payload style
app.post(
  '/webhook/thin',
  express.raw({ type: 'application/json' }),
  (request, response) => {
    let event = request.body;
    
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        WEBHOOK_SECRET_THIN
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed for thin payload.`, err.message);
      return response.sendStatus(400);
    }

    // Handle the event
    handleWebhookEvent(event);
    
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// Function to handle webhook events
async function handleWebhookEvent(event) {
  let subscription;
  let status;
  
  console.log(`📦 Received event: ${event.type}`);
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.trial_will_end':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🔔 Subscription trial will end - Status: ${status}`);
      await handleSubscriptionTrialEnding(subscription);
      break;
      
    case 'customer.subscription.deleted':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🗑️  Subscription deleted - Status: ${status}`);
      await handleSubscriptionDeleted(subscription);
      break;
      
    case 'customer.subscription.created':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`✅ Subscription created - Status: ${status}`);
      await handleSubscriptionCreated(subscription);
      break;
      
    case 'customer.subscription.updated':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`🔄 Subscription updated - Status: ${status}`);
      await handleSubscriptionUpdated(subscription);
      break;
      
    case 'customer.subscription.trial_ended':
      subscription = event.data.object;
      status = subscription.status;
      console.log(`⏰ Subscription trial ended - Status: ${status}`);
      await handleSubscriptionTrialEnded(subscription);
      break;
      
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log(`💰 Payment succeeded for invoice: ${invoice.id}`);
      await handlePaymentSucceeded(invoice);
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log(`❌ Payment failed for invoice: ${failedInvoice.id}`);
      await handlePaymentFailed(failedInvoice);
      break;
      
    case 'entitlements.active_entitlement_summary.updated':
      const entitlement = event.data.object;
      console.log(`🎯 Active entitlement summary updated for customer: ${entitlement.customer}`);
      await handleEntitlementUpdated(entitlement);
      break;
      
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`🛒 Checkout session completed: ${session.id}`);
      await handleCheckoutCompleted(session);
      break;
      
    default:
      // Unexpected event type
      console.log(`❓ Unhandled event type: ${event.type}`);
  }
}

// Event handler functions
async function handleSubscriptionTrialEnding(subscription) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('subscription.trial_will_end', subscription);
    
    // Mettre à jour l'abonnement dans la base de données
    await db.updateSubscription(subscription.id, {
      status: subscription.status,
      trialEnd: subscription.trial_end
    });

    // Logique métier : Envoyer un email de rappel
    const customer = await db.getCustomer(subscription.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de rappel à ${customer.email} pour l'essai qui se termine`);
    }

    sendNotification(
      'warning',
      'Essai se termine',
      `L'essai de l'abonnement se termine dans 3 jours pour le client ${subscription.customer}`,
      { customer: subscription.customer, subscription: subscription.id }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la fin d\'essai:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('subscription.deleted', subscription);
    
    // Supprimer l'abonnement de la base de données
    await db.deleteSubscription(subscription.id);

    // Logique métier : Révoquer l'accès au service
    console.log(`🔒 Révoquer l'accès au service pour le client ${subscription.customer}`);
    
    // Logique métier : Envoyer un email de confirmation de suppression
    const customer = await db.getCustomer(subscription.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de confirmation de suppression à ${customer.email}`);
    }

    sendNotification(
      'error',
      'Abonnement supprimé',
      `L'abonnement a été supprimé pour le client ${subscription.customer}`,
      { customer: subscription.customer, subscription: subscription.id }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la suppression:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('subscription.created', subscription);
    
    // Créer l'abonnement dans la base de données
    await db.createSubscription(subscription);

    // Logique métier : Accorder l'accès au service
    console.log(`✅ Accorder l'accès au service pour le client ${subscription.customer}`);
    
    // Logique métier : Envoyer un email de bienvenue
    const customer = await db.getCustomer(subscription.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de bienvenue à ${customer.email}`);
    } else {
      // Si le client n'existe pas encore, le créer
      const stripeCustomer = await stripe.customers.retrieve(subscription.customer);
      await db.createCustomer(stripeCustomer);
      console.log(`👤 Client créé: ${subscription.customer}`);
    }

    sendNotification(
      'success',
      'Nouvel abonnement',
      `Nouvel abonnement créé pour le client ${subscription.customer}`,
      { customer: subscription.customer, subscription: subscription.id, status: subscription.status }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la création:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('subscription.updated', subscription);
    
    // Mettre à jour l'abonnement dans la base de données
    await db.updateSubscription(subscription.id, {
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

    // Logique métier : Gérer les changements de statut
    if (subscription.status === 'active') {
      console.log(`✅ Réactiver l'accès pour le client ${subscription.customer}`);
    } else if (subscription.status === 'past_due') {
      console.log(`⚠️ Accès limité pour le client ${subscription.customer} (paiement en retard)`);
    } else if (subscription.status === 'canceled') {
      console.log(`🔒 Accès suspendu pour le client ${subscription.customer} (abonnement annulé)`);
    }

    sendNotification(
      'info',
      'Abonnement mis à jour',
      `L'abonnement a été mis à jour pour le client ${subscription.customer} - Statut: ${subscription.status}`,
      { customer: subscription.customer, subscription: subscription.id, status: subscription.status }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la mise à jour:', error);
  }
}

async function handleSubscriptionTrialEnded(subscription) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('subscription.trial_ended', subscription);
    
    // Mettre à jour l'abonnement dans la base de données
    await db.updateSubscription(subscription.id, {
      status: subscription.status,
      trialEnd: subscription.trial_end
    });

    // Logique métier : Gérer la fin d'essai
    if (subscription.status === 'active') {
      console.log(`✅ Conversion en abonnement payant pour le client ${subscription.customer}`);
    } else {
      console.log(`❌ Essai terminé sans conversion pour le client ${subscription.customer}`);
    }

    // Logique métier : Envoyer un email de fin d'essai
    const customer = await db.getCustomer(subscription.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de fin d'essai à ${customer.email}`);
    }

    sendNotification(
      'warning',
      'Essai terminé',
      `L'essai s'est terminé pour le client ${subscription.customer}`,
      { customer: subscription.customer, subscription: subscription.id }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la fin d\'essai:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('payment.succeeded', invoice);
    
    // Créer le paiement dans la base de données
    await db.createPayment(invoice);

    // Logique métier : Confirmer l'accès au service
    console.log(`✅ Confirmer l'accès au service pour le client ${invoice.customer}`);
    
    // Logique métier : Envoyer un reçu
    const customer = await db.getCustomer(invoice.customer);
    if (customer) {
      console.log(`📧 Envoi du reçu à ${customer.email} pour ${(invoice.amount_paid / 100).toFixed(2)}€`);
    }

    // Logique métier : Mettre à jour les statistiques
    const stats = await db.getStats();
    console.log(`📊 Statistiques mises à jour - Revenus totaux: ${stats.totalRevenue.toFixed(2)}€`);

    sendNotification(
      'success',
      'Paiement réussi',
      `Paiement confirmé pour la facture ${invoice.id} - Montant: ${(invoice.amount_paid / 100).toFixed(2)}€`,
      { customer: invoice.customer, invoice: invoice.id, amount: invoice.amount_paid }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement réussi:', error);
  }
}

async function handlePaymentFailed(invoice) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('payment.failed', invoice);
    
    // Créer le paiement dans la base de données
    await db.createPayment(invoice);

    // Logique métier : Gérer l'échec de paiement
    console.log(`❌ Gérer l'échec de paiement pour le client ${invoice.customer}`);
    
    // Logique métier : Envoyer un email de rappel
    const customer = await db.getCustomer(invoice.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de rappel de paiement à ${customer.email}`);
    }

    // Logique métier : Limiter l'accès si nécessaire
    const subscriptions = await db.getCustomerSubscriptions(invoice.customer);
    if (subscriptions.length > 0) {
      console.log(`🔒 Limiter l'accès pour le client ${invoice.customer} suite à l'échec de paiement`);
    }

    sendNotification(
      'error',
      'Paiement échoué',
      `Le paiement a échoué pour la facture ${invoice.id}`,
      { customer: invoice.customer, invoice: invoice.id }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement échoué:', error);
  }
}

async function handleEntitlementUpdated(entitlement) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('entitlement.updated', entitlement);

    // Logique métier : Synchroniser les permissions
    console.log(`🔄 Synchroniser les permissions pour le client ${entitlement.customer}`);
    
    // Logique métier : Mettre à jour les fonctionnalités disponibles
    console.log(`🎯 Mettre à jour les fonctionnalités pour le client ${entitlement.customer}`);

    sendNotification(
      'info',
      'Droits mis à jour',
      `Les droits ont été mis à jour pour le client ${entitlement.customer}`,
      { customer: entitlement.customer }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la mise à jour des droits:', error);
  }
}

async function handleCheckoutCompleted(session) {
  try {
    // Enregistrer l'événement dans la base de données
    await db.logEvent('checkout.completed', session);

    // Logique métier : Traiter la commande
    console.log(`🛒 Traiter la commande pour le client ${session.customer}`);
    
    // Logique métier : Envoyer un email de confirmation
    const customer = await db.getCustomer(session.customer);
    if (customer) {
      console.log(`📧 Envoi d'email de confirmation de commande à ${customer.email}`);
    }

    // Logique métier : Préparer l'onboarding
    console.log(`🚀 Préparer l'onboarding pour le client ${session.customer}`);

    sendNotification(
      'success',
      'Checkout terminé',
      `Checkout terminé avec succès pour le client ${session.customer}`,
      { customer: session.customer, session: session.id }
    );
  } catch (error) {
    console.error('❌ Erreur lors du traitement du checkout:', error);
  }
}

server.listen(4242, () => console.log('🚀 Server running on port 4242'));