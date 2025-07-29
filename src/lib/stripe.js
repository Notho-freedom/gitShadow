import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Validation des clés Stripe
export const validateStripeKeys = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante');
    return false;
  }
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY manquante');
    return false;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY invalide');
    return false;
  }
  
  if (!secretKey.startsWith('sk_')) {
    console.error('❌ STRIPE_SECRET_KEY invalide');
    return false;
  }
  
  console.log('✅ Clés Stripe valides');
  return true;
};

// Créer une session de checkout avec priceId ou lookupKey
export const createCheckoutSession = async ({
  priceId,
  lookupKey,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {},
  allowPromotionCodes = true,
  billingAddressCollection = 'required',
  mode = 'subscription'
}) => {
  try {
    // Valider les clés Stripe
    if (!validateStripeKeys()) {
      throw new Error('Configuration Stripe invalide');
    }

    let price;

    if (lookupKey) {
      // Utiliser lookup_key (méthode du sample)
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        expand: ['data.product'],
      });

      if (!prices.data.length) {
        throw new Error(`Prix non trouvé pour la clé: ${lookupKey}`);
      }

      price = prices.data[0];
      console.log(`✅ Prix trouvé via lookup_key: ${price.id} pour ${lookupKey}`);
    } else if (priceId) {
      // Utiliser priceId direct
      price = await stripe.prices.retrieve(priceId);
      console.log(`✅ Prix trouvé via priceId: ${price.id}`);
    } else {
      throw new Error('priceId ou lookupKey requis');
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: billingAddressCollection,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: allowPromotionCodes,
      customer_email: customerEmail,
      metadata: metadata,
      subscription_data: {
        metadata: metadata,
        trial_period_days: 14, // Essai gratuit de 14 jours
      },
    });

    console.log(`✅ Session de checkout créée: ${session.id}`);
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création de la session:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Créer une session de checkout personnalisée (pour Enterprise)
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
    // Valider les clés Stripe
    if (!validateStripeKeys()) {
      throw new Error('Configuration Stripe invalide');
    }

    // Créer la session de checkout avec montant personnalisé
    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
              description: productDescription,
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
      metadata: metadata,
    });

    console.log(`✅ Session de checkout personnalisée créée: ${session.id}`);
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création de la session personnalisée:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Récupérer un client
export const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du client:', error);
    throw error;
  }
};

// Créer ou récupérer un client
export const createOrRetrieveCustomer = async (email, metadata = {}) => {
  try {
    // Chercher un client existant par email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      console.log(`✅ Client existant trouvé: ${existingCustomers.data[0].id}`);
      return existingCustomers.data[0];
    }

    // Créer un nouveau client
    const customer = await stripe.customers.create({
      email: email,
      metadata: metadata,
    });

    console.log(`✅ Nouveau client créé: ${customer.id}`);
    return customer;

  } catch (error) {
    console.error('❌ Erreur lors de la création/récupération du client:', error);
    throw error;
  }
};

// Récupérer les abonnements d'un client
export const getCustomerSubscriptions = async (customerId) => {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });
    return subscriptions.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des abonnements:', error);
    throw error;
  }
};

// Annuler un abonnement
export const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  } catch (error) {
    console.error('❌ Erreur lors de l\'annulation de l\'abonnement:', error);
    throw error;
  }
};

// Réactiver un abonnement
export const reactivateSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('❌ Erreur lors de la réactivation de l\'abonnement:', error);
    throw error;
  }
};

// Mettre à jour un abonnement
export const updateSubscription = async (subscriptionId, updates) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates);
    return subscription;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
    throw error;
  }
};

// Récupérer l'historique des paiements
export const getPaymentHistory = async (customerId, limit = 100) => {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: limit,
      expand: ['data.payment_intent'],
    });
    return invoices.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

// Créer une session du portail client
export const createCustomerPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la session portail:', error);
    throw error;
  }
};

// Créer un remboursement
export const createRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
      reason: reason,
    });
    return refund;
  } catch (error) {
    console.error('❌ Erreur lors de la création du remboursement:', error);
    throw error;
  }
};

// Récupérer les événements Stripe
export const getStripeEvents = async (limit = 100, types = []) => {
  try {
    const events = await stripe.events.list({
      limit: limit,
      types: types.length > 0 ? types : undefined,
    });
    return events.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des événements:', error);
    throw error;
  }
};

// Valider la signature d'un webhook
export const validateWebhookSignature = (body, signature, secret) => {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return { success: true, event };
  } catch (error) {
    console.error('❌ Erreur de validation de signature webhook:', error);
    return { success: false, error: error.message };
  }
};

// Créer un coupon
export const createCoupon = async (couponData) => {
  try {
    const coupon = await stripe.coupons.create(couponData);
    return coupon;
  } catch (error) {
    console.error('❌ Erreur lors de la création du coupon:', error);
    throw error;
  }
};

// Récupérer un coupon
export const getCoupon = async (couponId) => {
  try {
    const coupon = await stripe.coupons.retrieve(couponId);
    return coupon;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du coupon:', error);
    throw error;
  }
}; 