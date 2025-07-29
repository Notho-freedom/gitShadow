const stripe = require('stripe')('sk_test_51RpH6E3x7zjrTOGvhGgcBHSUyyJUtmoj4VP6ynb3OnVVUMmeHrJQuelr3SymFCldsXTKK19ipBfoUhailAmX1qlb00A58Nshoz');

// Configuration des plans d'abonnement pour gitShadow
const SUBSCRIPTION_PLANS = {
  gratuit: {
    name: 'Gratuit',
    subtitle: 'Parfait pour commencer',
    description: 'Plan gratuit pour découvrir gitShadow',
    price: 0, // 0€
    currency: 'eur',
    interval: 'month',
    icon: '⚡',
    isPopular: false,
    features: [
      'Jusqu\'à 3 dépôts',
      'Documentation de base',
      'Support communautaire',
      '1 utilisateur',
      'Limite de 100 fichiers par dépôt'
    ],
    limitations: [
      'Pas de documentation avancée',
      'Pas d\'export PDF',
      'Pas de collaboration en équipe'
    ],
    stripePriceId: null,
    stripeProductId: null
  },
  pro: {
    name: 'Pro',
    subtitle: 'Pour les développeurs professionnels',
    description: 'Plan professionnel avec fonctionnalités avancées',
    price: 1900, // 19€
    currency: 'eur',
    interval: 'month',
    icon: '⭐',
    isPopular: true,
    features: [
      'Dépôts illimités',
      'Documentation avancée avec IA',
      'Export PDF/Word',
      'Support prioritaire',
      'Jusqu\'à 5 utilisateurs',
      'Historique des versions',
      'Intégrations avancées',
      'Analytics détaillées'
    ],
    limitations: [
      'Pas de fonctionnalités entreprise',
      'Limite de 5 utilisateurs'
    ],
    stripePriceId: null,
    stripeProductId: null
  },
  equipe: {
    name: 'Équipe',
    subtitle: 'Pour les équipes de développement',
    description: 'Collaboration en équipe avec gestion des rôles',
    price: 4900, // 49€
    currency: 'eur',
    interval: 'month',
    icon: '👥',
    isPopular: false,
    features: [
      'Tout du plan Pro',
      'Jusqu\'à 20 utilisateurs',
      'Collaboration en temps réel',
      'Gestion des rôles',
      'SSO (Single Sign-On)',
      'API personnalisée',
      'Support dédié',
      'Formation personnalisée'
    ],
    limitations: [
      'Pas de fonctionnalités entreprise avancées'
    ],
    stripePriceId: null,
    stripeProductId: null
  },
  entreprise: {
    name: 'Entreprise',
    subtitle: 'Pour les grandes organisations',
    description: 'Solution complète pour entreprises',
    price: 19900, // 199€
    currency: 'eur',
    interval: 'month',
    icon: '⚙️',
    isPopular: false,
    features: [
      'Tout des plans précédents',
      'Utilisateurs illimités',
      'Déploiement sur site',
      'Support 24/7',
      'SLA garanti',
      'Audit de sécurité',
      'Formation complète',
      'Intégrations personnalisées'
    ],
    limitations: [],
    stripePriceId: null,
    stripeProductId: null
  }
};

class SubscriptionPlansManager {
  constructor() {
    this.plans = SUBSCRIPTION_PLANS;
  }

  // Initialiser les produits et prix Stripe
  async initializePlans() {
    console.log('🚀 Initialisation des plans d\'abonnement gitShadow...');

    for (const [planId, plan] of Object.entries(this.plans)) {
      try {
        // Ne pas créer de produit pour le plan gratuit
        if (planId === 'gratuit') {
          console.log(`✅ Plan ${plan.name} (gratuit) - Pas de produit Stripe nécessaire`);
          continue;
        }

        // Créer le produit Stripe
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            planId: planId,
            features: JSON.stringify(plan.features),
            limitations: JSON.stringify(plan.limitations),
            isPopular: plan.isPopular.toString()
          }
        });

