'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RepositoryInput({ onRepoUrlChange, onFetchRepo, loading, setLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const validateGitHubUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'github.com' && parsed.pathname.split('/').length >= 3;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Veuillez entrer une URL de dépôt');
      return;
    }

    if (!validateGitHubUrl(inputValue)) {
      setError('Veuillez entrer une URL GitHub valide (ex: https://github.com/owner/repo)');
      return;
    }

    setError('');
    setLoading(true);
    onRepoUrlChange(inputValue);
    
    try {
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputValue })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération du dépôt');
      }

      const data = await response.json();
      onFetchRepo(data.tree || []);
    } catch (err) {
      setError(err.message);
      onFetchRepo([]);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    { url: 'https://github.com/facebook/react', name: 'React', desc: 'Bibliothèque UI populaire' },
    { url: 'https://github.com/vercel/next.js', name: 'Next.js', desc: 'Framework React moderne' },
    { url: 'https://github.com/microsoft/vscode', name: 'VS Code', desc: 'Éditeur de code' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Formulaire principal */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="relative group">
          {/* Container avec effet glassmorphism */}
          <div className={`
            relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2
            transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20
            ${isFocused ? 'bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/20' : ''}
          `}>
            {/* Icône GitHub */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>

            {/* Input principal */}
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              className="w-full pl-14 pr-32 py-4 text-lg bg-transparent border-none outline-none
                       text-white placeholder:text-gray-400 font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Bouton d'analyse */}
            <motion.button
              type="submit"
              disabled={loading || !inputValue.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2
                       px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 text-white rounded-xl
                       font-semibold transition-all duration-200 shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                       flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span>Analyser</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Messages d'erreur */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-center py-8"
            >
              <div className="flex items-center space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">Récupération du dépôt en cours...</p>
                  <p className="text-gray-400 text-sm">Analyse de la structure des fichiers</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Exemples d'URLs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8"
      >
        <div className="text-center mb-4">
          <h4 className="text-lg font-semibold text-white mb-2">Exemples populaires</h4>
          <p className="text-gray-400 text-sm">Cliquez sur un exemple pour le tester</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => setInputValue(example.url)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                       hover:bg-white/10 hover:border-white/20 transition-all duration-200
                       text-left group"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📁</span>
                </div>
                <div>
                  <h5 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                    {example.name}
                  </h5>
                  <p className="text-gray-400 text-xs">{example.desc}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm font-mono truncate">{example.url}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: '🤖', title: 'IA Intelligente', desc: 'Génération automatique de documentation' },
          { icon: '⚡', title: 'Analyse Rapide', desc: 'Traitement instantané des dépôts' },
          { icon: '🔍', title: 'Exploration Complète', desc: 'Navigation dans tous les fichiers' }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            className="text-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                     hover:bg-white/10 transition-all duration-200"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h5 className="text-white font-semibold mb-2">{feature.title}</h5>
            <p className="text-gray-400 text-sm">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
