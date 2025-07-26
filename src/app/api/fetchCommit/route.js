import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { owner, repo, commitSha } = await request.json();

    if (!owner || !repo || !commitSha) {
      return NextResponse.json(
        { error: 'Paramètres owner, repo et commitSha requis' },
        { status: 400 }
      );
    }

    // Récupérer l'arborescence des fichiers pour un commit donné
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gitShadow-App'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erreur GitHub API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Formater les fichiers
    const tree = data.tree
      .filter(item => item.type === 'blob')
      .map(item => ({
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        url: item.url,
        download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${commitSha}/${item.path}`
      }));

    return NextResponse.json({ success: true, tree });

  } catch (error) {
    console.error('Erreur dans fetchCommit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'arborescence du commit' },
      { status: 500 }
    );
  }
}
