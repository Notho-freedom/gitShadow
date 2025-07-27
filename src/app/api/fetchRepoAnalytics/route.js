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

    // Récupérer les statistiques du dépôt
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    let repoStats = {};
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      repoStats = {
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        open_issues_count: repoData.open_issues_count,
        language: repoData.language,
        size: repoData.size,
        updated_at: repoData.updated_at,
        created_at: repoData.created_at,
        default_branch: repoData.default_branch,
        topics: repoData.topics || [],
        description: repoData.description,
        homepage: repoData.homepage,
        license: repoData.license?.name,
        archived: repoData.archived,
        disabled: repoData.disabled,
        private: repoData.private
      };
    }

    // Récupérer les commits pour analyser l'activité
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      { headers }
    );

    let commits = [];
    let commitActivity = {};
    let authorActivity = {};
    let languageStats = {};

    if (commitsResponse.ok) {
      commits = await commitsResponse.json();
      
      // Analyser l'activité par date
      commits.forEach(commit => {
        const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
        commitActivity[date] = (commitActivity[date] || 0) + 1;
        
        const author = commit.author?.login || commit.commit.author.name;
        authorActivity[author] = (authorActivity[author] || 0) + 1;
      });
    }

    // Récupérer les contributeurs
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`,
      { headers }
    );

    let contributors = [];
    if (contributorsResponse.ok) {
      contributors = await contributorsResponse.json();
    }

    // Récupérer les branches
    const branchesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      { headers }
    );

    let branches = [];
    if (branchesResponse.ok) {
      branches = await branchesResponse.json();
    }

    // Récupérer les releases
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`,
      { headers }
    );

    let releases = [];
    if (releasesResponse.ok) {
      releases = await releasesResponse.json();
    }

    // Récupérer les issues
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      { headers }
    );

    let issues = [];
    if (issuesResponse.ok) {
      issues = await issuesResponse.json();
    }

    // Récupérer les pull requests
    const pullsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`,
      { headers }
    );

    let pulls = [];
    if (pullsResponse.ok) {
      pulls = await pullsResponse.json();
    }

    // Calculer les métriques de santé
    const healthScore = calculateHealthScore({
      commits: commits.length,
      contributors: contributors.length,
      issues: issues.length,
      pulls: pulls.length,
      stars: repoStats.stargazers_count,
      forks: repoStats.forks_count,
      lastUpdate: repoStats.updated_at
    });

    // Calculer les tendances
    const trends = calculateTrends(commits, issues, pulls);

    // Analyser les langages utilisés
    const languages = await analyzeLanguages(owner, repo, headers);

    return NextResponse.json({
      repoStats,
      commits: {
        total: commits.length,
        activity: commitActivity,
        authors: authorActivity,
        recent: commits.slice(0, 10)
      },
      contributors: {
        total: contributors.length,
        list: contributors.slice(0, 10)
      },
      branches: {
        total: branches.length,
        list: branches
      },
      releases: {
        total: releases.length,
        list: releases
      },
      issues: {
        total: issues.length,
        open: issues.filter(i => i.state === 'open').length,
        closed: issues.filter(i => i.state === 'closed').length
      },
      pulls: {
        total: pulls.length,
        open: pulls.filter(p => p.state === 'open').length,
        merged: pulls.filter(p => p.merged_at).length,
        closed: pulls.filter(p => p.state === 'closed' && !p.merged_at).length
      },
      healthScore,
      trends,
      languages,
      success: true
    });

  } catch (error) {
    console.error('Erreur dans fetchRepoAnalytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des analytics du dépôt' },
      { status: 500 }
    );
  }
}

function calculateHealthScore(metrics) {
  let score = 0;
  let maxScore = 0;

  // Activité récente (30%)
  const daysSinceUpdate = (new Date() - new Date(metrics.lastUpdate)) / (1000 * 60 * 60 * 24);
  const activityScore = Math.max(0, 100 - daysSinceUpdate * 2);
  score += activityScore * 0.3;
  maxScore += 100 * 0.3;

  // Nombre de contributeurs (20%)
  const contributorScore = Math.min(100, metrics.contributors * 10);
  score += contributorScore * 0.2;
  maxScore += 100 * 0.2;

  // Ratio issues/PRs (15%)
  const issuePRRatio = metrics.issues > 0 ? metrics.pulls / metrics.issues : 0;
  const ratioScore = Math.min(100, issuePRRatio * 50);
  score += ratioScore * 0.15;
  maxScore += 100 * 0.15;

  // Popularité (15%)
  const popularityScore = Math.min(100, (metrics.stars + metrics.forks * 2) / 10);
  score += popularityScore * 0.15;
  maxScore += 100 * 0.15;

  // Activité des commits (20%)
  const commitScore = Math.min(100, metrics.commits / 10);
  score += commitScore * 0.2;
  maxScore += 100 * 0.2;

  return Math.round((score / maxScore) * 100);
}

function calculateTrends(commits, issues, pulls) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Commits des 30 derniers jours vs 30 jours précédents
  const recentCommits = commits.filter(c => new Date(c.commit.author.date) > thirtyDaysAgo).length;
  const previousCommits = commits.filter(c => {
    const date = new Date(c.commit.author.date);
    return date > sixtyDaysAgo && date <= thirtyDaysAgo;
  }).length;

  const commitTrend = previousCommits > 0 ? 
    ((recentCommits - previousCommits) / previousCommits) * 100 : 0;

  return {
    commits: {
      recent: recentCommits,
      previous: previousCommits,
      trend: commitTrend
    }
  };
}

async function analyzeLanguages(owner, repo, headers) {
  try {
    // Récupérer les langages utilisés dans le dépôt
    const languagesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      { headers }
    );

    if (languagesResponse.ok) {
      const languages = await languagesResponse.json();
      const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
      
      return Object.entries(languages).map(([language, bytes]) => ({
        language,
        bytes,
        percentage: Math.round((bytes / totalBytes) * 100)
      })).sort((a, b) => b.bytes - a.bytes);
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse des langages:', error);
  }

  return [];
} 