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
      'readme': '📖',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'ico': '🖼️',
      'pdf': '📕',
      'zip': '📦',
      'tar': '📦',
      'gz': '📦',
      'rar': '📦',
      '7z': '📦'
    };
    
    return iconMap[ext] || '📄';
  };

  const getFileColor = (filename, type) => {
    if (type === 'dir') return 'from-blue-500 to-blue-600';
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const colorMap = {
      'js': 'from-yellow-500 to-orange-500',
      'jsx': 'from-blue-500 to-cyan-500',
      'ts': 'from-blue-600 to-blue-700',
      'tsx': 'from-blue-500 to-purple-500',
      'py': 'from-green-500 to-blue-500',
      'java': 'from-red-500 to-orange-500',
      'cpp': 'from-blue-600 to-purple-600',
      'c': 'from-gray-500 to-gray-600',
      'html': 'from-orange-500 to-red-500',
      'css': 'from-blue-500 to-purple-500',
      'scss': 'from-pink-500 to-purple-500',
      'sass': 'from-pink-500 to-purple-500',
      'json': 'from-yellow-500 to-orange-500',
      'md': 'from-gray-500 to-gray-600',
      'sql': 'from-blue-500 to-indigo-500',
      'xml': 'from-orange-500 to-red-500',
      'yml': 'from-purple-500 to-pink-500',
      'yaml': 'from-purple-500 to-pink-500',
      'txt': 'from-gray-400 to-gray-500',
      'log': 'from-gray-500 to-gray-600',
      'sh': 'from-green-500 to-green-600',
      'bat': 'from-gray-600 to-gray-700',
      'ps1': 'from-blue-600 to-blue-700',
      'gitignore': 'from-gray-500 to-gray-600',
      'dockerfile': 'from-blue-500 to-indigo-500',
      'readme': 'from-blue-500 to-purple-500',
      'png': 'from-green-500 to-blue-500',
      'jpg': 'from-pink-500 to-purple-500',
      'jpeg': 'from-pink-500 to-purple-500',
      'gif': 'from-purple-500 to-pink-500',
      'svg': 'from-orange-500 to-yellow-500',
      'ico': 'from-yellow-500 to-orange-500',
      'pdf': 'from-red-500 to-red-600',
      'zip': 'from-yellow-500 to-orange-500',
      'tar': 'from-gray-500 to-gray-600',
      'gz': 'from-gray-500 to-gray-600',
      'rar': 'from-red-500 to-red-600',
      '7z': 'from-purple-500 to-purple-600'
    };
    
    return colorMap[ext] || 'from-gray-500 to-gray-600';
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
      {/* Header avec sélection de commit */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onRepoSelect(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Retour aux dépôts</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedRepo?.name}</h1>
              <p className="text-gray-400 text-sm">@{selectedRepo?.owner?.login || selectedRepo?.owner}</p>
            </div>
          </div>
          
          {/* Sélection de commit avec design amélioré */}
          {selectedRepo && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Commit :</span>
                <div className="relative">
                  <select
                    value={selectedCommit?.sha || ''}
                    onChange={(e) => {
                      const commit = commits.find(c => c.sha === e.target.value);
                      setSelectedCommit(commit);
                    }}
                    className="appearance-none bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px]"
                  >
                    {isLoadingCommits ? (
                      <option>Chargement des commits...</option>
                    ) : (
                      commits.map((commit) => (
                        <option key={commit.sha} value={commit.sha}>
                          {commit.commit?.message?.substring(0, 50)}... ({commit.sha.substring(0, 7)}) - {formatDate(commit.commit?.author?.date)}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb amélioré */}
        {selectedRepo && selectedCommit && (
          <div className="flex items-center space-x-2 text-sm bg-gray-700/30 rounded-lg p-3">
            <span className="text-blue-400">📁</span>
            <button
              onClick={() => navigateToPath('')}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {selectedRepo.name}
            </button>
            {getCurrentPathItems().map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button
                  onClick={() => navigateToPath(getCurrentPathItems().slice(0, index + 1).join('/'))}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barre d'outils */}
      <div className="bg-gray-800/30 border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          {/* Recherche */}
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder={selectedRepo ? "Rechercher dans les fichiers..." : "Rechercher un dépôt..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtres et vue */}
          <div className="flex items-center space-x-3">
            {!selectedRepo && (
              <>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les dépôts</option>
                  <option value="public">Publics</option>
                  <option value="private">Privés</option>
                  <option value="fork">Forks</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updated">Dernière modification</option>
                  <option value="created">Date de création</option>
                  <option value="name">Nom</option>
                  <option value="stars">Étoiles</option>
                </select>
              </>
            )}

            {/* Boutons de vue */}
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title="Vue grille"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                }`}
                title="Vue liste"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-auto p-6">
        {!selectedRepo ? (
          // Liste des dépôts
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {filteredAndSortedRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => onRepoSelect(repo)}
                  className={`bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:bg-gray-800/70 hover:shadow-lg ${
                    viewMode === 'list' ? 'flex items-center space-x-4' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">📁</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate text-lg">{repo.name}</h3>
                        <p className="text-gray-400 text-sm">@{repo.owner?.login || repo.owner}</p>
                      </div>
                      {repo.private && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">Privé</span>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">{repo.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1 bg-gray-700/50 px-2 py-1 rounded-md">
                          <span>⭐</span>
                          <span className="font-medium">{repo.stargazers_count}</span>
                        </span>
                        <span className="flex items-center space-x-1 bg-gray-700/50 px-2 py-1 rounded-md">
                          <span>🔄</span>
                          <span className="font-medium">{repo.forks_count}</span>
                        </span>
                        {repo.language && (
                          <span className="flex items-center space-x-1 bg-gray-700/50 px-2 py-1 rounded-md">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            ></div>
                            <span className="font-medium">{repo.language}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">{formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // Explorateur de fichiers avec vue grid/liste
          <div className="space-y-4">
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  {filteredFiles.map((file, index) => (
                    <motion.div
                      key={file.sha}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (file.type === 'dir') {
                          navigateToPath(file.path);
                        } else {
                          onFileSelect(file);
                        }
                      }}
                      className={`bg-gray-800/30 border border-gray-700/50 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800/50 hover:border-blue-500/30 ${
                        viewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-4 text-center'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        // Vue grille
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getFileColor(file.name, file.type)} flex items-center justify-center shadow-lg`}>
                              <span className="text-2xl">{getFileIcon(file.name, file.type)}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm truncate">{file.name}</h4>
                            {file.type !== 'dir' && (
                              <p className="text-gray-400 text-xs mt-1">{formatFileSize(file.size)}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">{formatDate(file.updated_at || file.created_at)}</p>
                          </div>
                        </div>
                      ) : (
                        // Vue liste
                        <>
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getFileColor(file.name, file.type)} flex items-center justify-center`}>
                            <span className="text-lg">{getFileIcon(file.name, file.type)}</span>
                          </div>
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
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* États vides */}
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