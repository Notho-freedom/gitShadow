# gitShadow - Générateur de Documentation IA

Une application Next.js moderne pour générer automatiquement de la documentation intelligente à partir de dépôts Git avec l'intelligence artificielle.

## 🚀 Technologies

- **Next.js 15.3.2** - Framework React avec App Router
- **React 19** - Bibliothèque d'interface utilisateur
- **Tailwind CSS 4** - Framework CSS utilitaire
- **Radix UI** - Composants d'interface utilisateur accessibles
- **Lucide React** - Icônes modernes

## 📦 Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd gs
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir l'application**
   
   Visitez [http://localhost:8000](http://localhost:8000) dans votre navigateur.

## 🛠️ Scripts disponibles

- `npm run dev` - Démarre le serveur de développement sur le port 8000
- `npm run build` - Crée une version de production
- `npm run start` - Démarre le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

## 🎯 Fonctionnalités

- **Interface moderne** avec mode sombre par défaut
- **Navigation intuitive** dans l'arbre des fichiers
- **Visualisation de code** avec coloration syntaxique
- **Génération de documentation IA** pour les fichiers de code
- **Recherche rapide** dans les fichiers et dossiers
- **Design responsive** adapté à tous les écrans

## 🏗️ Structure du projet

```
src/
├── app/
│   ├── api/            # Routes API
│   ├── globals.css     # Styles globaux avec Tailwind
│   ├── layout.jsx      # Layout principal
│   └── page.jsx        # Page d'accueil
└── components/         # Composants React réutilisables
    ├── DocumentationPanel.jsx
    ├── FileViewer.jsx
    ├── RepositoryInput.jsx
    ├── RepoTree.jsx
    └── SearchBar.jsx
```

## 🎨 Configuration

### Tailwind CSS
Le projet utilise Tailwind CSS v4 avec une configuration personnalisée incluant :
- Variables CSS pour les thèmes sombre/clair
- Polices personnalisées (Inter & JetBrains Mono)
- Animations et transitions fluides

### ESLint
Configuration ESLint moderne avec les règles recommandées Next.js pour maintenir la qualité du code.

## 🔧 Configuration des fichiers

Les fichiers de configuration principaux :
- `next.config.js` - Configuration Next.js
- `tailwind.config.js` - Configuration Tailwind CSS
- `postcss.config.js` - Configuration PostCSS
- `eslint.config.mjs` - Configuration ESLint

## 📝 Utilisation

1. Entrez l'URL d'un dépôt Git public
2. Explorez l'arbre des fichiers dans le panneau latéral
3. Sélectionnez un fichier pour voir son contenu
4. Générez automatiquement la documentation avec l'IA

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT. 