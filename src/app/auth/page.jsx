'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        setIsRedirecting(true);
        
        // Récupérer l'URL de retour depuis les paramètres ou utiliser le dashboard
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        
        // Construire l'URL d'authentification GitHub
        const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
        githubAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liQVSY6SK4Brz6cd');
        githubAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
        githubAuthUrl.searchParams.set('scope', 'repo,user');
        githubAuthUrl.searchParams.set('state', btoa(JSON.stringify({ returnUrl })));
        
        // Rediriger vers GitHub
        window.location.href = githubAuthUrl.toString();
        
      } catch (err) {
        console.error('Erreur lors de la redirection:', err);
        setError('Erreur lors de la redirection vers GitHub');
        setIsRedirecting(false);
      }
    };

    // Démarrer l'authentification après un court délai
    const timer = setTimeout(handleAuth, 1000);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleManualAuth = () => {
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liQVSY6SK4Brz6cd');
    githubAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
    githubAuthUrl.searchParams.set('scope', 'repo,user');
    githubAuthUrl.searchParams.set('state', btoa(JSON.stringify({ returnUrl })));
    
    window.location.href = githubAuthUrl.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-8">
          <Logo size="lg" animate={true} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Connexion requise
        </h1>
        
        {error ? (
          <div className="mb-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleManualAuth}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Réessayer la connexion
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-8 max-w-md">
              Vous devez être connecté pour accéder à cette fonctionnalité. 
              Redirection vers GitHub en cours...
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-gray-400 mb-8">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Redirection en cours...</span>
            </div>
            
            <button
              onClick={handleManualAuth}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Se connecter maintenant
            </button>
          </>
        )}
        
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Conseil :</strong> Connectez-vous avec GitHub pour accéder à toutes les fonctionnalités de gitShadow
          </p>
        </div>
      </motion.div>
    </div>
  );
} 