// Configuration Stripe côté serveur
export const getStripeServer = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  
  // Importer Stripe de manière dynamique
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
};

// Configuration Stripe côté client
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    return window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return null;
};

// Créer une session de paiement
export const createCheckoutSession = async ({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {}
}) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: 'gitshadow'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {
        metadata: {
          ...metadata,
          source: 'gitshadow'
        }
      }
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    return { success: false, error: error.message };
  }
};

// Créer une session de paiement pour un montant personnalisé
export const createCustomCheckoutSession = async ({
  amount,
  currency = 'eur',
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {}
}) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'GitShadow - Plan Personnalisé',
              description: 'Plan personnalisé GitShadow',
            },
            unit_amount: amount * 100, // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: 'gitshadow',
        type: 'custom'
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement personnalisée:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les informations d'un client
export const getCustomer = async (customerId) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return { success: true, customer };
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return { success: false, error: error.message };
  }
};

// Créer ou récupérer un client
export const createOrRetrieveCustomer = async (email, metadata = {}) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    // Chercher un client existant
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return { success: true, customer: existingCustomers.data[0] };
    }

    // Créer un nouveau client
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        ...metadata,
        source: 'gitshadow'
      }
    });

    return { success: true, customer };
  } catch (error) {
    console.error('Erreur lors de la création/récupération du client:', error);
    return { success: false, error: error.message };
  }
};

// Annuler un abonnement
export const cancelSubscription = async (subscriptionId) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return { success: false, error: error.message };
  }
};

// Réactiver un abonnement
export const reactivateSubscription = async (subscriptionId) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'abonnement:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer l'historique des paiements
export const getPaymentHistory = async (customerId) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 100,
    });
    return { success: true, payments: payments.data };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
    return { success: false, error: error.message };
  }
};

// Créer un portail client
export const createCustomerPortalSession = async (customerId, returnUrl) => {
  const stripe = getStripeServer();
  if (!stripe) {
    return { success: false, error: 'Stripe not configured' };
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return { success: true, url: session.url };
  } catch (error) {
    console.error('Erreur lors de la création du portail client:', error);
    return { success: false, error: error.message };
  }
}; 