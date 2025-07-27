import { NextRequest } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const accessToken = searchParams.get('accessToken');

    if (!owner || !repo) {
      return new Response(
        JSON.stringify({ error: 'Owner et repo requis' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Préparer les headers pour l'API GitHub
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    };

    // Ajouter le token GitHub si disponible
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Récupérer les informations du dépôt
    const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers
    });

    if (!repoInfoResponse.ok) {
      if (repoInfoResponse.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Dépôt non trouvé. Vérifiez que le dépôt existe et est public.' }), 
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération du dépôt' }), 
        { status: repoInfoResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const repoInfo = await repoInfoResponse.json();

    return new Response(
      JSON.stringify({ 
        ...repoInfo,
        success: true 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur dans fetchRepo GET:', error);
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

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Support pour les deux formats : URL complète ou paramètres séparés
    let owner, repo, accessToken, ref;
    
    if (body.url) {
      // Format original avec URL complète
      const { url } = body;
      
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

      [owner, repo] = pathParts;
    } else {
      // Nouveau format avec paramètres séparés
      ({ owner, repo, accessToken, ref } = body);
      
      if (!owner || !repo) {
        return new Response(
          JSON.stringify({ error: 'Owner et repo requis' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Préparer les headers pour l'API GitHub
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    };

    // Ajouter le token GitHub si disponible
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (process.env.GITHUB_TOKEN) {
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

    // Utiliser le ref spécifié ou la branche par défaut
    const targetRef = ref || defaultBranch;
    let treeData = null;
    let usedRef = targetRef;

    try {
      // Essayer d'abord avec le ref spécifique (commit SHA ou branche)
      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetRef}?recursive=1`,
        { headers }
      );

      if (treeResponse.ok) {
        treeData = await treeResponse.json();
        usedRef = targetRef;
      } else {
        // Si ça ne marche pas, essayer avec la branche par défaut
        const fallbackResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
          { headers }
        );

        if (fallbackResponse.ok) {
          treeData = await fallbackResponse.json();
          usedRef = defaultBranch;
        } else {
          // Essayer d'autres branches possibles
          const possibleBranches = ['main', 'master', 'develop'];
          for (const branch of possibleBranches) {
            try {
              const branchResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
                { headers }
              );

              if (branchResponse.ok) {
                treeData = await branchResponse.json();
                usedRef = branch;
                break;
              }
            } catch (error) {
              console.warn(`Erreur avec la branche ${branch}:`, error);
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'arborescence:', error);
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
      .map(item => ({
        path: item.path,
        type: item.type,
        name: item.path.split('/').pop(),
        size: item.size,
        sha: item.sha,
        url: item.url,
        html_url: `https://github.com/${owner}/${repo}/blob/${usedRef}/${item.path}`,
        // Informations sur les changements (initialement inchangé)
        changeStatus: 'unchanged',
        additions: 0,
        deletions: 0,
        changes: 0,
        previousPath: null
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
        defaultBranch: usedRef
      }
    };

    // Construire la vraie structure arborescente comme Windows Explorer
    const buildTreeStructure = (items) => {
      const rootStructure = [];
      const pathMap = new Map();
      
      // Trier les éléments : dossiers d'abord, puis fichiers
      const sortedItems = items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'tree' ? -1 : 1;
        }
        return a.path.localeCompare(b.path);
      });
      
      sortedItems.forEach(item => {
        const pathParts = item.path.split('/');
        let currentPath = '';
        let currentParent = null;
        
        // Créer chaque nœud du chemin comme Windows Explorer
        for (let i = 0; i < pathParts.length; i++) {
          const isLastPart = i === pathParts.length - 1;
          const partName = pathParts[i];
          const nodePath = currentPath ? `${currentPath}/${partName}` : partName;
          
          // Vérifier si ce nœud existe déjà
          if (!pathMap.has(nodePath)) {
            const nodeData = {
              name: partName,
              path: nodePath,
              type: isLastPart ? item.type : 'tree',
              children: [],
              size: isLastPart ? item.size : 0,
              sha: isLastPart ? item.sha : '',
              url: isLastPart ? item.url : '',
              html_url: isLastPart ? item.html_url : `https://github.com/${owner}/${repo}/tree/${usedRef}/${nodePath}`,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              isFolder: !isLastPart || item.type === 'tree'
            };
            
            pathMap.set(nodePath, nodeData);
            
            // Ajouter au parent ou à la racine
            if (currentParent) {
              currentParent.children.push(nodeData);
            } else {
              rootStructure.push(nodeData);
            }
          }
          
          // Mettre à jour le parent pour la prochaine itération
          currentParent = pathMap.get(nodePath);
          currentPath = nodePath;
        }
      });
      
      return rootStructure;
    };

    const treeStructure = buildTreeStructure(tree);
    const allFiles = tree.filter(item => item.type === 'blob').map(item => ({
      name: item.name,
      path: item.path,
      size: item.size,
      sha: item.sha,
      url: item.url,
      html_url: item.html_url,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }));

    return new Response(
      JSON.stringify({ 
        files: allFiles,
        tree: treeStructure, 
        stats,
        success: true 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur dans fetchRepo POST:', error);
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
