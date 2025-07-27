# 🚀 Système de Paiement GitShadow

Un système de paiement complet et robuste basé sur Stripe, prêt pour la production.

## ✨ Fonctionnalités

### 💳 Paiements
- ✅ Sessions de paiement Stripe Checkout
- ✅ Paiements récurrents (abonnements)
- ✅ Paiements ponctuels
- ✅ Support des codes promotionnels
- ✅ Collecte automatique des taxes
- ✅ Support multi-devises

### 🔄 Abonnements
- ✅ Création d'abonnements
- ✅ Annulation d'abonnements
- ✅ Réactivation d'abonnements
- ✅ Mise à jour d'abonnements
- ✅ Gestion des essais gratuits
- ✅ Paiements automatiques

### 🏢 Portail Client
- ✅ Gestion des méthodes de paiement
- ✅ Consultation des factures
- ✅ Téléchargement de factures
- ✅ Mise à jour des informations de facturation
- ✅ Annulation d'abonnement

### 🔗 Webhooks
- ✅ Validation des signatures
- ✅ Gestion de tous les événements Stripe
- ✅ Retry automatique en cas d'échec
- ✅ Logs détaillés
- ✅ Support des webhooks "thin"

### 📊 Facturation
- ✅ Historique des factures
- ✅ Statuts de paiement
- ✅ Méthodes de paiement
- ✅ Remboursements
- ✅ Taxes automatiques

## 🛠️ Installation

### 1. Dépendances

Le système utilise les dépendances suivantes (déjà installées) :

```json
{
  "stripe": "^18.3.0",
  "@stripe/stripe-js": "^7.6.1"
}
```

### 2. Configuration

1. **Copiez le fichier d'exemple** :
   ```bash
   cp env.example .env.local
   ```

2. **Configurez vos variables d'environnement** dans `.env.local` :
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_WEBHOOK_SECRET_THIN=whsec_your_thin_webhook_secret
   STRIPE_PORTAL_CONFIGURATION_ID=bpc_your_portal_configuration_id
   ```

3. **Suivez le guide de configuration Stripe** : [STRIPE_SETUP.md](./STRIPE_SETUP.md)

## 🧪 Tests

### Test Automatique

```bash
# Test complet du système de paiement
npm run test:payment

# Ou
npm run test:stripe
```

### Test Manuel

1. **Démarrez l'application** :
   ```bash
   npm run dev
   ```

2. **Testez avec des cartes Stripe** :
   - Succès : `4242 4242 4242 4242`
   - Échec : `4000 0000 0000 0002`
   - 3D Secure : `4000 0025 0000 3155`

## 📁 Structure des Fichiers

```
src/
├── app/api/payment/
│   ├── create-checkout-session/route.js    # Création de sessions de paiement
│   ├── customer-portal/route.js            # Portail client
│   ├── webhook/route.js                    # Webhooks Stripe
│   ├── cancel-subscription/route.js        # Annulation d'abonnement
│   ├── reactivate-subscription/route.js    # Réactivation d'abonnement
│   ├── subscription-status/route.js        # Statut d'abonnement
│   ├── invoices/route.js                   # Historique des factures
│   └── payment-methods/route.js            # Méthodes de paiement
├── components/
│   ├── CheckoutModal.jsx                   # Modal de paiement
│   ├── BillingPanel.jsx                    # Panel de facturation
│   └── PricingCard.jsx                     # Cartes de prix
└── lib/
    ├── stripe.js                           # Fonctions Stripe
    └── pricing.js                          # Configuration des prix
```

## 🔧 API Endpoints

### POST `/api/payment/create-checkout-session`
Crée une session de paiement Stripe.

**Body :**
```json
{
  "planId": "pro",
  "customerEmail": "user@example.com",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel",
  "metadata": {
    "userId": "123",
    "planName": "Pro"
  }
}
```

**Response :**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/payment/customer-portal`
Crée une session pour le portail client.

**Body :**
```json
{
  "customerId": "cus_...",
  "returnUrl": "https://example.com/dashboard"
}
```

**Response :**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

