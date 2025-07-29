# Configuration des Paiements Stripe

## 🚀 Guide de Configuration

### 1. Configuration des Variables d'Environnement

1. **Copiez le fichier d'exemple :**
   ```bash
   cp env.example .env.local
   ```

2. **Configurez vos clés Stripe :**
   - Remplacez les clés de test par vos vraies clés Stripe
   - Les clés de test sont déjà incluses dans le fichier d'exemple

### 2. Configuration Stripe Dashboard

#### A. Créer les Produits et Prix avec Lookup Keys

1. **Allez sur [Stripe Dashboard](https://dashboard.stripe.com/products)**
2. **Créez les produits suivants avec leurs lookup keys :**

   **Plan Pro Mensuel :**
   - Nom : `GitShadow Pro - Mensuel`
   - Prix : `19.00 EUR`
   - Intervalle : `Mensuel`
   - **Lookup Key :** `gitshadow_pro_monthly`
   - Copiez l'ID de prix généré

   **Plan Pro Annuel :**
   - Nom : `GitShadow Pro - Annuel`
   - Prix : `190.00 EUR` (2 mois gratuits)
   - Intervalle : `Annuel`
   - **Lookup Key :** `gitshadow_pro_yearly`
   - Copiez l'ID de prix généré

   **Plan Team Mensuel :**
   - Nom : `GitShadow Team - Mensuel`
   - Prix : `49.00 EUR`
   - Intervalle : `Mensuel`
   - **Lookup Key :** `gitshadow_team_monthly`
   - Copiez l'ID de prix généré

   **Plan Team Annuel :**
   - Nom : `GitShadow Team - Annuel`
   - Prix : `490.00 EUR` (2 mois gratuits)
   - Intervalle : `Annuel`
   - **Lookup Key :** `gitshadow_team_yearly`
   - Copiez l'ID de prix généré

#### B. Configurer les Webhooks (2 endpoints)

1. **Allez sur [Stripe Webhooks](https://dashboard.stripe.com/webhooks)**
2. **Ajoutez les endpoints suivants :**

   **Endpoint Principal (Snapshot) :**
   - URL : `https://git-shadow.vercel.app/api/payment/webhook`
   - Événements : `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`, `customer.subscription.trial_ended`, `invoice.payment_succeeded`, `invoice.payment_failed`, `entitlements.active_entitlement_summary.updated`

   **Endpoint Thin :**
   - URL : `https://git-shadow.vercel.app/api/payment/webhook`
   - Événements : `checkout.session.completed`

3. **Copiez les Signing Secrets** de chaque webhook

#### C. Mettre à jour les Variables d'Environnement

Remplacez les IDs de prix dans votre `.env.local` :

```env
# Remplacez par vos vrais IDs de prix Stripe
STRIPE_PRICE_PRO_MONTHLY=price_1OqX8X2eZvKYlo2C9Q9Q9Q9Q
STRIPE_PRICE_PRO_YEARLY=price_1OqX8X2eZvKYlo2C9Q9Q9Q9Q
STRIPE_PRICE_TEAM_MONTHLY=price_1OqX8X2eZvKYlo2C9Q9Q9Q9Q
STRIPE_PRICE_TEAM_YEARLY=price_1OqX8X2eZvKYlo2C9Q9Q9Q9Q

# Remplacez par vos vrais Signing Secrets
STRIPE_WEBHOOK_SECRET=whsec_ZBrup7oEMxq41NGuD6kVfsQ8BiNYvHps
STRIPE_WEBHOOK_THIN_SECRET=whsec_Uvfxw888jdlp6ZECH8wxtXyJT77MMWld
```

### 3. Configuration du Développement Local

#### A. Installer Stripe CLI

```bash
# Windows (avec Chocolatey)
choco install stripe-cli

# macOS (avec Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

#### B. Authentifier Stripe CLI

```bash
stripe login
```

#### C. Écouter les Webhooks en Local

```bash
stripe listen --forward-to localhost:8000/api/payment/webhook
```

### 4. Test des Paiements

#### A. Cartes de Test Stripe

Utilisez ces cartes pour tester :

- **Succès :** `4242 4242 4242 4242`
- **Échec :** `4000 0000 0000 0002`
- **3D Secure :** `4000 0025 0000 3155`

#### B. Tester le Checkout

1. **Lancez l'application :**
   ```bash
   npm run dev
   ```

2. **Allez sur la page Pricing :**
   - Connectez-vous avec le bouton "Test Auth"
   - Sélectionnez un plan payant
   - Utilisez une carte de test

### 5. Configuration de Production

#### A. Variables d'Environnement de Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://git-shadow.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

#### B. Webhooks de Production

- Configurez les webhooks avec vos URLs de production
- Utilisez les Signing Secrets de production
- Testez avec `stripe listen --forward-to your-production-url/api/payment/webhook`

### 6. Dépannage

#### Erreurs Courantes

1. **"No such price" :**
   - Vérifiez que les lookup keys existent dans votre dashboard Stripe
   - Assurez-vous que les prix sont actifs

2. **"Webhook signature verification failed" :**
   - Vérifiez les Signing Secrets dans vos variables d'environnement
   - Assurez-vous que le webhook est correctement configuré

3. **"Stripe is not available" :**
   - Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est défini
   - Assurez-vous que la clé est valide

#### Logs de Débogage

```bash
# Voir les logs Stripe en temps réel
stripe logs tail

# Voir les événements webhook
stripe events list
```

### 7. Sécurité

#### Bonnes Pratiques

1. **Ne jamais exposer `STRIPE_SECRET_KEY` côté client**
2. **Utilisez toujours HTTPS en production**
3. **Validez les webhooks avec le Signing Secret**
4. **Testez avec les cartes de test avant la production**

#### Variables Sensibles

```env
# ✅ À exposer côté client
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ❌ JAMAIS côté client
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_THIN_SECRET=whsec_...
```

### 8. Support

Pour toute question sur la configuration Stripe :
- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Stripe Discord](https://discord.gg/stripe) 