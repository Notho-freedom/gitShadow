import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');
    const type = searchParams.get('type') || 'all'; // all, public, private
    const sort = searchParams.get('sort') || 'updated'; // updated, created, pushed, full_name
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    // Récupérer les dépôts de l'utilisateur depuis GitHub
    const apiUrl = `https://api.github.com/user/repos?type=${type}&sort=${sort}&per_page=100`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gitShadow-App'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token d\'accès invalide ou expiré' },
          { status: 401 }
        );
      }
      
      throw new Error(`Erreur GitHub API: ${response.status}`);
    }

    const repositories = await response.json();
    
    // Formater les données des dépôts
    const formattedRepos = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      size: repo.size,
      default_branch: repo.default_branch,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      topics: repo.topics || [],
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      }
    }));

    return NextResponse.json({ repositories: formattedRepos });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dépôts' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { accessToken, plan } = body;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    // Récupérer les dépôts de l'utilisateur depuis GitHub
    const apiUrl = `https://api.github.com/user/repos?type=all&sort=updated&per_page=100`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gitShadow-App'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Token d\'accès invalide ou expiré' },
          { status: 401 }
        );
      }
      
      throw new Error(`Erreur GitHub API: ${response.status}`);
    }

    const repositories = await response.json();
    
    // Formater les données des dépôts
    const formattedRepos = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      size: repo.size,
      default_branch: repo.default_branch,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      topics: repo.topics || [],
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url
      }
    }));

    return NextResponse.json({ repositories: formattedRepos });

  } catch (error) {
    console.error('Erreur dans repositories POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dépôts' },
      { status: 500 }
    );
  }
}
