# Configuration Stripe pour GitShadow - Guide Complet

## 🚀 Vue d'ensemble

Ce guide vous accompagne dans la configuration complète de Stripe pour GitShadow, de la configuration initiale jusqu'au déploiement en production.

## 📋 Prérequis

1. **Compte Stripe** : Créez un compte sur [stripe.com](https://stripe.com)
2. **Accès au Dashboard Stripe** : Connectez-vous à votre dashboard Stripe
3. **Domaine de production** : Ayez votre domaine final prêt

## 🔧 Configuration Initiale

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
STRIPE_WEBHOOK_SECRET_THIN=whsec_your_thin_webhook_secret
STRIPE_PORTAL_CONFIGURATION_ID=bpc_your_portal_configuration_id

# Application
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:8000
```

### 2. Récupération des Clés Stripe

1. Allez dans **Developers > API keys** dans votre dashboard Stripe
2. Copiez les clés suivantes :
   - **Publishable key** (commence par `pk_test_` ou `pk_live_`)
   - **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important** : Utilisez les clés de test (`pk_test_`, `sk_test_`) pour le développement et les clés de production (`pk_live_`, `sk_live_`) pour la production.

## 🛍️ Configuration des Produits et Prix

### 1. Création des Produits

Dans votre dashboard Stripe, allez dans **Products** et créez les produits suivants :

#### Plan Pro Mensuel
- **Nom** : `GitShadow Pro - Mensuel`
- **Description** : Plan Pro mensuel pour GitShadow
- **Prix** : `19.00 EUR`
- **Intervalle** : `Mensuel`
- **ID de prix** : `price_pro_monthly`

#### Plan Pro Annuel
- **Nom** : `GitShadow Pro - Annuel`
- **Description** : Plan Pro annuel pour GitShadow
- **Prix** : `190.00 EUR`
- **Intervalle** : `Annuel`
- **ID de prix** : `price_pro_yearly`

#### Plan Team Mensuel
- **Nom** : `GitShadow Team - Mensuel`
- **Description** : Plan Team mensuel pour GitShadow
- **Prix** : `49.00 EUR`
- **Intervalle** : `Mensuel`
- **ID de prix** : `price_team_monthly`

#### Plan Team Annuel
- **Nom** : `GitShadow Team - Annuel`
- **Description** : Plan Team annuel pour GitShadow
- **Prix** : `490.00 EUR`
- **Intervalle** : `Annuel`
- **ID de prix** : `price_team_yearly`

#### Plan Enterprise
- **Nom** : `GitShadow Enterprise`
- **Description** : Plan Enterprise pour GitShadow
- **Prix** : `199.00 EUR`
- **Intervalle** : `Mensuel`
- **ID de prix** : `price_enterprise_monthly`

### 2. Mise à jour des IDs de Prix

Modifiez le fichier `src/lib/pricing.js` pour utiliser vos vrais IDs de prix :

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
  {
    id: 'team',
    // ... autres propriétés
    stripePriceId: 'price_team_monthly', // Votre ID de prix
  },
  {
    id: 'enterprise',
    // ... autres propriétés
    stripePriceId: 'price_enterprise_monthly', // Votre ID de prix
  }
];
```

## 🔗 Configuration des Webhooks

### 1. Création des Webhooks

1. Allez dans **Developers > Webhooks** dans votre dashboard Stripe
2. Cliquez sur **Add endpoint**

#### Webhook Principal
- **URL** : `https://votre-domaine.com/api/payment/webhook`
- **Événements à écouter** :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end`
  - `customer.subscription.trial_ended`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `invoice.payment_action_required`
  - `payment_method.attached`
  - `payment_method.detached`
  - `charge.succeeded`
  - `charge.failed`
  - `charge.refunded`

#### Webhook "Thin" (optionnel)
- **URL** : `https://votre-domaine.com/api/payment/webhook/thin`
- **Événements à écouter** :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 2. Récupération des Secrets Webhook

1. Après avoir créé chaque webhook, cliquez sur **Reveal** pour voir le secret
2. Copiez le secret et ajoutez-le à vos variables d'environnement :
   - `STRIPE_WEBHOOK_SECRET` pour le webhook principal
   - `STRIPE_WEBHOOK_SECRET_THIN` pour le webhook thin

## 🏢 Configuration du Portail Client

### 1. Activation du Portail Client

1. Allez dans **Settings > Billing > Customer Portal**
2. Cliquez sur **Set up** pour activer le portail client

### 2. Configuration des Fonctionnalités

Activez les fonctionnalités suivantes :

#### Fonctionnalités de Base
- ✅ **Update payment methods** : Permettre la mise à jour des méthodes de paiement
- ✅ **Cancel subscription** : Permettre l'annulation d'abonnement
- ✅ **Pause subscription** : Permettre la pause d'abonnement (optionnel)
- ✅ **Update billing information** : Permettre la mise à jour des informations de facturation

#### Fonctionnalités Avancées
- ✅ **Download invoices** : Permettre le téléchargement des factures
- ✅ **View billing history** : Permettre la consultation de l'historique de facturation
- ✅ **Update tax IDs** : Permettre la mise à jour des numéros de TVA

#### Pages Personnalisées
- **Business information** : Informations sur l'entreprise
- **Tax ID collection** : Collecte des numéros de TVA

### 3. Récupération de l'ID de Configuration

1. Après avoir configuré le portail, notez l'ID de configuration
2. Ajoutez-le à vos variables d'environnement : `STRIPE_PORTAL_CONFIGURATION_ID`

## 🧪 Test du Système

### 1. Cartes de Test Stripe

Utilisez ces cartes pour tester :

#### Cartes de Succès
- `4242 4242 4242 4242` : Paiement réussi
- `4000 0025 0000 3155` : 3D Secure requis
- `4000 0000 0000 3220` : 3D Secure 2 requis

#### Cartes d'Échec
- `4000 0000 0000 0002` : Carte refusée
- `4000 0000 0000 9995` : Carte refusée (insufficient_funds)
- `4000 0000 0000 9987` : Carte refusée (lost_card)

#### Cartes Spéciales
- `4000 0000 0000 0341` : Attachée à un compte nécessitant une authentification
- `4000 0025 0000 3155` : 3D Secure requis

### 2. Test des Webhooks Locaux

Utilisez l'outil CLI Stripe pour tester les webhooks localement :

```bash
# Installer Stripe CLI
# Windows : https://stripe.com/docs/stripe-cli#install
# macOS : brew install stripe/stripe-cli/stripe
# Linux : https://stripe.com/docs/stripe-cli#install

# Se connecter à votre compte Stripe
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:8000/api/payment/webhook

# Dans un autre terminal, déclencher un événement de test
stripe trigger checkout.session.completed
```

### 3. Test Complet du Flux

1. **Test de création de session** :
   ```bash
   curl -X POST http://localhost:8000/api/payment/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{
       "planId": "pro",
       "customerEmail": "test@example.com",
       "successUrl": "http://localhost:8000/dashboard?success=true",
       "cancelUrl": "http://localhost:8000/pricing?canceled=true"
     }'
   ```

2. **Test du portail client** :
   ```bash
   curl -X POST http://localhost:8000/api/payment/customer-portal \
     -H "Content-Type: application/json" \
     -d '{
       "customerId": "cus_1234567890",
       "returnUrl": "http://localhost:8000/dashboard"
     }'
   ```

## 🚀 Déploiement en Production

### 1. Variables de Production

Assurez-vous d'utiliser les clés de production Stripe :

```env
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### 2. Webhooks de Production

Configurez les webhooks pour votre domaine de production :

- **URL** : `https://votre-domaine.com/api/payment/webhook`
- **Mode** : Production
- **Événements** : Tous les événements listés ci-dessus

### 3. Test de Production

Avant la mise en production :

1. **Testez tous les plans de prix** avec des cartes de test
2. **Vérifiez les webhooks** en production
3. **Testez les annulations** et réactivations
4. **Vérifiez les emails** de confirmation
5. **Testez le portail client** en production

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
- **Taux de conversion** : Pourcentage de sessions qui se transforment en paiements
- **Taux d'échec de paiement** : Pourcentage de paiements échoués
- **Churn rate** : Taux de désabonnement
- **MRR** : Monthly Recurring Revenue

### 3. Alertes

Configurez des alertes dans Stripe pour :
- Échecs de paiement répétés
- Tentatives de fraude
- Problèmes de webhook

## 🆘 Support et Dépannage

### Problèmes Courants

#### 1. Webhook non reçu
- Vérifiez l'URL du webhook
- Vérifiez la signature
- Consultez les logs Stripe
- Testez avec Stripe CLI

#### 2. Paiement échoué
- Vérifiez les cartes de test
- Consultez les logs d'erreur
- Vérifiez la configuration Stripe
- Testez avec différentes cartes

#### 3. Plan non activé
- Vérifiez les IDs de prix
- Consultez les webhooks
- Vérifiez la base de données
- Testez le flux complet

### Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhook Events](https://stripe.com/docs/api/events)
- [Testing Guide](https://stripe.com/docs/testing)
- [Security Best Practices](https://stripe.com/docs/security)

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

---

## ✅ Checklist de Configuration

- [ ] Compte Stripe créé
- [ ] Clés API récupérées
- [ ] Produits et prix créés
- [ ] Webhooks configurés
- [ ] Portail client activé
- [ ] Variables d'environnement configurées
- [ ] Tests locaux effectués
- [ ] Tests de production effectués
- [ ] Monitoring configuré
- [ ] Support configuré

Votre système de paiement GitShadow est maintenant prêt pour la production ! 🎉 