import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { owner, repo, accessToken } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Paramètres owner et repo requis' },
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

    // Récupérer les branches du dépôt
    const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`;
    
    const response = await fetch(branchesUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Dépôt non trouvé ou accès refusé' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Erreur GitHub API: ${response.status}` },
        { status: response.status }
      );
    }

    const branches = await response.json();

    // Récupérer la branche par défaut
    const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoResponse = await fetch(repoInfoUrl, { headers });
    
    let defaultBranch = 'main';
    if (repoResponse.ok) {
      const repoInfo = await repoResponse.json();
      defaultBranch = repoInfo.default_branch;
    }

    // Formater les branches
    const formattedBranches = branches.map(branch => ({
      name: branch.name,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url
      },
      protected: branch.protected || false,
      isDefault: branch.name === defaultBranch
    }));

    return NextResponse.json({
      branches: formattedBranches,
      defaultBranch,
      total: formattedBranches.length
    });

  } catch (error) {
    console.error('Erreur dans fetchBranches:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des branches' },
      { status: 500 }
    );
  }
} 