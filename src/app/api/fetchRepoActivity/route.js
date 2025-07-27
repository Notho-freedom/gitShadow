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

    // Récupérer les commits récents
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
      { headers }
    );

    let recentCommits = [];
    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      recentCommits = commits.map(commit => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0],
        author: commit.author?.login || commit.commit.author.name,
        date: commit.commit.author.date,
        html_url: commit.html_url,
        avatar_url: commit.author?.avatar_url
      }));
    }

    // Récupérer les branches récentes
    const branchesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=10`,
      { headers }
    );

    let recentBranches = [];
    if (branchesResponse.ok) {
      const branches = await branchesResponse.json();
      recentBranches = branches
        .filter(branch => branch.commit && branch.commit.commit && branch.commit.commit.author)
        .map(branch => ({
          name: branch.name,
          commit: branch.commit.sha.substring(0, 7),
          date: branch.commit.commit.author.date,
          author: branch.commit.commit.author.name
        }));
    }

    // Récupérer les pull requests récentes
    const pullsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=5`,
      { headers }
    );

    let recentPulls = [];
    if (pullsResponse.ok) {
      const pulls = await pullsResponse.json();
      recentPulls = pulls
        .filter(pull => pull.user)
        .map(pull => ({
          number: pull.number,
          title: pull.title,
          author: pull.user.login,
          state: pull.state,
          created_at: pull.created_at,
          html_url: pull.html_url,
          avatar_url: pull.user.avatar_url
        }));
    }

    // Récupérer les issues récentes
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=5`,
      { headers }
    );

    let recentIssues = [];
    if (issuesResponse.ok) {
      const issues = await issuesResponse.json();
      recentIssues = issues
        .filter(issue => !issue.pull_request && issue.user) // Exclure les PRs et issues sans utilisateur
        .map(issue => ({
          number: issue.number,
          title: issue.title,
          author: issue.user.login,
          state: issue.state,
          created_at: issue.created_at,
          html_url: issue.html_url,
          avatar_url: issue.user.avatar_url,
          labels: (issue.labels || []).map(label => ({
            name: label.name,
            color: label.color
          }))
        }));
    }

    // Récupérer les releases récentes
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`,
      { headers }
    );

    let recentReleases = [];
    if (releasesResponse.ok) {
      const releases = await releasesResponse.json();
      recentReleases = releases.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        created_at: release.created_at,
        published_at: release.published_at,
        html_url: release.html_url,
        author: release.author?.login
      }));
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
        topics: repoData.topics || []
      };
    }

    return NextResponse.json({
      recentCommits,
      recentBranches,
      recentPulls,
      recentIssues,
      recentReleases,
      repoStats,
      success: true
    });

  } catch (error) {
    console.error('Erreur dans fetchRepoActivity:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité du dépôt' },
      { status: 500 }
    );
  }
} 