# Serveur Stripe avec Webhooks

Ce projet est un exemple complet d'intégration Stripe avec gestion des webhooks pour les événements de paiement et d'abonnement.

## 🚀 Fonctionnalités

- **Checkout Stripe** : Création de sessions de paiement
- **Customer Portal** : Gestion des factures par les clients
- **Webhooks** : Gestion des événements Stripe en temps réel
- **Deux types de payload** : Snapshot et Thin pour différents cas d'usage

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- Compte Stripe avec clés API
- Configuration des webhooks dans le dashboard Stripe

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd stripe-sample-code
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env` à la racine du projet :
```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
WEBHOOK_SECRET_SNAPSHOT=whsec_ZBrup7oEMxq41NGuD6kVfsQ8BiNYvHps
WEBHOOK_SECRET_THIN=whsec_Uvfxw888jdlp6ZECH8wxtXyJT77MMWld
```

## 🚀 Démarrage

### Développement
```bash
npm start
```
Cette commande démarre simultanément :
- Le serveur Express sur le port 4242
- L'application React sur le port 3000

### Production
```bash
npm run build
npm run start-server
```

## 🔗 Configuration des Webhooks

### URLs des Webhooks
Le serveur expose deux endpoints pour les webhooks :

1. **Webhook Snapshot** : `https://votre-domaine.com/webhook`
   - Payload complet avec tous les détails
   - Secret : `whsec_ZBrup7oEMxq41NGuD6kVfsQ8BiNYvHps`

2. **Webhook Thin** : `https://votre-domaine.com/webhook/thin`
   - Payload léger avec informations essentielles
   - Secret : `whsec_Uvfxw888jdlp6ZECH8wxtXyJT77MMWld`

### Événements Gérés

Le serveur gère les événements suivants :

| Événement | Description | Action |
|-----------|-------------|---------|
| `customer.subscription.created` | Nouvel abonnement créé | Accorder l'accès au service |
| `customer.subscription.updated` | Abonnement modifié | Mettre à jour les permissions |
| `customer.subscription.deleted` | Abonnement supprimé | Révoquer l'accès |
| `customer.subscription.trial_will_end` | Fin d'essai approche | Envoyer notification |
| `customer.subscription.trial_ended` | Essai terminé | Gérer la conversion |
| `invoice.payment_succeeded` | Paiement réussi | Confirmer l'accès |
| `invoice.payment_failed` | Paiement échoué | Gérer l'échec |
| `checkout.session.completed` | Checkout terminé | Traiter la commande |
| `entitlements.active_entitlement_summary.updated` | Droits mis à jour | Synchroniser les permissions |

## 🔧 Configuration Stripe

### 1. Créer un produit et un prix
Dans votre dashboard Stripe :
1. Aller dans "Produits"
2. Créer un nouveau produit
3. Ajouter un prix récurrent (ex: 20€/mois)
4. Copier la `lookup_key` du prix

### 2. Configurer les webhooks
1. Aller dans "Développeurs" > "Webhooks"
2. Cliquer sur "Ajouter un endpoint"
3. Ajouter les URLs :
   - `https://votre-domaine.com/webhook`
   - `https://votre-domaine.com/webhook/thin`
4. Sélectionner les événements à écouter
5. Copier les secrets de signature

### 3. Mettre à jour le code
Dans `src/App.jsx`, remplacer `{{PRICE_LOOKUP_KEY}}` par votre vraie clé :
```jsx
<input type="hidden" name="lookup_key" value="votre_lookup_key" />
```

## 🧪 Test des Webhooks

### Utilisation de Stripe CLI
```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:4242/webhook

# Dans un autre terminal, déclencher un événement de test
stripe trigger customer.subscription.created
```

### Test en production
Utilisez l'outil de test dans le dashboard Stripe :
1. Aller dans "Développeurs" > "Webhooks"
2. Sélectionner votre endpoint
3. Cliquer sur "Envoyer un événement de test"

## 📊 Logs et Monitoring

Le serveur affiche des logs détaillés pour chaque événement :
```
📦 Received event: customer.subscription.created
✅ Subscription created - Status: active
Granting access to customer: cus_xxx
```

## 🔒 Sécurité

- **Signature des webhooks** : Tous les webhooks sont vérifiés avec les secrets Stripe
- **Validation des événements** : Seuls les événements signés sont traités
- **Gestion d'erreurs** : Les erreurs de signature renvoient une erreur 400

## 🚨 Dépannage

### Erreur de signature
```
⚠️ Webhook signature verification failed
```
- Vérifier que le secret de webhook est correct
- S'assurer que l'URL du webhook correspond

### Événements non reçus
- Vérifier que l'URL du webhook est accessible
- Contrôler les logs du serveur
- Tester avec Stripe CLI

### Problèmes de CORS
- Le serveur Express est configuré pour servir les fichiers statiques
- Les webhooks ne nécessitent pas de CORS

## 📝 Personnalisation

### Ajouter de nouveaux événements
1. Ajouter le cas dans `handleWebhookEvent()`
2. Créer une fonction de gestion correspondante
3. Implémenter la logique métier

### Modifier la logique de gestion
Chaque fonction de gestion peut être personnalisée :
- `handleSubscriptionCreated()` : Accorder l'accès
- `handlePaymentSucceeded()` : Confirmer le paiement
- `handleSubscriptionDeleted()` : Révoquer l'accès

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du serveur
2. Consulter la documentation Stripe
3. Tester avec Stripe CLI
4. Contrôler la configuration des webhooks

---

**Note** : Ce code est un exemple éducatif. En production, ajoutez la gestion d'erreurs, la validation des données, et la sécurité appropriée.