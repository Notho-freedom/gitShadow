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

    // Récupérer les collaborateurs du dépôt
    const collaboratorsUrl = `https://api.github.com/repos/${owner}/${repo}/collaborators?per_page=100`;
    
    const response = await fetch(collaboratorsUrl, { headers });

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

    const collaborators = await response.json();

    // Récupérer les détails de chaque collaborateur
    const detailedCollaborators = await Promise.all(
      collaborators.map(async (collaborator) => {
        try {
          // Récupérer les détails de l'utilisateur
          const userResponse = await fetch(`https://api.github.com/users/${collaborator.login}`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'gitShadow-App'
            }
          });

          let userDetails = {};
          if (userResponse.ok) {
            userDetails = await userResponse.json();
          }

          // Récupérer les permissions du collaborateur
          const permissionsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/collaborators/${collaborator.login}/permission`,
            { headers }
          );

          let permissions = { permission: 'read' };
          if (permissionsResponse.ok) {
            permissions = await permissionsResponse.json();
          }

          // Récupérer l'activité récente du collaborateur sur ce dépôt
          const commitsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?author=${collaborator.login}&per_page=5`,
            { headers }
          );

          let recentActivity = [];
          if (commitsResponse.ok) {
            const commits = await commitsResponse.json();
            recentActivity = commits.map(commit => ({
              sha: commit.sha.substring(0, 7),
              message: commit.commit.message.split('\n')[0],
              date: commit.commit.author.date,
              html_url: commit.html_url
            }));
          }

          return {
            id: collaborator.id,
            login: collaborator.login,
            name: userDetails.name || collaborator.login,
            email: userDetails.email || null,
            avatar_url: collaborator.avatar_url,
            role: permissions.permission || 'read',
            status: 'online', // GitHub ne fournit pas le statut en temps réel
            lastActive: recentActivity.length > 0 ? 
              formatDate(recentActivity[0].date) : 'Aucune activité récente',
            recentActivity: recentActivity,
            html_url: collaborator.html_url,
            site_admin: collaborator.site_admin || false
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération des détails pour ${collaborator.login}:`, error);
          return {
            id: collaborator.id,
            login: collaborator.login,
            name: collaborator.login,
            email: null,
            avatar_url: collaborator.avatar_url,
            role: 'read',
            status: 'offline',
            lastActive: 'Inconnu',
            recentActivity: [],
            html_url: collaborator.html_url,
            site_admin: collaborator.site_admin || false
          };
        }
      })
    );

    // Récupérer aussi les contributeurs (commits) pour avoir une vue complète
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=20`,
      { headers }
    );

    let contributors = [];
    if (contributorsResponse.ok) {
      const contributorsData = await contributorsResponse.json();
      contributors = contributorsData.map(contributor => ({
        login: contributor.login,
        contributions: contributor.contributions,
        avatar_url: contributor.avatar_url,
        html_url: contributor.html_url
      }));
    }

    return NextResponse.json({
      collaborators: detailedCollaborators,
      contributors: contributors,
      success: true
    });

  } catch (error) {
    console.error('Erreur dans fetchCollaborators:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des collaborateurs' },
      { status: 500 }
    );
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.ceil(diffDays / 7)} semaines`;
  return `il y a ${Math.ceil(diffDays / 30)} mois`;
} 