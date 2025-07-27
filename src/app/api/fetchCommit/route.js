import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { owner, repo, commitSha, sha, accessToken } = body;
    
    // Accepter soit commitSha soit sha
    const commitHash = commitSha || sha;

    if (!owner || !repo || !commitHash) {
      return NextResponse.json(
        { error: 'Paramètres owner, repo et commitSha/sha requis' },
        { status: 400 }
      );
    }

    // Préparer les headers pour l'API GitHub
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    };

    // Utiliser le token utilisateur s'il est fourni, sinon utiliser le token serveur
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Récupérer les détails du commit
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}`,
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
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitHash}?recursive=1`,
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

    // Formater les fichiers
    const tree = treeData.tree
      .filter(item => item.type === 'blob')
      .map(item => ({
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        url: item.url,
        changeInfo: changeMap.get(item.path) || null
      }));

    // Récupérer les fichiers supprimés
    const removedFiles = changes
      .filter(file => file.status === 'removed')
      .map(file => ({
        path: file.filename,
        type: 'blob',
        size: 0,
        sha: null,
        url: null,
        changeInfo: {
          status: 'removed',
          additions: 0,
          deletions: file.deletions || 0,
          changes: file.changes || 0,
          previous_filename: file.previous_filename
        }
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
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'arborescence du commit' },
      { status: 500 }
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
      const ext = file.path.split('.').pop()?.toLowerCase();
      if (ext && extensionMap[ext]) {
        const language = extensionMap[ext];
        languageCount[language] = (languageCount[language] || 0) + 1;
      }
    });

  return Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Top 10 langages
}
