'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Logo from '../../components/Logo';

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers l'authentification GitHub
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI)}&scope=repo,user`;
    
    // Attendre un peu avant la redirection pour montrer le message
    const timer = setTimeout(() => {
      window.location.href = githubAuthUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
        
        <p className="text-gray-300 mb-8 max-w-md">
          Vous devez être connecté pour accéder à cette fonctionnalité. 
          Redirection vers GitHub en cours...
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Redirection en cours...</span>
        </div>
        
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Conseil :</strong> Connectez-vous avec GitHub pour accéder à toutes les fonctionnalités de gitShadow
          </p>
        </div>
      </motion.div>
    </div>
  );
} 