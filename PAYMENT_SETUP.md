# Configuration du Système de Paiement GitShadow

## 🚀 Vue d'ensemble

GitShadow utilise **Stripe** comme processeur de paiement pour offrir une expérience de paiement sécurisée et fiable.

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Clés API Stripe** : Récupérez vos clés de test et de production
3. **Webhook Stripe** : Configurez les webhooks pour les événements de paiement

## 🔧 Configuration

### 1. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# GitHub OAuth (déjà configuré)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:8000
```

### 2. Configuration Stripe

#### A. Créer les Produits et Prix

Dans votre dashboard Stripe, créez les produits suivants :

1. **Plan Pro Mensuel**
   - Nom : `GitShadow Pro - Mensuel`
   - Prix : `19.00 EUR`
   - Intervalle : `Mensuel`
   - ID de prix : `price_pro_monthly`

2. **Plan Pro Annuel**
   - Nom : `GitShadow Pro - Annuel`
   - Prix : `190.00 EUR`
   - Intervalle : `Annuel`
   - ID de prix : `price_pro_yearly`

3. **Plan Team Mensuel**
   - Nom : `GitShadow Team - Mensuel`
   - Prix : `49.00 EUR`
   - Intervalle : `Mensuel`
   - ID de prix : `price_team_monthly`

4. **Plan Team Annuel**
   - Nom : `GitShadow Team - Annuel`
   - Prix : `490.00 EUR`
   - Intervalle : `Annuel`
   - ID de prix : `price_team_yearly`

5. **Plan Enterprise**
   - Nom : `GitShadow Enterprise`
   - Prix : `199.00 EUR`
   - Intervalle : `Mensuel`
   - ID de prix : `price_enterprise_monthly`

#### B. Configuration des Webhooks

1. Allez dans **Developers > Webhooks** dans votre dashboard Stripe
2. Cliquez sur **Add endpoint**
3. URL : `https://votre-domaine.com/api/payment/webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

5. Copiez le **Webhook signing secret** et ajoutez-le à `STRIPE_WEBHOOK_SECRET`

### 3. Configuration de l'Application

#### A. Mise à jour des IDs de Prix

Modifiez le fichier `src/lib/pricing.js` pour utiliser vos vrais IDs de prix Stripe :

```javascript
export const pricingPlans = [
  {
    id: 'free',
    // ... autres propriétés
    stripePriceId: null, // Plan gratuit
  },
  {
    id: 'pro',
    // ... autres propriétés
    stripePriceId: 'price_pro_monthly', // Votre ID de prix
  },
  // ... autres plans
];
```

#### B. Configuration du Portail Client

Dans votre dashboard Stripe :
1. Allez dans **Settings > Billing > Customer Portal**
2. Activez le portail client
3. Configurez les fonctionnalités disponibles :
   - ✅ Mise à jour des méthodes de paiement
   - ✅ Annulation d'abonnement
   - ✅ Historique des factures
   - ✅ Téléchargement de factures

## 🧪 Test du Système

### 1. Cartes de Test Stripe

Utilisez ces cartes pour tester :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

### 2. Test des Webhooks

Utilisez l'outil CLI Stripe pour tester les webhooks localement :

```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:8000/api/payment/webhook

# Dans un autre terminal, déclencher un événement de test
stripe trigger checkout.session.completed
```

## 🔒 Sécurité

### 1. Validation des Webhooks

Le système valide automatiquement la signature des webhooks Stripe pour prévenir les attaques.

### 2. Protection des Données

- Les données de paiement ne sont jamais stockées localement
- Seuls les IDs de référence Stripe sont conservés
- Conformité PCI DSS via Stripe

### 3. Gestion des Erreurs

Le système gère automatiquement :
- Échecs de paiement
- Tentatives de paiement en double
- Annulations d'abonnement
- Remboursements

## 📊 Monitoring

### 1. Logs de Paiement

Les événements de paiement sont loggés dans :
- Console du serveur
- Dashboard Stripe
- Base de données (optionnel)

### 2. Métriques Importantes

Surveillez ces métriques dans Stripe :
- Taux de conversion
- Taux d'échec de paiement
- Churn rate
- MRR (Monthly Recurring Revenue)

## 🚀 Déploiement

### 1. Variables de Production

Assurez-vous d'utiliser les clés de production Stripe :
- `STRIPE_SECRET_KEY` : Commence par `sk_live_`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Commence par `pk_live_`

### 2. Webhooks de Production

Configurez les webhooks pour votre domaine de production :
- URL : `https://votre-domaine.com/api/payment/webhook`
- Mode : Production

### 3. Test Complet

Avant la mise en production :
1. Testez tous les plans de prix
2. Vérifiez les webhooks
3. Testez les annulations
4. Vérifiez les emails de confirmation

## 🆘 Support

### Problèmes Courants

1. **Webhook non reçu**
   - Vérifiez l'URL du webhook
   - Vérifiez la signature
   - Consultez les logs Stripe

2. **Paiement échoué**
   - Vérifiez les cartes de test
   - Consultez les logs d'erreur
   - Vérifiez la configuration Stripe

3. **Plan non activé**
   - Vérifiez les IDs de prix
   - Consultez les webhooks
   - Vérifiez la base de données

### Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Testing Guide](https://stripe.com/docs/testing)

## 📈 Optimisation

### 1. Conversion

- A/B test des prix
- Optimisation du checkout
- Réduction des frictions

### 2. Rétention

- Emails de bienvenue
- Notifications d'expiration
- Offres de rétention

### 3. Support

- Chat en direct
- Base de connaissances
- Support prioritaire pour les plans payants 