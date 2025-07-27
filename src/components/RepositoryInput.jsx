'use client';

import { useState } from 'react';

export default function RepositoryInput({ onRepoUrlChange, onFetchRepo, loading, setLoading }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-4 p-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12z"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder="https://github.com/owner/repository"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-white text-lg placeholder-gray-400 
                         focus:outline-none focus:ring-0 border-0
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         text-white rounded-xl font-semibold transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105
                         shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyse...</span>
                  </div>
                ) : (
                  <span>Analyser</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground">Récupération du dépôt en cours...</span>
            </div>
          </div>
        )}
      </form>

      {/* Exemples d'URLs */}
      <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Exemples de dépôts populaires
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'React', url: 'https://github.com/facebook/react', stars: '210k+' },
            { name: 'Next.js', url: 'https://github.com/vercel/next.js', stars: '110k+' },
            { name: 'VS Code', url: 'https://github.com/microsoft/vscode', stars: '150k+' }
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInputValue(example.url)}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 
                       rounded-xl transition-all duration-300 text-left group"
            >
              <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                {example.name}
              </div>
              <div className="text-sm text-gray-400 mt-1 truncate">
                {example.url.replace('https://github.com/', '')}
              </div>
              <div className="text-xs text-gray-500 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {example.stars} étoiles
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
