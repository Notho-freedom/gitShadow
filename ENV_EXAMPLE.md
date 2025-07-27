# Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

## Configuration Stripe
```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# IDs des produits Stripe (à créer dans votre dashboard Stripe)
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here
```

## Configuration GitHub OAuth
```env
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
```

## Configuration NextAuth
```env
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Configuration de l'application
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Mode de Développement

Si vous n'avez pas configuré Stripe, l'application fonctionnera en **mode de test** :
- Les processus de paiement seront simulés
- Aucun vrai paiement ne sera effectué
- Des messages d'information s'afficheront pour indiquer le mode de test

## Instructions de Configuration

1. **Stripe** : Suivez les instructions dans `STRIPE_SETUP.md`
2. **GitHub OAuth** : Suivez les instructions dans `SETUP.md`
3. **Variables** : Copiez les variables ci-dessus dans `.env.local`
4. **Redémarrage** : Redémarrez le serveur après avoir ajouté les variables

## Vérification

Pour vérifier que tout fonctionne :
1. L'application démarre sans erreur
2. L'authentification GitHub fonctionne
3. Le processus de paiement fonctionne (en mode test ou production)
4. Les notifications s'affichent correctement 