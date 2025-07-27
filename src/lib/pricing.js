export const pricingPlans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    description: 'Parfait pour commencer',
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
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: 'EUR',
    interval: 'month',
    description: 'Pour les développeurs professionnels',
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
    stripePriceId: 'price_pro_monthly',
    popular: true,
    savings: 'Économisez 20%'
  },
  {
    id: 'team',
    name: 'Équipe',
    price: 49,
    currency: 'EUR',
    interval: 'month',
    description: 'Pour les équipes de développement',
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
    stripePriceId: 'price_team_monthly',
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 199,
    currency: 'EUR',
    interval: 'month',
    description: 'Pour les grandes organisations',
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
    stripePriceId: 'price_enterprise_monthly',
    popular: false,
    custom: true
  }
];

export const annualPlans = pricingPlans.map(plan => ({
  ...plan,
  price: plan.price ? Math.round(plan.price * 10) : 0, // 2 mois gratuits
  interval: 'year',
  stripePriceId: plan.stripePriceId ? plan.stripePriceId.replace('monthly', 'yearly') : null,
  savings: plan.price && plan.price > 0 ? 'Économisez 20%' : null
}));

export const getPlanById = (id) => {
  return pricingPlans.find(plan => plan.id === id) || pricingPlans[0];
};

export const getPlanFeatures = (planId) => {
  const plan = getPlanById(planId);
  return plan ? plan.features : [];
};

export const getPlanLimitations = (planId) => {
  const plan = getPlanById(planId);
  return plan ? plan.limitations : [];
};

export const formatPrice = (price, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const getPlanLimits = (planId) => {
  const limits = {
    free: {
      repos: 3,
      files: 100,
      users: 1,
      storage: '1GB',
      apiCalls: 1000
    },
    pro: {
      repos: -1, // illimité
      files: -1,
      users: 5,
      storage: '10GB',
      apiCalls: 10000
    },
    team: {
      repos: -1,
      files: -1,
      users: 20,
      storage: '50GB',
      apiCalls: 50000
    },
    enterprise: {
      repos: -1,
      files: -1,
      users: -1,
      storage: '500GB',
      apiCalls: -1
    }
  };
  
  return limits[planId] || limits.free;
}; 