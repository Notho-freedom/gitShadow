'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '../../../components/Logo';

function AuthCallbackContent() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        
        // Vérifier s'il y a une erreur GitHub
        if (errorParam) {
          throw new Error(`Erreur GitHub: ${errorParam}`);
        }

        if (!code) {
          throw new Error('Code d\'autorisation manquant');
        }

        // Décoder le state pour récupérer l'URL de retour
        let returnUrl = '/dashboard';
        if (state) {
          try {
            const stateData = JSON.parse(atob(state));
            returnUrl = stateData.returnUrl || '/dashboard';
          } catch (stateError) {
            console.warn('Erreur lors du décodage du state:', stateError);
          }
        }

        setStatus('exchanging');

        // Échanger le code contre un token d'accès
        const response = await fetch('/api/auth/github', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur d\'authentification');
        }

        const { user } = await response.json();

        // Stocker les données utilisateur
        localStorage.setItem('github_user', JSON.stringify(user));

        setStatus('success');

        // Rediriger vers l'URL d'origine après un court délai
        setTimeout(() => {
          router.push(returnUrl);
        }, 1500);

      } catch (err) {
        console.error('Erreur de callback OAuth:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="flex justify-center">
            <Logo size="lg" animate={false} />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-white">Vérification...</h2>
            <p className="text-gray-400">Traitement de votre authentification GitHub</p>
          </div>
        )}

        {status === 'exchanging' && (
          <div className="space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl font-semibold text-white">Connexion en cours...</h2>
            <p className="text-gray-400">Récupération de vos informations GitHub</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-lg">✓</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Connexion réussie !</h2>
            <p className="text-gray-400">Redirection vers votre dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-lg">✗</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Erreur de connexion</h2>
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-semibold text-white mt-4">Chargement...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 