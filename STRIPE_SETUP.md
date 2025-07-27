# Configuration Stripe pour gitShadow

## 1. Variables d'environnement requises

Créez un fichier `.env.local` avec les variables suivantes :

```env
# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id

# NextAuth (optionnel)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 2. Configuration Stripe

### Étape 1: Créer un compte Stripe
1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte ou connectez-vous
3. Passez en mode test pour le développement

### Étape 2: Récupérer les clés API
1. Dans le dashboard Stripe, allez dans **Developers > API keys**
2. Copiez la **Publishable key** (commence par `pk_test_`)
3. Copiez la **Secret key** (commence par `sk_test_`)

### Étape 3: Créer les produits et prix
1. Allez dans **Products** dans le dashboard Stripe
2. Créez deux produits :

#### Produit Pro
- **Name**: gitShadow Pro
- **Description**: Plan Pro pour gitShadow
- **Pricing**: €19/mois
- **Billing**: Recurring
- **Billing period**: Monthly

#### Produit Enterprise
- **Name**: gitShadow Enterprise
- **Description**: Plan Enterprise pour gitShadow
- **Pricing**: €199/mois
- **Billing**: Recurring
- **Billing period**: Monthly

3. Copiez les **Price IDs** (commencent par `price_`) dans votre `.env.local`

### Étape 4: Configurer le webhook
1. Allez dans **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/payment/webhook`
4. **Events to send**: Sélectionnez tous les événements liés aux paiements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copiez le **Webhook signing secret** (commence par `whsec_`) dans votre `.env.local`

## 3. Configuration GitHub OAuth

### Étape 1: Créer une OAuth App
1. Allez sur [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Cliquez sur **New OAuth App**
3. Remplissez les informations :
   - **Application name**: gitShadow
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`

4. Copiez le **Client ID** dans votre `.env.local`

## 4. Test du système

### Test local
1. Démarrez le serveur : `npm run dev`
2. Testez l'authentification GitHub
3. Testez le processus de paiement avec les cartes de test Stripe

### Cartes de test Stripe
- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

## 5. Déploiement

### Variables d'environnement de production
Pour le déploiement, utilisez les clés de production Stripe :
- `STRIPE_SECRET_KEY=sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

### Webhook de production
L'URL du webhook doit être mise à jour avec votre domaine de production :
`https://your-production-domain.com/api/payment/webhook`

## 6. Sécurité

- Ne jamais commiter le fichier `.env.local`
- Utilisez des clés de test pour le développement
- Activez la validation des webhooks Stripe
- Surveillez les logs de paiement dans le dashboard Stripe

## 7. Fonctionnalités implémentées

✅ **Authentification automatique** - Détection de l'utilisateur connecté
✅ **Avatar dans la navbar** - Affichage de l'avatar utilisateur
✅ **Mode invité** - Utilisation sans authentification (3 dépôts max)
✅ **Paiement réel Stripe** - Processus de paiement complet
✅ **Webhooks Stripe** - Gestion des événements de paiement
✅ **Dashboard invité** - Interface spéciale pour les utilisateurs non connectés
✅ **Persistance locale** - Sauvegarde des données en localStorage

## 8. Prochaines étapes

- [ ] Intégration avec une base de données
- [ ] Gestion des abonnements récurrents
- [ ] Notifications par email
- [ ] Analytics des paiements
- [ ] Support client intégré 