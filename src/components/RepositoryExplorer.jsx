'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RepositoryExplorer({ user, selectedRepo, onRepoSelect, onFileSelect, loading, onFilesUpdate }) {
  const [repos, setRepos] = useState([]);
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [fileTree, setFileTree] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingCommits, setIsLoadingCommits] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState(null);

  // Charger les dépôts
  useEffect(() => {
    fetchRepositories();
  }, [user]);

  // Charger les commits quand un dépôt est sélectionné
  useEffect(() => {
    if (selectedRepo) {
      fetchCommits(selectedRepo);
      setCurrentPath('');
      setSelectedCommit(null);
      setFileTree([]);
    } else {
      setCommits([]);
      setSelectedCommit(null);
      setCurrentPath('');
      setFileTree([]);
    }
  }, [selectedRepo]);

  // Charger les fichiers quand un commit est sélectionné
  useEffect(() => {
    if (selectedRepo && selectedCommit) {
      fetchFileTree(selectedRepo, selectedCommit);
    }
  }, [selectedRepo, selectedCommit]);

  // Notifier le parent quand les fichiers sont mis à jour
  useEffect(() => {
    if (onFilesUpdate && fileTree.length > 0) {
      onFilesUpdate(fileTree);
    }
  }, [fileTree, onFilesUpdate]);

  const fetchRepositories = async () => {
    setIsLoadingRepos(true);
    setError(null);
    
    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: user.access_token,
          plan: user.plan 
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des dépôts');
      }

      const data = await response.json();
      setRepos(data.repositories || []);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const fetchCommits = async (repo) => {
    setIsLoadingCommits(true);
    try {
      const response = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner,
          repo: repo.name,
          accessToken: user.access_token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
        // Sélectionner automatiquement le premier commit (HEAD)
        if (data.commits && data.commits.length > 0) {
          setSelectedCommit(data.commits[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commits:', error);
    } finally {
      setIsLoadingCommits(false);
    }
  };

  const fetchFileTree = async (repo, commit) => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner,
          repo: repo.name,
          ref: commit.sha,
          accessToken: user.access_token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFileTree(data.files || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const navigateToPath = (path) => {
    setCurrentPath(path);
  };

  const getFileIcon = (filename, type) => {
    if (type === 'dir') return '📁';
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '⚛️',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '📘',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'html': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'sass': '🎨',
      'json': '📄',
      'md': '📝',
      'sql': '🗄️',
      'xml': '📋',
      'yml': '⚙️',
      'yaml': '⚙️',
      'txt': '📄',
      'log': '📋',
      'sh': '🐚',
      'bat': '🖥️',
      'ps1': '🖥️',
      'gitignore': '🚫',
      'dockerfile': '🐳',
      'readme': '📖'
    };
    
    return iconMap[ext] || '📄';
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'SCSS': '#cf649a',
      'JSON': '#292b36',
      'Markdown': '#083fa1',
      'SQL': '#e38c00',
      'Shell': '#89e051',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB'
    };
    return colors[language] || '#8250df';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentPathItems = () => {
    if (!currentPath) return [];
    return currentPath.split('/').filter(Boolean);
  };

  const getFilesInCurrentPath = () => {
    if (!fileTree || !currentPath) {
      return fileTree.filter(item => !item.path.includes('/'));
    }
    return fileTree.filter(item => {
      const itemPath = item.path;
      const currentPathWithSlash = currentPath + '/';
      return itemPath.startsWith(currentPathWithSlash) && 
             !itemPath.substring(currentPathWithSlash.length).includes('/');
    });
  };

  const filteredAndSortedRepos = repos.filter(repo => {
    if (searchQuery && !selectedRepo) {
      return repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'stars':
        return b.stargazers_count - a.stargazers_count;
      default:
        return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });

  const filteredFiles = getFilesInCurrentPath().filter(file => {
    if (searchQuery && selectedRepo) {
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (isLoadingRepos) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de vos dépôts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchRepositories}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            {selectedRepo ? selectedRepo.name : 'Mes Dépôts'}
          </h2>
          
          {selectedRepo && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRepoSelect(null)}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              ← Retour aux dépôts
            </motion.button>
          )}
        </div>

        {/* Breadcrumb pour la navigation de fichiers */}
        {selectedRepo && selectedCommit && (
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <span className="text-gray-400">📁</span>
            <button
              onClick={() => navigateToPath('')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {selectedRepo.name}
            </button>
            {getCurrentPathItems().map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => navigateToPath(getCurrentPathItems().slice(0, index + 1).join('/'))}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sélection de commit */}
        {selectedRepo && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Commit :
            </label>
            <select
              value={selectedCommit?.sha || ''}
              onChange={(e) => {
                const commit = commits.find(c => c.sha === e.target.value);
                setSelectedCommit(commit);
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoadingCommits ? (
                <option>Chargement des commits...</option>
              ) : (
                commits.map((commit) => (
                  <option key={commit.sha} value={commit.sha}>
                    {commit.message} ({commit.sha.substring(0, 7)}) - {formatDate(commit.date)}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={selectedRepo ? "Rechercher dans les fichiers..." : "Rechercher un dépôt..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {!selectedRepo && (
            <>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous</option>
                <option value="public">Publics</option>
                <option value="private">Privés</option>
                <option value="fork">Forks</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="updated">Dernière modification</option>
                <option value="created">Date de création</option>
                <option value="name">Nom</option>
                <option value="stars">Étoiles</option>
              </select>
            </>
          )}

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedRepo ? (
          // Repository List
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredAndSortedRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => onRepoSelect(repo)}
                  className={`bg-gray-800/50 border border-gray-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:bg-gray-800/70 ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">📁</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{repo.name}</h3>
                        <p className="text-gray-400 text-sm">@{repo.owner?.login || repo.owner}</p>
                      </div>
                      {repo.private && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Privé</span>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{repo.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{repo.stargazers_count}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>🔄</span>
                          <span>{repo.forks_count}</span>
                        </span>
                        {repo.language && (
                          <span className="flex items-center space-x-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            ></div>
                            <span>{repo.language}</span>
                          </span>
                        )}
                      </div>
                      <span>{formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // File Explorer
          <div className="space-y-2">
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <AnimatePresence>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.sha}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      if (file.type === 'dir') {
                        navigateToPath(file.path);
                      } else {
                        onFileSelect(file);
                      }
                    }}
                    className="flex items-center space-x-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800/50 hover:border-blue-500/30"
                  >
                    <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{file.name}</h4>
                      <p className="text-gray-400 text-sm truncate">{file.path}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      {file.type !== 'dir' && (
                        <div>{formatFileSize(file.size)}</div>
                      )}
                      <div>{formatDate(file.updated_at || file.created_at)}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {!selectedRepo && filteredAndSortedRepos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Aucun dépôt trouvé</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Aucun dépôt ne correspond à votre recherche' : 'Vous n\'avez pas encore de dépôts'}
            </p>
          </div>
        )}

        {selectedRepo && selectedCommit && filteredFiles.length === 0 && !isLoadingFiles && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Aucun fichier trouvé</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Aucun fichier ne correspond à votre recherche' : 'Ce répertoire ne contient aucun fichier'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 