### POST `/api/payment/webhook`
Endpoint pour les webhooks Stripe.

**Headers :**
```
stripe-signature: t=...,v1=...
```

### POST `/api/payment/cancel-subscription`
Annule un abonnement.

**Body :**
```json
{
  "subscriptionId": "sub_...",
  "cancelAtPeriodEnd": true
}
```

### POST `/api/payment/reactivate-subscription`
Réactive un abonnement.

**Body :**
```json
{
  "subscriptionId": "sub_..."
}
```

### POST `/api/payment/subscription-status`
Récupère le statut d'un abonnement.

**Body :**
```json
{
  "customerId": "cus_...",
  "customerEmail": "user@example.com"
}
```

### POST `/api/payment/invoices`
Récupère l'historique des factures.

**Body :**
```json
{
  "customerId": "cus_...",
  "limit": 50
}
```

### POST `/api/payment/payment-methods`
Récupère les méthodes de paiement.

**Body :**
```json
{
  "customerId": "cus_..."
}
```

## 🎯 Utilisation

### 1. Création d'une Session de Paiement

```javascript
import { createCheckoutSession } from '../lib/stripe';

const session = await createCheckoutSession({
  priceId: 'price_pro_monthly',
  customerEmail: 'user@example.com',
  successUrl: 'https://example.com/success',
  cancelUrl: 'https://example.com/cancel',
  metadata: {
    userId: '123',
    planName: 'Pro'
  }
});

if (session.success) {
  window.location.href = session.url;
}
```

### 2. Gestion des Webhooks

```javascript
// Les webhooks sont automatiquement gérés dans /api/payment/webhook/route.js
// Vous pouvez ajouter votre logique métier dans les gestionnaires d'événements
```

### 3. Portail Client

```javascript
import { createCustomerPortalSession } from '../lib/stripe';

const portal = await createCustomerPortalSession(
  'cus_...',
  'https://example.com/dashboard'
);

if (portal.success) {
  window.location.href = portal.url;
}
```

## 🔒 Sécurité

### Validation des Webhooks
- Signature Stripe validée automatiquement
- Protection contre les attaques de replay
- Support de plusieurs secrets webhook

### Protection des Données
- Aucune donnée de paiement stockée localement
- Seuls les IDs de référence Stripe conservés
- Conformité PCI DSS via Stripe

### Gestion des Erreurs
- Validation des entrées
- Gestion des timeouts
- Retry automatique
- Logs détaillés

## 📊 Monitoring

### Logs
Tous les événements de paiement sont loggés avec :
- Timestamp
- Type d'événement
- Données pertinentes
- Statut de traitement

### Métriques
Surveillez dans Stripe :
- Taux de conversion
- Taux d'échec de paiement
- Churn rate
- MRR (Monthly Recurring Revenue)

## 🚀 Déploiement

### 1. Variables de Production

```env
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### 2. Webhooks de Production

Configurez les webhooks pour votre domaine :
- URL : `https://votre-domaine.com/api/payment/webhook`
- Mode : Production
- Événements : Tous les événements listés

### 3. Test de Production

```bash
# Test avec l'URL de production
TEST_URL=https://votre-domaine.com npm run test:payment
```

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
- [Guide de Configuration](./STRIPE_SETUP.md)
- [Configuration des Prix](./src/lib/pricing.js)
- [Scripts de Test](./scripts/test-payment.js)

## 📈 Optimisation

### Performance
- Validation des clés Stripe
- Gestion des erreurs optimisée
- Retry automatique intelligent

### UX
- États de chargement
- Messages d'erreur clairs
- Redirection automatique
- Interface responsive

### Business
- Support des codes promotionnels
- Collecte automatique des taxes
- Gestion des essais gratuits
- Portail client complet

---

## ✅ Checklist de Déploiement

- [ ] Variables d'environnement configurées
- [ ] Produits et prix créés dans Stripe
- [ ] Webhooks configurés
- [ ] Portail client activé
- [ ] Tests locaux passés
- [ ] Tests de production passés
- [ ] Monitoring configuré
- [ ] Support configuré

Votre système de paiement est prêt pour la production ! 🎉 