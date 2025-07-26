import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { owner, repo, path, branch = 'main', accessToken } = await request.json();

    console.log('fetchMediaContent API called with:', { owner, repo, path, branch, hasAccessToken: !!accessToken });

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: 'Paramètres owner, repo et path requis' },
        { status: 400 }
      );
    }

    // Construire l'URL de l'API GitHub pour récupérer le contenu en base64
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    
    // Headers pour l'authentification
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Explorer-App'
    };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    }

    console.log('Fetching media content from:', apiUrl);

    // Récupérer les métadonnées du fichier
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error('GitHub API error:', response.status, response.statusText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Fichier média non trouvé' },
          { status: 404 }
        );
      }
      
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Accès refusé au fichier média' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Erreur GitHub API: ${response.status}` },
        { status: response.status }
      );
    }

    // Récupérer les données du fichier
    const fileData = await response.json();
    
    if (!fileData.content) {
      return NextResponse.json(
        { error: 'Contenu du fichier non disponible' },
        { status: 400 }
      );
    }

    // Décoder le contenu base64
    const content = Buffer.from(fileData.content, 'base64');
    
    console.log(`Media content retrieved successfully, size: ${content.length} bytes`);

    // Retourner le contenu avec les headers appropriés
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': fileData.type || 'application/octet-stream',
        'Content-Length': content.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache pendant 1 heure
      }
    });

  } catch (error) {
    console.error('Erreur dans fetchMediaContent:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contenu média' },
      { status: 500 }
    );
  }
} 