        // Créer le prix Stripe
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price,
          currency: plan.currency,
          recurring: {
            interval: plan.interval
          },
          metadata: {
            planId: planId
          }
        });

        // Mettre à jour la configuration
        this.plans[planId].stripeProductId = product.id;
        this.plans[planId].stripePriceId = price.id;

        console.log(`✅ Plan ${plan.name} initialisé: ${product.id} / ${price.id}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'initialisation du plan ${planId}:`, error.message);
      }
    }

    console.log('✅ Tous les plans d\'abonnement gitShadow ont été initialisés !');
    return this.plans;
  }

  // Obtenir un plan par ID
  getPlan(planId) {
    return this.plans[planId];
  }

  // Obtenir tous les plans
  getAllPlans() {
    return this.plans;
  }

  // Créer une session de checkout pour un plan spécifique
  async createCheckoutSession(planId, customerId = null, successUrl = null, cancelUrl = null) {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} non trouvé`);
    }

    // Pour le plan gratuit, pas de checkout Stripe
    if (planId === 'gratuit') {
      return {
        id: 'free-plan',
        url: successUrl || `${process.env.YOUR_DOMAIN || 'http://localhost:3000'}/?success=true&plan=gratuit`
      };
    }

    const sessionData = {
      payment_method_types: ['card'],
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.YOUR_DOMAIN || 'http://localhost:3000'}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.YOUR_DOMAIN || 'http://localhost:3000'}?canceled=true`,
      metadata: {
        planId: planId
      }
    };

    if (customerId) {
      sessionData.customer = customerId;
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    return session;
  }

  // Créer un abonnement directement (sans checkout)
  async createSubscription(planId, customerId, trialDays = 0) {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error(`Plan ${planId} non trouvé`);
    }

    // Pour le plan gratuit, pas d'abonnement Stripe
    if (planId === 'gratuit') {
      return {
        id: 'free-subscription',
        status: 'active',
        metadata: { planId: 'gratuit' }
      };
    }

    const subscriptionData = {
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      metadata: {
        planId: planId
      }
    };

    if (trialDays > 0) {
      subscriptionData.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);
    return subscription;
  }

  // Mettre à jour un abonnement vers un autre plan
  async updateSubscription(subscriptionId, newPlanId) {
    const newPlan = this.getPlan(newPlanId);
    if (!newPlan) {
      throw new Error(`Plan ${newPlanId} non trouvé`);
    }

    // Si le nouveau plan est gratuit, annuler l'abonnement Stripe
    if (newPlanId === 'gratuit') {
      await stripe.subscriptions.cancel(subscriptionId);
      return {
        id: 'free-subscription',
        status: 'canceled',
        metadata: { planId: 'gratuit' }
      };
    }

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPlan.stripePriceId,
      }],
      metadata: {
        planId: newPlanId
      }
    });

    return subscription;
  }

  // Obtenir les fonctionnalités d'un plan
  getPlanFeatures(planId) {
    const plan = this.getPlan(planId);
    return plan ? plan.features : [];
  }

  // Obtenir les limitations d'un plan
  getPlanLimitations(planId) {
    const plan = this.getPlan(planId);
    return plan ? plan.limitations : [];
  }

  // Vérifier si un utilisateur a accès à une fonctionnalité
  hasFeature(userSubscription, feature) {
    if (!userSubscription || !userSubscription.metadata.planId) {
      return false;
    }

    const plan = this.getPlan(userSubscription.metadata.planId);
    if (!plan) {
      return false;
    }

    return plan.features.includes(feature);
  }

  // Obtenir le plan actuel d'un utilisateur
  getUserPlan(userSubscription) {
    if (!userSubscription || !userSubscription.metadata.planId) {
      return null;
    }

    return this.getPlan(userSubscription.metadata.planId);
  }

  // Vérifier si un plan est populaire
  isPlanPopular(planId) {
    const plan = this.getPlan(planId);
    return plan ? plan.isPopular : false;
  }

  // Obtenir l'icône d'un plan
  getPlanIcon(planId) {
    const plan = this.getPlan(planId);
    return plan ? plan.icon : '📦';
  }
}

module.exports = { SubscriptionPlansManager, SUBSCRIPTION_PLANS }; 