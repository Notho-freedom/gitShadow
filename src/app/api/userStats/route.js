import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    return await fetchUserStats(accessToken);
  } catch (error) {
    console.error('Erreur dans userStats GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques utilisateur' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { accessToken, username } = body;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    return await fetchUserStats(accessToken, username);
  } catch (error) {
    console.error('Erreur dans userStats POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques utilisateur' },
      { status: 500 }
    );
  }
}

async function fetchUserStats(accessToken, username = null) {
  // Récupérer les informations de l'utilisateur depuis GitHub
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    }
  });

  if (!userResponse.ok) {
    return NextResponse.json(
      { error: 'Token d\'accès invalide ou expiré' },
      { status: 401 }
    );
  }

  const user = await userResponse.json();

  // Récupérer les dépôts de l'utilisateur pour calculer les statistiques
  const reposResponse = await fetch(`https://api.github.com/user/repos?per_page=100&sort=updated`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'gitShadow-App'
    }
  });

  let totalRepos = 0;
  let publicRepos = 0;
  let privateRepos = 0;
  let totalStars = 0;
  let totalForks = 0;
  let languages = {};
  let recentActivity = [];

  if (reposResponse.ok) {
    const repos = await reposResponse.json();
    
    totalRepos = repos.length;
    publicRepos = repos.filter(repo => !repo.private).length;
    privateRepos = repos.filter(repo => repo.private).length;
    totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Analyser les langages
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    // Récupérer l'activité récente (derniers commits)
    const recentCommits = [];
    for (let i = 0; i < Math.min(5, repos.length); i++) {
      const repo = repos[i];
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=1`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'gitShadow-App'
            }
          }
        );
        
        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          if (commits.length > 0) {
            recentCommits.push({
              repo: repo.name,
              commit: commits[0].commit.message.split('\n')[0],
              date: commits[0].commit.author.date,
              sha: commits[0].sha.substring(0, 7)
            });
          }
        }
      } catch (error) {
        console.warn(`Erreur lors de la récupération des commits pour ${repo.name}:`, error);
      }
    }
    
    recentActivity = recentCommits
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }

  // Top langages
  const topLanguages = Object.entries(languages)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([lang, count]) => ({ language: lang, count }));

  const stats = {
    user: {
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      created_at: user.created_at
    },
    repositories: {
      total: totalRepos,
      public: publicRepos,
      private: privateRepos,
      totalStars,
      totalForks
    },
    topLanguages,
    recentActivity,
    generatedAt: new Date().toISOString()
  };

  return NextResponse.json(stats);
} 