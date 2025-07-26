'use client';

import { useState } from 'react';

export default function AuthPage({ onAuthSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Authentification GitHub OAuth réelle
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liQVSY6SK4Brz6cd';
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback');
      const scope = encodeURIComponent('repo user:email read:user');
      const state = Math.random().toString(36).substring(2, 15);
      
      // Stocker l'état pour la vérification
      localStorage.setItem('github_oauth_state', state);
      
      // Redirection vers GitHub OAuth
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
      window.location.assign(authUrl);
      
    } catch (err) {
      setError('Erreur lors de la connexion à GitHub');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-white">gS</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Connexion à gitShadow</h1>
          <p className="text-gray-400">Connectez-vous avec votre compte GitHub pour accéder à vos dépôts</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGitHubAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-medium">Connexion en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="text-white font-medium">Continuer avec GitHub</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              En vous connectant, vous acceptez nos{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">conditions d'utilisation</a>
              {' '}et notre{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">politique de confidentialité</a>
            </p>
          </div>
        </div>

        {/* Avantages */}
        <div className="mt-8 space-y-4">
          <h3 className="text-white font-semibold text-center">Pourquoi se connecter ?</h3>
          <div className="space-y-3">
            {[
              'Accès à tous vos dépôts publics et privés',
              'Synchronisation automatique des commits',
              'Génération de documentation IA avancée',
              'Collaboration avec votre équipe'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-gray-300">
                <span className="text-green-400">✓</span>
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sécurité */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-400">🔒</span>
            <span className="text-blue-400 font-medium text-sm">Sécurité garantie</span>
          </div>
          <p className="text-gray-400 text-xs">
            Nous utilisons OAuth 2.0 pour une connexion sécurisée. Vos données restent privées et nous ne stockons jamais vos mots de passe.
          </p>
        </div>
      </div>
    </div>
  );
}
