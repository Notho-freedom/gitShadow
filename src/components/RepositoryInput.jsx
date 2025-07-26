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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="https://github.com/owner/repository"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            className="w-full px-6 py-4 text-lg bg-card border border-border rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     placeholder:text-muted-foreground transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg
                       hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                       font-medium"
            >
              {loading ? 'Analyse...' : 'Analyser'}
            </button>
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
      <div className="mt-6 p-4 bg-muted/20 rounded-lg">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Exemples d'URLs :</h4>
        <div className="space-y-1">
          {[
            'https://github.com/facebook/react',
            'https://github.com/vercel/next.js',
            'https://github.com/microsoft/vscode'
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setInputValue(example)}
              className="block text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
