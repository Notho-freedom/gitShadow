'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('github_user');
    if (savedUser) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Rediriger vers l'authentification GitHub
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'your-github-client-id';
      const redirectUri = `${window.location.origin}/auth/callback`;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
      
      window.location.href = githubAuthUrl;
    } catch (error) {
      setError('Erreur lors de la connexion avec GitHub');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navbar fixe */}
      <Navbar />

      <div className="flex items-center justify-center px-4 pt-32">
        <div className="max-w-md w-full">
          {/* Logo et titre */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl border border-white/20 flex items-center justify-center"
              >
                <span className="text-white font-bold text-3xl tracking-wider">GS</span>
              </motion.div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Connexion à gitShadow</h1>
            <p className="text-gray-300">Accédez à votre espace de travail</p>
          </motion.div>

          {/* Carte d'authentification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Bouton GitHub */}
            <motion.button
              onClick={handleGitHubAuth}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>Continuer avec GitHub</span>
                </>
              )}
            </motion.button>

            {/* Message d'erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Informations supplémentaires */}
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
          </motion.div>

          {/* Fonctionnalités */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center group"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Sécurisé</h3>
              <p className="text-gray-400 text-sm">OAuth 2.0 avec GitHub</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center group"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Rapide</h3>
              <p className="text-gray-400 text-sm">Connexion en quelques secondes</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-center group"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/30 transition-colors">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-white font-semibold mb-1">Gratuit</h3>
              <p className="text-gray-400 text-sm">Plan gratuit disponible</p>
            </motion.div>
          </motion.div>

          {/* Retour à l'accueil */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Link href="/">
              <span className="text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                ← Retour à l'accueil
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 