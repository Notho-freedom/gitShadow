import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code d\'autorisation manquant' },
        { status: 400 }
      );
    }

    // Utiliser les vraies clés GitHub OAuth
    const clientId = process.env.GITHUB_CLIENT_ID || 'Ov23liQVSY6SK4Brz6cd';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || '389c2ea9ef9373bb8bc5e40b51c0b7ebac2edd54';

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Configuration OAuth manquante' },
        { status: 500 }
      );
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'gitShadow-App',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Erreur GitHub OAuth: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json(
        { error: `Erreur GitHub: ${tokenData.error_description || tokenData.error}` },
        { status: 400 }
      );
    }

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: 'Token d\'accès non reçu' },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'utilisateur
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'gitShadow-App',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Erreur API GitHub: ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    // Récupérer l'email si pas disponible dans les données de base
    let userEmail = userData.email;
    if (!userEmail) {
      try {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'gitShadow-App',
          },
        });

        if (emailResponse.ok) {
          const emails = await emailResponse.json();
          const primaryEmail = emails.find(email => email.primary);
          userEmail = primaryEmail ? primaryEmail.email : emails[0]?.email;
        }
      } catch (emailError) {
        console.warn('Impossible de récupérer l\'email:', emailError);
      }
    }

    // Déterminer le plan de l'utilisateur
    const plan = determinePlan(userData);

    const user = {
      id: userData.id,
      login: userData.login,
      name: userData.name || userData.login,
      email: userEmail,
      avatar_url: userData.avatar_url,
      plan: plan,
      access_token: tokenData.access_token,
      public_repos: userData.public_repos,
      private_repos: userData.total_private_repos,
      followers: userData.followers,
      following: userData.following,
      company: userData.company,
      location: userData.location,
      created_at: userData.created_at
    };

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Erreur d\'authentification GitHub:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification GitHub' },
      { status: 500 }
    );
  }
}

function determinePlan(userData) {
  // Logique pour déterminer le plan de l'utilisateur
  // Basé sur l'activité GitHub et les critères métier
  
  const repoCount = userData.public_repos + (userData.total_private_repos || 0);
  const followers = userData.followers || 0;
  const accountAge = userData.created_at ? 
    (new Date() - new Date(userData.created_at)) / (1000 * 60 * 60 * 24 * 365) : 0;

  // Plan Enterprise pour les organisations ou comptes très actifs
  if (userData.company || followers > 500 || repoCount > 100) {
    return 'enterprise';
  }
  
  // Plan Pro pour les développeurs actifs
  if (repoCount > 20 || followers > 50 || accountAge > 2) {
    return 'pro';
  }
  
  // Plan gratuit par défaut
  return 'free';
}
