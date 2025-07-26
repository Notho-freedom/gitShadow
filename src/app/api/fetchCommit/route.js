export async function POST(request) {
  try {
    const { owner, repo, commitSha } = await request.json();
    
    if (!owner || !repo || !commitSha) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants: owner, repo, commitSha' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mode démo activé par défaut
    const shouldUseDemoMode = true;
    
    if (shouldUseDemoMode) {
      return generateDemoCommit(owner, repo, commitSha);
    }

    // Préparer les headers pour l'API GitHub
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Récupérer les détails du commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`,
      { headers }
    );

    if (!commitResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Commit non trouvé' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const commitData = await commitResponse.json();

    // Récupérer l'arborescence complète du commit
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      { headers }
    );

    if (!treeResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Impossible de récupérer l\'arborescence du commit' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const treeData = await treeResponse.json();

    // Analyser les changements du commit
    const changes = commitData.files || [];
    const changeMap = new Map();
    
    changes.forEach(file => {
      changeMap.set(file.filename, {
        status: file.status, // 'added', 'modified', 'removed', 'renamed'
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0,
        previous_filename: file.previous_filename
      });
    });

    // Filtrer et enrichir les données de l'arbre (intégralité du projet)
    const tree = treeData.tree
      .filter(item => {
        // Exclure seulement les fichiers/dossiers vraiment inutiles
        const excludePatterns = [
          /^\.git/,                  // Git files (garder .gitignore, .gitattributes, etc.)
          /node_modules/,            // Dependencies
          /dist/,                    // Build files
          /build/,                   // Build files
          /coverage/,                // Test coverage
          /\.next/,                  // Next.js build
          /\.nuxt/,                  // Nuxt.js build
          /vendor/,                  // PHP vendor
          /__pycache__/,             // Python cache
          /\.pytest_cache/,          // Pytest cache
        ];
        return !excludePatterns.some(pattern => pattern.test(item.path));
      })
      .map(item => {
        const change = changeMap.get(item.path);
        return {
          path: item.path,
          type: item.type,
          name: item.path.split('/').pop(),
          size: item.size,
          sha: item.sha,
          url: item.url,
          html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/${item.path}`,
          download_url: item.type === 'blob' 
            ? `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${item.path}`
            : null,
          // Informations sur les changements (seulement pour les fichiers modifiés)
          changeStatus: change ? change.status : 'unchanged',
          additions: change ? change.additions : 0,
          deletions: change ? change.deletions : 0,
          changes: change ? change.changes : 0,
          previousPath: change ? change.previous_filename : null
        };
      })
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

    // Ajouter les fichiers supprimés dans ce commit (ils ne sont plus dans l'arbre)
    const removedFiles = changes
      .filter(file => file.status === 'removed')
      .map(file => ({
        path: file.filename,
        type: 'blob',
        name: file.filename.split('/').pop(),
        size: 0,
        sha: 'removed',
        url: null,
        html_url: null,
        download_url: null,
        changeStatus: 'removed',
        additions: file.additions || 0,
        deletions: file.deletions || 0,
        changes: file.changes || 0,
        previousPath: null
      }));

    // Combiner l'arbre avec les fichiers supprimés
    const completeTree = [...tree, ...removedFiles].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'tree' ? -1 : 1;
      }
      return a.path.localeCompare(b.path);
    });

    // Statistiques du commit
    const stats = {
      totalFiles: completeTree.filter(item => item.type === 'blob').length,
      totalFolders: completeTree.filter(item => item.type === 'tree').length,
      addedFiles: changes.filter(f => f.status === 'added').length,
      modifiedFiles: changes.filter(f => f.status === 'modified').length,
      removedFiles: changes.filter(f => f.status === 'removed').length,
      renamedFiles: changes.filter(f => f.status === 'renamed').length,
      totalAdditions: changes.reduce((sum, f) => sum + (f.additions || 0), 0),
      totalDeletions: changes.reduce((sum, f) => sum + (f.deletions || 0), 0),
      languages: getLanguageStats(completeTree),
      commitInfo: {
        sha: commitData.sha,
        message: commitData.commit.message,
        author: commitData.commit.author,
        committer: commitData.commit.committer,
        parents: commitData.parents.map(p => p.sha)
      }
    };

    return new Response(
      JSON.stringify({ 
        tree: completeTree, 
        stats,
        success: true 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur dans fetchCommit:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur lors de la récupération du commit',
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
    'js': 'JavaScript', 'jsx': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript',
    'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'cs': 'C#',
    'php': 'PHP', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'swift': 'Swift',
    'kt': 'Kotlin', 'dart': 'Dart', 'vue': 'Vue', 'svelte': 'Svelte',
    'html': 'HTML', 'css': 'CSS', 'scss': 'SCSS', 'sass': 'Sass', 'less': 'Less',
    'json': 'JSON', 'xml': 'XML', 'yaml': 'YAML', 'yml': 'YAML', 'md': 'Markdown', 'sql': 'SQL'
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
    .slice(0, 10);
}

// Fonction pour générer un commit de démonstration
function generateDemoCommit(owner, repo, commitSha) {
  // Arborescence complète du projet (état actuel)
  const completeTree = [
    // Fichiers de configuration
    {
      path: '.gitignore',
      type: 'blob',
      name: '.gitignore',
      size: 512,
      sha: commitSha + '-gitignore',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/.gitignore`,
      download_url: `data:text/plain;base64,${btoa(`# Dependencies\nnode_modules/\n\n# Build files\ndist/\nbuild/\n\n# Environment\n.env\n.env.local\n\n# IDE\n.vscode/\n.idea/\n\n# OS\n.DS_Store\nThumbs.db`)}`,
      changeStatus: 'unchanged',
      additions: 0,
      deletions: 0,
      changes: 0,
      previousPath: null
    },
    {
      path: 'package.json',
      type: 'blob',
      name: 'package.json',
      size: 1024,
      sha: commitSha + '-package',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/package.json`,
      download_url: `data:application/json;base64,${btoa(JSON.stringify({
        name: repo,
        version: "1.0.0",
        description: `Projet ${repo} - Commit ${commitSha.substring(0, 7)}`,
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
      }, null, 2))}`,
      changeStatus: 'added',
      additions: 25,
      deletions: 0,
      changes: 25,
      previousPath: null
    },
    {
      path: 'README.md',
      type: 'blob',
      name: 'README.md',
      size: 2048,
      sha: commitSha + '-readme',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/README.md`,
      download_url: `data:text/plain;base64,${btoa(`# ${repo}\n\nCommit: ${commitSha.substring(0, 7)}\n\nCeci est l'état du projet au moment de ce commit.\n\n## Changements dans ce commit\n\n- ✅ README.md - Modifié (ajout de documentation)\n- ➕ package.json - Ajouté\n- ➕ src/index.js - Ajouté\n- ➕ src/App.jsx - Ajouté\n- ➕ src/components/Header.jsx - Ajouté\n- ➕ src/utils.js - Ajouté\n\n## Statistiques\n\n- Fichiers ajoutés: 5\n- Fichiers modifiés: 1\n- Lignes ajoutées: +45\n- Lignes supprimées: -2\n\n---\n*État du projet au commit ${commitSha.substring(0, 7)}*`)}`,
      changeStatus: 'modified',
      additions: 15,
      deletions: 2,
      changes: 17,
      previousPath: null
    },
    // Dossier src avec tous ses fichiers
    {
      path: 'src/index.js',
      type: 'blob',
      name: 'index.js',
      size: 1536,
      sha: commitSha + '-index',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/src/index.js`,
      download_url: `data:text/javascript;base64,${btoa(`// Point d'entrée principal - Commit ${commitSha.substring(0, 7)}\n\nimport React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles/globals.css';\n\n/**\n * Initialisation de l'application React\n * État au commit: ${commitSha.substring(0, 7)}\n */\nfunction initializeApp() {\n  const root = ReactDOM.createRoot(document.getElementById('root'));\n  \n  root.render(\n    <React.StrictMode>\n      <App />\n    </React.StrictMode>\n  );\n}\n\n// Configuration de l'environnement\nconst config = {\n  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',\n  environment: process.env.NODE_ENV || 'development',\n  version: '1.0.0',\n  commit: '${commitSha.substring(0, 7)}'\n};\n\n// Gestion des erreurs globales\nwindow.addEventListener('error', (event) => {\n  console.error('Erreur globale:', event.error);\n});\n\n// Lancement de l'application\ninitializeApp();\n\nexport { config, initializeApp };\n\nconsole.log('Application ${repo} initialisée - Commit ${commitSha.substring(0, 7)}');`)}`,
      changeStatus: 'added',
      additions: 35,
      deletions: 0,
      changes: 35,
      previousPath: null
    },
    {
      path: 'src/App.jsx',
      type: 'blob',
      name: 'App.jsx',
      size: 2048,
      sha: commitSha + '-app',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/src/App.jsx`,
      download_url: `data:text/javascript;base64,${btoa(`import React, { useState, useEffect } from 'react';\nimport Header from './components/Header';\nimport Footer from './components/Footer';\nimport { fetchData, processData } from './utils';\n\n/**\n * Composant principal - Commit ${commitSha.substring(0, 7)}\n * \n * Ce composant gère l'état global de l'application et orchestre\n * l'affichage des différents composants enfants.\n */\nfunction App() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const loadInitialData = async () => {\n      try {\n        setLoading(true);\n        const rawData = await fetchData();\n        const processedData = processData(rawData);\n        setData(processedData);\n      } catch (err) {\n        setError(err.message);\n        console.error('Erreur lors du chargement:', err);\n      } finally {\n        setLoading(false);\n      }\n    };\n\n    loadInitialData();\n  }, []);\n\n  const handleRefresh = () => {\n    setData(null);\n    setError(null);\n  };\n\n  if (loading) {\n    return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="text-center">\n          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>\n          <p className="mt-4 text-gray-600">Chargement en cours...</p>\n        </div>\n      </div>\n    );\n  }\n\n  if (error) {\n    return (\n      <div className="min-h-screen flex items-center justify-center">\n        <div className="text-center">\n          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>\n          <p className="text-gray-600 mb-4">{error}</p>\n          <button \n            onClick={handleRefresh}\n            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"\n          >\n            Réessayer\n          </button>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className="min-h-screen bg-gray-50">\n      <Header />\n      \n      <main className="container mx-auto px-4 py-8">\n        <div className="bg-white rounded-lg shadow-md p-6">\n          <h1 className="text-3xl font-bold text-gray-800 mb-6">\n            Bienvenue dans ${repo}\n          </h1>\n          <p className="text-sm text-gray-500 mb-4">Commit: ${commitSha.substring(0, 7)}</p>\n          \n          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\n            {data && data.map((item, index) => (\n              <div key={index} className="bg-gray-100 p-4 rounded-lg">\n                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>\n                <p className="text-gray-600">{item.description}</p>\n              </div>\n            ))}\n          </div>\n        </div>\n      </main>\n      \n      <Footer />\n    </div>\n  );\n}\n\nexport default App;`)}`,
      changeStatus: 'added',
      additions: 45,
      deletions: 0,
      changes: 45,
      previousPath: null
    },
    {
      path: 'src/components/Header.jsx',
      type: 'blob',
      name: 'Header.jsx',
      size: 1024,
      sha: commitSha + '-header',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/src/components/Header.jsx`,
      download_url: `data:text/javascript;base64,${btoa(`import React from 'react';\n\n/**\n * Composant Header - Commit ${commitSha.substring(0, 7)}\n * \n * Affiche la navigation principale et le logo de l'application.\n */\nfunction Header() {\n  return (\n    <header className="bg-white shadow-sm border-b">\n      <div className="container mx-auto px-4">\n        <div className="flex items-center justify-between h-16">\n          <div className="flex items-center space-x-2">\n            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">\n              <span className="text-white font-bold text-sm">${repo.charAt(0).toUpperCase()}</span>\n            </div>\n            <h1 className="text-xl font-bold text-gray-800">${repo}</h1>\n            <span className="text-xs text-gray-500">${commitSha.substring(0, 7)}</span>\n          </div>\n          \n          <nav className="hidden md:flex items-center space-x-6">\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              Accueil\n            </a>\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              Documentation\n            </a>\n            <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors">\n              À propos\n            </a>\n          </nav>\n        </div>\n      </div>\n    </header>\n  );\n}\n\nexport default Header;`)}`,
      changeStatus: 'added',
      additions: 30,
      deletions: 0,
      changes: 30,
      previousPath: null
    },
    {
      path: 'src/utils.js',
      type: 'blob',
      name: 'utils.js',
      size: 1024,
      sha: commitSha + '-utils',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/src/utils.js`,
      download_url: `data:text/javascript;base64,${btoa(`/**\n * Utilitaires - Commit ${commitSha.substring(0, 7)}\n * \n * Ce module contient des fonctions utilitaires réutilisables\n * dans toute l'application.\n */\n\nexport async function fetchData() {\n  await new Promise(resolve => setTimeout(resolve, 1000));\n  \n  return [\n    {\n      id: 1,\n      title: 'Fonctionnalité 1',\n      description: 'Description de la première fonctionnalité'\n    },\n    {\n      id: 2,\n      title: 'Fonctionnalité 2', \n      description: 'Description de la deuxième fonctionnalité'\n    },\n    {\n      id: 3,\n      title: 'Fonctionnalité 3',\n      description: 'Description de la troisième fonctionnalité'\n    }\n  ];\n}\n\nexport function processData(rawData) {\n  if (!Array.isArray(rawData)) {\n    throw new Error('Les données doivent être un tableau');\n  }\n  \n  return rawData.map(item => ({\n    ...item,\n    title: item.title.toUpperCase(),\n    description: item.description + ' (traité)',\n    processed: true,\n    timestamp: new Date().toISOString(),\n    commit: '${commitSha.substring(0, 7)}'\n  }));\n}\n\nexport function formatDate(date) {\n  const d = new Date(date);\n  return d.toLocaleDateString('fr-FR', {\n    year: 'numeric',\n    month: 'long',\n    day: 'numeric'\n  });\n}\n\nexport function validateEmail(email) {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  return regex.test(email);\n}\n\nexport const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';\nexport const APP_VERSION = '1.0.0';\nexport const COMMIT_SHA = '${commitSha.substring(0, 7)}';`)}`,
      changeStatus: 'added',
      additions: 40,
      deletions: 0,
      changes: 40,
      previousPath: null
    },
    // Fichiers de documentation
    {
      path: 'docs/README.md',
      type: 'blob',
      name: 'README.md',
      size: 1536,
      sha: commitSha + '-docs-readme',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/docs/README.md`,
      download_url: `data:text/plain;base64,${btoa(`# Documentation ${repo}\n\n## Vue d'ensemble\n\nCe projet est une application moderne développée avec React et Next.js.\n\n## Installation\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Structure du projet\n\n- \`src/\` - Code source principal\n- \`docs/\` - Documentation\n- \`public/\` - Fichiers publics\n\n## Commit actuel: ${commitSha.substring(0, 7)}`)}`,
      changeStatus: 'unchanged',
      additions: 0,
      deletions: 0,
      changes: 0,
      previousPath: null
    },
    {
      path: 'docs/api.md',
      type: 'blob',
      name: 'api.md',
      size: 2048,
      sha: commitSha + '-docs-api',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/docs/api.md`,
      download_url: `data:text/plain;base64,${btoa(`# API Documentation\n\n## Endpoints\n\n### GET /api/data\nRécupère les données principales.\n\n### POST /api/process\nTraite les données envoyées.\n\n## Authentification\n\nL'API utilise OAuth2 pour l'authentification.\n\n## Exemples\n\n\`\`\`javascript\nconst response = await fetch('/api/data');\nconst data = await response.json();\n\`\`\`\n\n---\n*Documentation générée pour le commit ${commitSha.substring(0, 7)}*`)}`,
      changeStatus: 'unchanged',
      additions: 0,
      deletions: 0,
      changes: 0,
      previousPath: null
    },
    // Fichiers de test
    {
      path: 'tests/App.test.js',
      type: 'blob',
      name: 'App.test.js',
      size: 1024,
      sha: commitSha + '-tests-app',
      url: 'demo-url',
      html_url: `https://github.com/${owner}/${repo}/blob/${commitSha}/tests/App.test.js`,
      download_url: `data:text/javascript;base64,${btoa(`import { render, screen } from '@testing-library/react';\nimport App from '../src/App';\n\ndescribe('App Component', () => {\n  test('renders without crashing', () => {\n    render(<App />);\n    expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument();\n  });\n\n  test('displays commit information', () => {\n    render(<App />);\n    expect(screen.getByText(/Commit: ${commitSha.substring(0, 7)}/i)).toBeInTheDocument();\n  });\n});`)}`,
      changeStatus: 'unchanged',
      additions: 0,
      deletions: 0,
      changes: 0,
      previousPath: null
    },
    // Fichiers supprimés dans ce commit (exemple)
    {
      path: 'old-config.json',
      type: 'blob',
      name: 'old-config.json',
      size: 0,
      sha: 'removed',
      url: null,
      html_url: null,
      download_url: null,
      changeStatus: 'removed',
      additions: 0,
      deletions: 15,
      changes: 15,
      previousPath: null
    }
  ];

  const stats = {
    totalFiles: completeTree.filter(item => item.type === 'blob').length,
    totalFolders: completeTree.filter(item => item.type === 'tree').length,
    addedFiles: 5,
    modifiedFiles: 1,
    removedFiles: 0,
    renamedFiles: 0,
    totalAdditions: 190,
    totalDeletions: 2,
    languages: [
      ['JavaScript', 5],
      ['JSON', 1]
    ],
    commitInfo: {
      sha: commitSha,
      message: `feat: Ajout du système d'authentification OAuth2\n\n- Ajout de la page d'authentification GitHub\n- Intégration OAuth2 complète\n- Gestion des tokens d'accès\n- Interface utilisateur moderne\n- Documentation mise à jour`,
      author: {
        name: 'Notho-freedom',
        email: 'bobymomo6@gmail.com',
        date: new Date().toISOString()
      },
      committer: {
        name: 'Notho-freedom',
        email: 'bobymomo6@gmail.com',
        date: new Date().toISOString()
      },
      parents: ['parent-sha-123']
    }
  };

  return new Response(
    JSON.stringify({ 
      tree: completeTree, 
      stats,
      success: true,
      demo: true,
      message: `Mode démonstration - État complet du projet au commit ${commitSha.substring(0, 7)}`
    }), 
    { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    }
  );
} 