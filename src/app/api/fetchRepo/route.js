export async function POST(request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL du dépôt manquante' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validation et parsing de l'URL GitHub
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: 'URL invalide' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!parsed.hostname.includes('github.com')) {
      return new Response(
        JSON.stringify({ error: 'Seuls les dépôts GitHub sont supportés actuellement' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pathParts = parsed.pathname.split('/').filter(part => part);
    if (pathParts.length < 2) {
      return new Response(
        JSON.stringify({ error: 'URL de dépôt GitHub invalide. Format attendu: https://github.com/owner/repo' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const [owner, repo] = pathParts;

    // Mode démo activé par défaut pour la démonstration
    // Changez cette valeur à false si vous avez configuré un token GitHub
    const shouldUseDemoMode = true; // Force le mode démo
    
    if (shouldUseDemoMode) {
      return generateDemoRepository(owner, repo, url);
    }

    // Préparer les headers pour l'API GitHub
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    };

    // Ajouter le token GitHub si disponible (optionnel)
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    let repoInfo;
    let defaultBranch = 'main';

    // Essayer de récupérer les informations du dépôt
    try {
      const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers
      });

      if (repoInfoResponse.ok) {
        repoInfo = await repoInfoResponse.json();
        defaultBranch = repoInfo.default_branch || 'main';
      } else if (repoInfoResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Dépôt non trouvé. Vérifiez que le dépôt existe et est public.' }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // En cas d'erreur API, on continue avec des valeurs par défaut
        console.warn(`Impossible de récupérer les infos du dépôt: ${repoInfoResponse.status}`);
        repoInfo = {
          name: repo,
          full_name: `${owner}/${repo}`,
          description: 'Description non disponible',
          stargazers_count: 0,
          forks_count: 0,
          language: null,
          updated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des infos du dépôt:', error);
      repoInfo = {
        name: repo,
        full_name: `${owner}/${repo}`,
        description: 'Description non disponible',
        stargazers_count: 0,
        forks_count: 0,
        language: null,
        updated_at: new Date().toISOString()
      };
    }

    // Essayer plusieurs branches possibles
    const possibleBranches = [defaultBranch, 'main', 'master', 'develop'];
    let treeData = null;
    let usedBranch = defaultBranch;

    for (const branch of possibleBranches) {
      try {
        const treeResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
          { headers }
        );

        if (treeResponse.ok) {
          treeData = await treeResponse.json();
          usedBranch = branch;
          break;
        }
      } catch (error) {
        console.warn(`Erreur avec la branche ${branch}:`, error);
        continue;
      }
    }

    if (!treeData) {
      return new Response(
        JSON.stringify({ error: 'Impossible de récupérer l\'arborescence du dépôt. Le dépôt pourrait être vide ou privé.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Filtrer et enrichir les données de l'arbre
    const tree = treeData.tree
      .filter(item => {
        // Exclure les fichiers/dossiers cachés et certains dossiers courants
        const excludePatterns = [
          /^\./,                    // Fichiers cachés
          /node_modules/,           // Dependencies
          /\.git/,                  // Git files
          /dist/,                   // Build files
          /build/,                  // Build files
          /coverage/,               // Test coverage
          /\.next/,                 // Next.js build
          /\.nuxt/,                 // Nuxt.js build
          /vendor/,                 // PHP vendor
          /__pycache__/,            // Python cache
          /\.pytest_cache/,         // Pytest cache
          /\.vscode/,               // VS Code settings
          /\.idea/,                 // IntelliJ settings
        ];
        
        return !excludePatterns.some(pattern => pattern.test(item.path));
      })
      .map(item => ({
        path: item.path,
        type: item.type,
        name: item.path.split('/').pop(),
        size: item.size,
        sha: item.sha,
        url: item.url,
        html_url: `https://github.com/${owner}/${repo}/blob/${usedBranch}/${item.path}`,
        download_url: item.type === 'blob' 
          ? `https://raw.githubusercontent.com/${owner}/${repo}/${usedBranch}/${item.path}`
          : null
      }))
      .sort((a, b) => {
        // Trier: dossiers d'abord, puis fichiers, alphabétiquement
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

    // Statistiques du dépôt
    const stats = {
      totalFiles: tree.filter(item => item.type === 'blob').length,
      totalFolders: tree.filter(item => item.type === 'tree').length,
      languages: getLanguageStats(tree),
      repoInfo: {
        name: repoInfo.name,
        fullName: repoInfo.full_name,
        description: repoInfo.description,
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        language: repoInfo.language,
        updatedAt: repoInfo.updated_at,
        defaultBranch: usedBranch
      }
    };

    return new Response(
      JSON.stringify({ 
        tree, 
        stats,
        success: true 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur dans fetchRepo:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur lors de la récupération du dépôt',
        details: error.message 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Fonction utilitaire pour analyser les langages
function getLanguageStats(tree) {
  const languageCount = {};
  const extensionMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'vue': 'Vue',
    'svelte': 'Svelte',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'sql': 'SQL'
  };

  tree
    .filter(item => item.type === 'blob')
    .forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && extensionMap[ext]) {
        const language = extensionMap[ext];
        languageCount[language] = (languageCount[language] || 0) + 1;
      }
    });

  return Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Top 10 langages
}

// Fonction pour générer un dépôt de démonstration
function generateDemoRepository(owner, repo, originalUrl) {
  const demoTree = [
    // Fichiers racine
    {
      path: 'README.md',
      type: 'blob',
      name: 'README.md',
      size: 2048,
      sha: 'demo-sha-readme',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/README.md`,
      download_url: `data:text/plain;base64,${btoa(`# ${repo}\n\nCeci est un fichier README de démonstration pour le projet ${repo}.\n\n## Description\n\nCe projet est une démonstration des capacités de gitShadow pour analyser et documenter automatiquement les dépôts Git.\n\n## Installation\n\n\`\`\`bash\nnpm install\n\`\`\`\n\n## Utilisation\n\n\`\`\`bash\nnpm start\n\`\`\`\n\n## Fonctionnalités\n\n- Interface moderne et responsive\n- Documentation automatique avec IA\n- Recherche avancée dans les fichiers\n- Visualisation d'arborescence interactive\n\n## Technologies\n\n- React/Next.js\n- Tailwind CSS\n- Node.js\n- Intelligence Artificielle\n\n---\n*Généré par gitShadow - Mode démonstration*`)}`
    },
    {
      path: 'package.json',
      type: 'blob',
      name: 'package.json',
      size: 1024,
      sha: 'demo-sha-package',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/package.json`,
      download_url: `data:application/json;base64,${btoa(JSON.stringify({
        name: repo,
        version: "1.0.0",
        description: `Projet de démonstration ${repo}`,
        main: "src/index.js",
        scripts: {
          start: "node src/index.js",
          dev: "nodemon src/index.js",
          build: "webpack --mode production",
          test: "jest"
        },
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0",
          "next": "^13.0.0",
          "tailwindcss": "^3.0.0"
        },
        devDependencies: {
          "nodemon": "^2.0.0",
          "webpack": "^5.0.0",
          "jest": "^28.0.0"
        },
        keywords: ["demo", "javascript", "react", "nextjs"],
        author: owner,
        license: "MIT"
      }, null, 2))}`
    },
    {
      path: 'src/index.js',
      type: 'blob',
      name: 'index.js',
      size: 1536,
      sha: 'demo-sha-index',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/src/index.js`,
      download_url: `data:text/javascript;base64,${btoa(`// Point d'entrée principal de l'application ${repo}\n\nimport React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles/globals.css';\n\n/**\n * Initialisation de l'application React\n * \n * Cette fonction configure et lance l'application principale.\n * Elle gère le rendu du composant racine dans le DOM.\n */\nfunction initializeApp() {\n  const root = ReactDOM.createRoot(document.getElementById('root'));\n  \n  root.render(\n    <React.StrictMode>\n      <App />\n    </React.StrictMode>\n  );\n}\n\n// Configuration de l'environnement\nconst config = {\n  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',\n  environment: process.env.NODE_ENV || 'development',\n  version: '1.0.0'\n};\n\n// Gestion des erreurs globales\nwindow.addEventListener('error', (event) => {\n  console.error('Erreur globale:', event.error);\n});\n\n// Lancement de l'application\ninitializeApp();\n\n// Export pour les tests\nexport { config, initializeApp };\n\nconsole.log('Application ${repo} initialisée avec succès!');\n\n// Mode démonstration gitShadow`)}`
    },
    {
      path: 'src/App.jsx',
      type: 'blob',
      name: 'App.jsx',
      size: 2048,
      sha: 'demo-sha-app',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/src/App.jsx`,
      download_url: `data:text/javascript;base64,${btoa(`import React, { useState, useEffect } from 'react';\nimport Header from './components/Header';\nimport Footer from './components/Footer';\nimport { fetchData, processData } from './utils';\n\n/**\n * Composant principal de l'application ${repo}\n * \n * Ce composant gère l'état global de l'application et orchestre\n * l'affichage des différents composants enfants.\n * \n * @returns {JSX.Element} Le composant App rendu\n */\nfunction App() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  /**\n   * Effet pour charger les données initiales\n   */\n  useEffect(() => {\n    const loadInitialData = async () => {\n      try {\n        setLoading(true);\n        const rawData = await fetchData();\n        const processedData = processData(rawData);\n        setData(processedData);\n      } catch (err) {\n        setError(err.message);\n        console.error('Erreur lors du chargement:', err);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    loadInitialData();\n  }, []);\n\n  /**\n   * Gestionnaire de rafraîchissement des données\n   */\n  const handleRefresh = () => {\n    setData(null);\n    setError(null);\n    // Relancer le chargement\n  };\n\n  if (loading) {\n    return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="text-center">\n          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>\n          <p className="mt-4 text-gray-600">Chargement en cours...</p>\n        </div>\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="text-center">\n          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>\n          <p className="text-gray-600 mb-4">{error}</p>\n          <button \n            onClick={handleRefresh}\n            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"\n          >\n            Réessayer\n          </button>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className="min-h-screen bg-gray-50">\n      <Header />\n      \n      <main className="container mx-auto px-4 py-8">\n        <div className="bg-white rounded-lg shadow-md p-6">\n          <h1 className="text-3xl font-bold text-gray-800 mb-6">\n            Bienvenue dans ${repo}\n          </h1>\n          \n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n            {data && data.map((item, index) => (\n              <div key={index} className="bg-gray-100 p-4 rounded-lg">\n                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>\n                <p className="text-gray-600">{item.description}</p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </main>\n      \n      <Footer />\n    </div>\n  );\n}\n\nexport default App;\n\n// Démonstration gitShadow - Composant React moderne`)}`
    },
    {
      path: 'src/components/Header.jsx',
      type: 'blob',
      name: 'Header.jsx',
      size: 1024,
      sha: 'demo-sha-header',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/src/components/Header.jsx`,
      download_url: `data:text/javascript;base64,${btoa(`import React from 'react';\n\n/**\n * Composant Header - En-tête de l'application\n * \n * Affiche la navigation principale et le logo de l'application.\n * Responsive et accessible.\n * \n * @returns {JSX.Element} Le composant Header\n */\nfunction Header() {\n  return (\n    <header className="bg-white shadow-sm border-b">\n      <div className="container mx-auto px-4">\n        <div className="flex items-center justify-between h-16">\n          {/* Logo */}\n          <div className="flex items-center space-x-2">\n            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">\n              <span className="text-white font-bold text-sm">${repo.charAt(0).toUpperCase()}</span>\n            </div>\n            <h1 className="text-xl font-bold text-gray-800">${repo}</h1>\n          </div>\n          \n          {/* Navigation */}\n          <nav className="hidden md:flex items-center space-x-6">\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              Accueil\n            </a>\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              Documentation\n            </a>\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              À propos\n            </a>\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              Contact\n            </a>\n          </nav>\n          \n          {/* Menu mobile */}\n          <button className="md:hidden p-2 rounded-md hover:bg-gray-100">\n            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />\n            </svg>\n          </button>\n        </div>\n      </div>\n    </header>\n  );\n}\n\nexport default Header;\n\n// Composant Header - Démonstration gitShadow`)}`
    },
    {
      path: 'src/utils.js',
      type: 'blob',
      name: 'utils.js',
      size: 1024,
      sha: 'demo-sha-utils',
      url: 'demo-url',
      html_url: `${originalUrl}/blob/main/src/utils.js`,
      download_url: `data:text/javascript;base64,${btoa(`/**\n * Utilitaires pour l'application ${repo}\n * \n * Ce module contient des fonctions utilitaires réutilisables\n * dans toute l'application.\n */\n\n/**\n * Simule une requête API pour récupérer des données\n * \n * @returns {Promise<Array>} Promesse qui résout avec des données simulées\n */\nexport async function fetchData() {\n  // Simulation d'un délai réseau\n  await new Promise(resolve => setTimeout(resolve, 1000));\n  \n  return [\n    {\n      id: 1,\n      title: 'Fonctionnalité 1',\n      description: 'Description de la première fonctionnalité'\n    },\n    {\n      id: 2,\n      title: 'Fonctionnalité 2', \n      description: 'Description de la deuxième fonctionnalité'\n    },\n    {\n      id: 3,\n      title: 'Fonctionnalité 3',\n      description: 'Description de la troisième fonctionnalité'\n    }\n  ];\n}\n\n/**\n * Traite et formate les données reçues\n * \n * @param {Array} rawData - Données brutes à traiter\n * @returns {Array} Données traitées et formatées\n */\nexport function processData(rawData) {\n  if (!Array.isArray(rawData)) {\n    throw new Error('Les données doivent être un tableau');\n  }\n  \n  return rawData.map(item => ({\n    ...item,\n    title: item.title.toUpperCase(),\n    description: item.description + ' (traité)',\n    processed: true,\n    timestamp: new Date().toISOString()\n  }));\n}\n\n/**\n * Formate une date en français\n * \n * @param {Date|string} date - Date à formater\n * @returns {string} Date formatée\n */\nexport function formatDate(date) {\n  const d = new Date(date);\n  return d.toLocaleDateString('fr-FR', {\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric'\n  });\n}\n\n/**\n * Valide une adresse email\n * \n * @param {string} email - Email à valider\n * @returns {boolean} True si l'email est valide\n */\nexport function validateEmail(email) {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return regex.test(email);\n}\n\n// Constantes utiles\nexport const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';\nexport const APP_VERSION = '1.0.0';\n\n// Démonstration gitShadow - Utilitaires JavaScript`)}`
    }
  ];

  const stats = {
    totalFiles: demoTree.filter(item => item.type === 'blob').length,
    totalFolders: demoTree.filter(item => item.type === 'tree').length,
    languages: [
      ['JavaScript', 5],
      ['JSON', 1]
    ],
    repoInfo: {
      name: repo,
      fullName: `${owner}/${repo}`,
      description: `Dépôt de démonstration pour ${repo} - Analyse générée par gitShadow`,
      stars: 1234,
      forks: 567,
      language: 'JavaScript',
      updatedAt: new Date().toISOString(),
      defaultBranch: 'main',
      demo: true
    }
  };

  return new Response(
    JSON.stringify({ 
      tree: demoTree, 
      stats,
      success: true,
      demo: true,
      message: 'Mode démonstration activé - Données simulées pour présenter les fonctionnalités'
    }), 
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
}
