# Configuration de gitShadow

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# GitHub OAuth
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback

# Application
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Configuration Stripe

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés API dans le dashboard Stripe
3. Créez les produits et prix suivants dans Stripe :
   - **Pro Plan** : `price_pro_monthly` (€19/mois)
   - **Enterprise Plan** : `price_enterprise_monthly` (€199/mois)

## Configuration GitHub OAuth

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Configurez l'URL de callback : `http://localhost:3000/auth/callback`
4. Récupérez le Client ID

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos vraies valeurs

# Démarrer le serveur de développement
npm run dev
```

## Fonctionnalités

- ✅ Navigation de la sidebar corrigée
- ✅ Système d'upgrade complet
- ✅ Notifications pop-up d'upgrade
- ✅ Processus de paiement sécurisé
- ✅ Gestion des utilisateurs gratuits vs premium
- ✅ Interface utilisateur moderne et responsive

## Plans disponibles

- **Gratuit** : Fonctionnalités de base
- **Pro** (€19/mois) : Analytics, collaboration, documentation avancée
- **Enterprise** (€199/mois) : Fonctionnalités complètes + support dédié 