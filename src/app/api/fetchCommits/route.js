import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { owner, repo, branch = 'main', page = 1, per_page = 30 } = await request.json();

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

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Récupérer les commits du dépôt
    const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&page=${page}&per_page=${per_page}`;
    
    const response = await fetch(commitsUrl, { headers });

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

    const commits = await response.json();

    // Récupérer les détails complets de chaque commit (avec les fichiers modifiés)
    const detailedCommits = await Promise.all(
      commits.map(async (commit) => {
        try {
          const commitDetailUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`;
          const detailResponse = await fetch(commitDetailUrl, { headers });
          
          if (detailResponse.ok) {
            const commitDetail = await detailResponse.json();
            return {
              sha: commitDetail.sha,
              commit: commitDetail.commit,
              author: commitDetail.author,
              committer: commitDetail.committer,
              parents: commitDetail.parents,
              stats: commitDetail.stats,
              files: commitDetail.files || [],
              html_url: commitDetail.html_url,
              url: commitDetail.url
            };
          } else {
            // Fallback si on ne peut pas récupérer les détails
            return {
              sha: commit.sha,
              commit: commit.commit,
              author: commit.author,
              committer: commit.committer,
              parents: commit.parents,
              stats: { additions: 0, deletions: 0, total: 0 },
              files: [],
              html_url: commit.html_url,
              url: commit.url
            };
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération du commit ${commit.sha}:`, error);
          return commit; // Retourner le commit de base si erreur
        }
      })
    );

    // Vérifier s'il y a plus de pages
    const linkHeader = response.headers.get('link');
    const hasMore = linkHeader && linkHeader.includes('rel="next"');

    return NextResponse.json({
      commits: detailedCommits,
      hasMore,
      page,
      per_page,
      total: detailedCommits.length
    });

  } catch (error) {
    console.error('Erreur dans fetchCommits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commits' },
      { status: 500 }
    );
  }
} 