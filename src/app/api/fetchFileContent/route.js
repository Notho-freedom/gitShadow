import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path');
    const ref = searchParams.get('ref') || 'main';
    const accessToken = searchParams.get('accessToken');

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: 'Paramètres owner, repo et path requis' },
        { status: 400 }
      );
    }

    // Construire l'URL de l'API GitHub
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`;
    
    // Headers pour l'authentification
    const headers = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'GitHub-Explorer-App'
    };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Récupérer le contenu du fichier
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Fichier non trouvé' },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Accès refusé au fichier' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Erreur GitHub API: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu du fichier
    const content = await response.text();

    return NextResponse.json({
      content,
      path,
      size: content.length,
      success: true
    });

  } catch (error) {
    console.error('Erreur dans fetchFileContent GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu du fichier' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { owner, repo, path, branch = 'main', accessToken } = await request.json();

    console.log('fetchFileContent POST API called with:', { owner, repo, path, branch, hasAccessToken: !!accessToken });

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: 'Paramètres owner, repo et path requis' },
        { status: 400 }
      );
    }

    // Construire l'URL de l'API GitHub
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    
    // Headers pour l'authentification
    const headers = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'GitHub-Explorer-App'
    };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }

    console.log('Fetching file content from:', apiUrl);

    // Récupérer le contenu du fichier
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Fichier non trouvé' },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Accès refusé au fichier' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Erreur GitHub API: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer le contenu du fichier
    const content = await response.text();
    
    console.log(`File content retrieved successfully, size: ${content.length} characters`);

    return NextResponse.json({
      content,
      path,
      size: content.length,
      success: true
    });

  } catch (error) {
    console.error('Erreur dans fetchFileContent POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu du fichier' },
      { status: 500 }
    );
  }
} 