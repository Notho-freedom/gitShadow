'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchOverlay({ isOpen, onClose, user, selectedRepo, onFileSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[activeIndex]) {
        e.preventDefault();
        handleResultSelect(searchResults[activeIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, activeIndex, onClose]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simuler une recherche
    setTimeout(() => {
      const mockResults = [
        { type: 'file', name: 'example.js', path: 'src/components/example.js', repo: 'my-repo' },
        { type: 'file', name: 'utils.js', path: 'src/utils/utils.js', repo: 'my-repo' },
        { type: 'repo', name: 'my-repo', description: 'Mon projet principal' },
        { type: 'function', name: 'handleClick', file: 'example.js', line: 42 }
      ].filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.path?.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);
  };

  const handleResultSelect = (result) => {
    if (result.type === 'file') {
      onFileSelect(result);
    }
    onClose();
  };

  const getResultIcon = (type) => {
    const icons = {
      file: '📄',
      repo: '📁',
      function: '⚡',
      class: '🏗️',
      variable: '📦'
    };
    return icons[type] || '📄';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl mx-4"
          >
            <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-700/50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Recherche globale... (fichiers, fonctions, dépôts)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {isSearching && (
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-gray-400 text-sm">⌘K</span>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={`${result.type}-${result.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleResultSelect(result)}
                        className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors ${
                          index === activeIndex 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="text-xl">{getResultIcon(result.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium truncate">{result.name}</span>
                            {result.type === 'file' && (
                              <span className="text-xs text-gray-500 bg-gray-600/50 px-2 py-1 rounded">
                                {result.path}
                              </span>
                            )}
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-400 truncate">{result.description}</p>
                          )}
                          {result.type === 'function' && (
                            <p className="text-sm text-gray-400">
                              {result.file}:{result.line}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.type === 'file' && 'Fichier'}
                          {result.type === 'repo' && 'Dépôt'}
                          {result.type === 'function' && 'Fonction'}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="py-8 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🔍</span>
                    </div>
                    <p>Aucun résultat trouvé pour "{searchQuery}"</p>
                  </div>
                ) : !searchQuery ? (
                  <div className="py-8 text-center text-gray-400">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">⚡</span>
                    </div>
                    <p>Commencez à taper pour rechercher...</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <p className="font-medium mb-2">Raccourcis :</p>
                        <p>⌘K - Recherche</p>
                        <p>⌘S - Sauvegarder</p>
                        <p>⌘D - Documenter</p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium mb-2">Recherche :</p>
                        <p>Fichiers</p>
                        <p>Fonctions</p>
                        <p>Dépôts</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-700/50 bg-gray-800/50">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>↑↓ Navigation</span>
                    <span>↵ Sélectionner</span>
                    <span>Esc Fermer</span>
                  </div>
                  <span>{searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 