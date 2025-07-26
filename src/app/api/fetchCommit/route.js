export async function POST(request) {
  try {
    const { owner, repo, commitSha } = await request.json();
    
    if (!owner || !repo || !commitSha) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants: owner, repo, commitSha' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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
        parents: commitData.parents,
        tree: commitData.tree,
        url: commitData.url,
        html_url: commitData.html_url
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