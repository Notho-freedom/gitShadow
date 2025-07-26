'use client';

import { useState, useEffect } from 'react';

export default function SearchBar({ searchQuery, setSearchQuery }) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounce pour éviter trop de re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Recherche avancée
      </h3>
      
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher des fichiers..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                   placeholder:text-muted-foreground transition-all duration-200"
        />
        
        {localQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2
                     text-muted-foreground hover:text-foreground transition-colors
                     w-5 h-5 flex items-center justify-center"
          >
            ×
          </button>
        )}
      </div>

      {/* Filtres rapides */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Filtres rapides :</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '.js', query: '.js' },
            { label: '.jsx', query: '.jsx' },
            { label: '.ts', query: '.ts' },
            { label: '.tsx', query: '.tsx' },
            { label: '.css', query: '.css' },
            { label: '.md', query: '.md' },
            { label: 'src/', query: 'src/' },
            { label: 'components/', query: 'components/' }
          ].map((filter) => (
            <button
              key={filter.query}
              onClick={() => setLocalQuery(filter.query)}
              className="px-2 py-1 text-xs bg-muted/50 hover:bg-muted rounded
                       transition-colors border border-border/50"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <div className="text-xs text-muted-foreground">
          Recherche active : <span className="font-mono bg-muted px-1 rounded">{searchQuery}</span>
        </div>
      )}
    </div>
  );
}
