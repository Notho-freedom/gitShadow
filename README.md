# gitShadow - Documentation IA pour Développeurs

![gitShadow Logo](https://img.shields.io/badge/gitShadow-v2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🚀 Vue d'ensemble

gitShadow est une plateforme SaaS moderne qui transforme votre code en documentation professionnelle grâce à l'intelligence artificielle. Connectez vos dépôts GitHub et générez une documentation complète en quelques clics.

### ✨ Fonctionnalités principales

- **🔐 Authentification GitHub OAuth** - Accès sécurisé à vos dépôts publics et privés
- **📚 Documentation IA avancée** - Génération automatique avec OpenRouter/Claude
- **🎯 Interface VSCode-like** - Environnement familier avec explorateur de fichiers
- **📊 Historique des commits** - Navigation dans l'historique complet de vos projets
- **💎 Plans tarifaires flexibles** - Gratuit, Pro et Entreprise
- **🔄 Export multi-formats** - Markdown, PDF, HTML, Confluence
- **👥 Collaboration équipe** - Partage et travail collaboratif

## 🏗️ Architecture technique

### Stack technologique
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **IA**: OpenRouter API (Claude, GPT-4)
- **Authentification**: GitHub OAuth 2.0
- **UI Components**: Radix UI, React Resizable Panels
- **Styling**: Tailwind CSS, CSS Modules

### Structure du projet
```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/github/        # Authentification GitHub
│   │   ├── generateDoc/        # Génération documentation IA
│   │   └── repositories/       # Gestion des dépôts
│   ├── globals.css            # Styles globaux
│   ├── layout.jsx             # Layout principal
│   └── page.jsx               # Page d'accueil
├── components/
│   ├── AuthPage.jsx           # Page d'authentification
│   ├── CodeViewer.jsx         # Visualiseur de code
│   ├── CommitHistory.jsx      # Historique des commits
│   ├── Dashboard.jsx          # Tableau de bord principal
│   ├── DocumentationPanel.jsx # Panel de documentation IA
│   ├── FileExplorer.jsx       # Explorateur de fichiers
│   ├── LandingPage.jsx        # Page d'accueil marketing
│   ├── LoadingScreen.jsx      # Écran de chargement
│   ├── RepositoryList.jsx     # Liste des dépôts
│   └── Sidebar.jsx            # Barre latérale navigation
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte GitHub (pour OAuth)
- Clé API OpenRouter (optionnel, mode démo disponible)

### Installation
```bash
# Cloner le projet
git clone https://github.com/votre-username/gitshadow.git
cd gitshadow

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Configuration des variables d'environnement
```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# OpenRouter API (optionnel)
OPENROUTER_API_KEY=your_openrouter_api_key

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Démarrage en développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8000`

## 📋 Plans tarifaires

### 🆓 Plan Gratuit
- 5 dépôts publics
- 10 générations de documentation/mois
- Support communautaire
- Export Markdown

### 💎 Plan Pro (29€/mois)
- Dépôts illimités (publics + privés)
- Générations illimitées
- Support prioritaire 24/7
- Export multi-formats (PDF, HTML, Confluence)
- Intégrations CI/CD
- Collaboration équipe (5 membres)
- Analytics avancées

### 🏢 Plan Entreprise (Sur mesure)
- Tout du plan Pro
- Membres illimités
- Déploiement on-premise
- SSO et sécurité avancée
- SLA garantie 99.9%
- Support dédié

## 🔧 Configuration GitHub OAuth

1. Aller sur GitHub Settings > Developer settings > OAuth Apps
2. Créer une nouvelle OAuth App
3. Configurer les URLs :
   - Homepage URL: `http://localhost:8000`
   - Authorization callback URL: `http://localhost:8000/api/auth/callback/github`
4. Copier Client ID et Client Secret dans `.env.local`

## 🤖 Configuration IA (OpenRouter)

1. Créer un compte sur [OpenRouter](https://openrouter.ai)
2. Générer une clé API
3. Ajouter la clé dans `.env.local`
4. Le modèle par défaut est `anthropic/claude-3.5-sonnet`

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement sur Vercel
```

### Docker
```bash
# Build de l'image
docker build -t gitshadow .

# Lancement du conteneur
docker run -p 3000:3000 gitshadow
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentation API

### Authentification
```javascript
POST /api/auth/github
{
  "code": "github_oauth_code"
}
```

### Génération de documentation
```javascript
POST /api/generateDoc
{
  "code": "source_code",
  "filename": "example.js",
  "docType": "comprehensive",
  "userPlan": "pro"
}
```

### Récupération des dépôts
```javascript
GET /api/repositories?token=github_token&type=all&sort=updated
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📧 Email: support@gitshadow.dev
- 💬 Discord: [Rejoindre notre serveur](https://discord.gg/gitshadow)
- 📖 Documentation: [docs.gitshadow.dev](https://docs.gitshadow.dev)
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/gitshadow/issues)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Radix UI](https://www.radix-ui.com/) pour les composants
- [OpenRouter](https://openrouter.ai/) pour l'accès aux modèles IA
- [Vercel](https://vercel.com/) pour l'hébergement

---

**gitShadow** - Transformez votre code en documentation professionnelle avec l'IA 🚀
