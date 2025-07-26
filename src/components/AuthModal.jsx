'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Générer un état aléatoire pour la sécurité OAuth
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('github_oauth_state', state);
      
      // Rediriger vers l'authentification GitHub
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liQVSY6SK4Brz6cd';
      const redirectUri = `${window.location.origin}/auth/callback`;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${state}`;
      
      window.location.href = githubAuthUrl;
    } catch (error) {
      setError('Erreur lors de la connexion avec GitHub');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo size="lg" animate={false} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Connexion à gitShadow</h2>
            <p className="text-gray-300 mb-8">Accédez à votre espace de travail</p>

            {/* GitHub Auth Button */}
            <button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>Continuer avec GitHub</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Info */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                En continuant, vous acceptez nos{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                  politique de confidentialité
                </a>
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🔒</span>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">Sécurisé</h3>
                <p className="text-gray-400 text-xs">OAuth 2.0 avec GitHub</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">⚡</span>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">Rapide</h3>
                <p className="text-gray-400 text-xs">Connexion en quelques secondes</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg">🚀</span>
                </div>
                <h3 className="text-white font-medium text-sm mb-1">Gratuit</h3>
                <p className="text-gray-400 text-xs">Plan gratuit disponible</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 