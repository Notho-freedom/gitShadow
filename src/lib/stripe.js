import Stripe from 'stripe';

// Configuration Stripe côté serveur
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Configuration Stripe côté client
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    return window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return null;
};

// Validation des clés Stripe
export const validateStripeKeys = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!secretKey || !publishableKey) {
    throw new Error('Clés Stripe manquantes dans les variables d\'environnement');
  }
  
  if (!secretKey.startsWith('sk_') || !publishableKey.startsWith('pk_')) {
    throw new Error('Format de clé Stripe invalide');
  }
  
  return true;
};

// Créer une session de paiement
export const createCheckoutSession = async ({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {},
  allowPromotionCodes = true,
  billingAddressCollection = 'required',
  mode = 'subscription'
}) => {
  try {
    validateStripeKeys();
    
    if (!priceId) {
      throw new Error('ID de prix requis');
    }
    
    if (!customerEmail) {
      throw new Error('Email client requis');
    }
    
    if (!successUrl || !cancelUrl) {
      throw new Error('URLs de succès et d\'annulation requises');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        source: 'gitshadow',
        timestamp: new Date().toISOString()
      },
      allow_promotion_codes: allowPromotionCodes,
      billing_address_collection: billingAddressCollection,
      subscription_data: mode === 'subscription' ? {
        metadata: {
          ...metadata,
          source: 'gitshadow'
        }
      } : undefined,
      payment_intent_data: mode === 'payment' ? {
        metadata: {
          ...metadata,
          source: 'gitshadow'
        }
      } : undefined,
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
      consent_collection: {
        terms_of_service: 'required',
      },
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
  metadata = {},
  productName = 'GitShadow - Plan Personnalisé',
  productDescription = 'Plan personnalisé GitShadow'
}) => {
  try {
    validateStripeKeys();
    
    if (!amount || amount <= 0) {
      throw new Error('Montant invalide');
    }
    
    if (!customerEmail) {
      throw new Error('Email client requis');
    }
    
    if (!successUrl || !cancelUrl) {
      throw new Error('URLs de succès et d\'annulation requises');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
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
        type: 'custom',
        timestamp: new Date().toISOString()
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      },
      tax_id_collection: {
        enabled: true,
      },
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement personnalisée:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les informations d'un client
export const getCustomer = async (customerId) => {
  try {
    validateStripeKeys();
    
    if (!customerId) {
      throw new Error('ID client requis');
    }
    
    const customer = await stripe.customers.retrieve(customerId);
    return { success: true, customer };
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return { success: false, error: error.message };
  }
};

// Créer ou récupérer un client
export const createOrRetrieveCustomer = async (email, metadata = {}) => {
  try {
    validateStripeKeys();
    
    if (!email) {
      throw new Error('Email requis');
    }
    
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
        source: 'gitshadow',
        created_at: new Date().toISOString()
      }
    });

    return { success: true, customer };
  } catch (error) {
    console.error('Erreur lors de la création/récupération du client:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les abonnements d'un client
export const getCustomerSubscriptions = async (customerId) => {
  try {
    validateStripeKeys();
    
    if (!customerId) {
      throw new Error('ID client requis');
    }
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
    
    return { success: true, subscriptions: subscriptions.data };
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    return { success: false, error: error.message };
  }
};

// Annuler un abonnement
export const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    validateStripeKeys();
    
    if (!subscriptionId) {
      throw new Error('ID d\'abonnement requis');
    }
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return { success: false, error: error.message };
  }
};

// Réactiver un abonnement
export const reactivateSubscription = async (subscriptionId) => {
  try {
    validateStripeKeys();
    
    if (!subscriptionId) {
      throw new Error('ID d\'abonnement requis');
    }
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return { success: true, subscription };
  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'abonnement:', error);
    return { success: false, error: error.message };
  }
};

// Mettre à jour un abonnement
export const updateSubscription = async (subscriptionId, updates) => {
  try {
    validateStripeKeys();
    
    if (!subscriptionId) {
      throw new Error('ID d\'abonnement requis');
    }
    
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    return { success: true, subscription };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer l'historique des paiements
export const getPaymentHistory = async (customerId, limit = 100) => {
  try {
    validateStripeKeys();
    
    if (!customerId) {
      throw new Error('ID client requis');
    }
    
    const payments = await stripe.paymentIntents.list({
      customer: customerId,
      limit: limit,
    });
    
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: limit,
    });
    
    return { 
      success: true, 
      payments: payments.data,
      invoices: invoices.data
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique des paiements:', error);
    return { success: false, error: error.message };
  }
};

// Créer un portail client
export const createCustomerPortalSession = async (customerId, returnUrl) => {
  try {
    validateStripeKeys();
    
    if (!customerId) {
      throw new Error('ID client requis');
    }
    
    if (!returnUrl) {
      throw new Error('URL de retour requise');
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID,
    });
    return { success: true, url: session.url };
  } catch (error) {
    console.error('Erreur lors de la création du portail client:', error);
    return { success: false, error: error.message };
  }
};

// Créer un remboursement
export const createRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    validateStripeKeys();
    
    if (!paymentIntentId) {
      throw new Error('ID de paiement requis');
    }
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason,
    });
    
    return { success: true, refund };
  } catch (error) {
    console.error('Erreur lors de la création du remboursement:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer les événements Stripe
export const getStripeEvents = async (limit = 100, types = []) => {
  try {
    validateStripeKeys();
    
    const events = await stripe.events.list({
      limit: limit,
      types: types.length > 0 ? types : undefined,
    });
    
    return { success: true, events: events.data };
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    return { success: false, error: error.message };
  }
};

// Valider une signature webhook
export const validateWebhookSignature = (body, signature, secret) => {
  try {
    if (!body || !signature || !secret) {
      throw new Error('Paramètres de validation manquants');
    }
    
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return { success: true, event };
  } catch (error) {
    console.error('Erreur de validation de signature webhook:', error);
    return { success: false, error: error.message };
  }
};

// Créer un coupon
export const createCoupon = async (couponData) => {
  try {
    validateStripeKeys();
    
    const coupon = await stripe.coupons.create(couponData);
    return { success: true, coupon };
  } catch (error) {
    console.error('Erreur lors de la création du coupon:', error);
    return { success: false, error: error.message };
  }
};

// Récupérer un coupon
export const getCoupon = async (couponId) => {
  try {
    validateStripeKeys();
    
    const coupon = await stripe.coupons.retrieve(couponId);
    return { success: true, coupon };
  } catch (error) {
    console.error('Erreur lors de la récupération du coupon:', error);
    return { success: false, error: error.message };
  }
}; 