'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from './DataProvider';

export default function SearchOverlay({ isOpen, onClose, onFileSelect, selectedRepo, user, checkAndShowUpgrade }) {
  const { fetchCommits, fetchFileTree } = useData();
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fileTree, setFileTree] = useState([]);

  // Charger l'arborescence des fichiers quand un dépôt est sélectionné
  useEffect(() => {
    if (selectedRepo) {
      loadFileTree();
    }
  }, [selectedRepo]);

  const loadFileTree = async () => {
    if (!selectedRepo) return;
    
    try {
      const owner = selectedRepo.owner?.login || selectedRepo.owner;
      const data = await fetchFileTree(owner, selectedRepo.name, 'HEAD');
      
      if (data && data.tree) {
        setFileTree(data.tree);
      }
    } catch (error) {
      // Gérer l'erreur silencieusement
    }
  };

  const handleSearch = async () => {
    // Vérifier si l'utilisateur a accès à la fonctionnalité de recherche
    if (checkAndShowUpgrade && checkAndShowUpgrade('search')) {
      return; // Arrêter ici si un upgrade est nécessaire
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Rechercher dans l'arborescence des fichiers
      const results = [];
      const queryLower = query.toLowerCase();

      // Rechercher dans les fichiers
      fileTree.forEach(item => {
        if (item.path.toLowerCase().includes(queryLower) || 
            item.path.split('/').pop().toLowerCase().includes(queryLower)) {
          results.push({
            type: 'file',
            name: item.path.split('/').pop(),
            path: item.path,
            repo: selectedRepo?.name || 'unknown',
            size: item.size,
            changeInfo: item.changeInfo
          });
        }
      });

      // Rechercher dans les commits récents si on a un dépôt
      if (selectedRepo) {
        try {
          const owner = selectedRepo.owner?.login || selectedRepo.owner;
          const commitsData = await fetchCommits(owner, selectedRepo.name);
          
          if (commitsData && commitsData.commits) {
            commitsData.commits.forEach(commit => {
              if (commit.commit.message.toLowerCase().includes(queryLower) ||
                  commit.author?.login?.toLowerCase().includes(queryLower)) {
                results.push({
                  type: 'commit',
                  name: commit.commit.message.split('\n')[0],
                  sha: commit.sha.substring(0, 7),
                  author: commit.author?.login || commit.commit.author.name,
                  date: commit.commit.author.date,
                  html_url: commit.html_url
                });
              }
            });
          }
        } catch (error) {
          // Gérer l'erreur silencieusement
        }
      }

      // Trier les résultats par pertinence
      const sortedResults = results.sort((a, b) => {
        // Priorité aux fichiers qui commencent par la requête
        const aStartsWith = a.name.toLowerCase().startsWith(queryLower);
        const bStartsWith = b.name.toLowerCase().startsWith(queryLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Puis par type (fichiers en premier)
        if (a.type === 'file' && b.type !== 'file') return -1;
        if (a.type !== 'file' && b.type === 'file') return 1;
        
        return 0;
      });

      setSearchResults(sortedResults.slice(0, 20)); // Limiter à 20 résultats
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Rechercher automatiquement quand la requête change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultSelect = (result) => {
    if (result.type === 'file') {
      onFileSelect(result);
    }
    onClose();
  };

  const getResultIcon = (type) => {
    const icons = {
      file: '📄',
      commit: '📝',
      repo: '📁',
      function: '⚡',
      class: '🏗️',
      variable: '📦'
    };
    return icons[type] || '📄';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      js: '📜',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      h: '⚙️',
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      sass: '🎨',
      json: '📋',
      yaml: '📋',
      yml: '📋',
      md: '📝',
      txt: '📄',
      pdf: '📕',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️',
      svg: '🖼️',
      gitignore: '🚫',
      dockerfile: '🐳',
      readme: '📖'
    };
    return icons[ext] || '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl mx-4 bg-gray-800 rounded-xl shadow-2xl border border-gray-700"
          >
            {/* Search Input */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Rechercher des fichiers, commits, fonctions..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Recherche en cours...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400">
                    {query ? 'Aucun résultat trouvé' : 'Commencez à taper pour rechercher'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <motion.div
                      key={`${result.type}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultSelect(result)}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex-shrink-0 text-xl">
                        {result.type === 'file' ? getFileIcon(result.name) : getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                            {result.name}
                          </h4>
                          {result.type === 'file' && result.changeInfo && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.changeInfo.status === 'added' ? 'bg-green-900/30 text-green-400' :
                              result.changeInfo.status === 'modified' ? 'bg-yellow-900/30 text-yellow-400' :
                              result.changeInfo.status === 'removed' ? 'bg-red-900/30 text-red-400' :
                              'bg-gray-700/30 text-gray-400'
                            }`}>
                              {result.changeInfo.status}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {result.type === 'file' && result.path && (
                            <>
                              {result.path}
                              {result.size && ` • ${formatFileSize(result.size)}`}
                            </>
                          )}
                          {result.type === 'commit' && (
                            <>
                              {result.author} • {result.sha}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>⌘K pour rechercher</span>
                  <span>•</span>
                  <span>{searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>↑↓ pour naviguer</span>
                  <span>•</span>
                  <span>↵ pour ouvrir</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 