'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileIcon from './FileIcon';

export default function RepositoryExplorer({ user, selectedRepo, onRepoSelect, onFileSelect, loading }) {
  const [repos, setRepos] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, public, private, fork
  const [sortBy, setSortBy] = useState('updated'); // updated, created, name, stars
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState(null);
  
  // Navigation par niveaux
  const [currentPath, setCurrentPath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [treeView, setTreeView] = useState(true);

  // Charger les dépôts
  useEffect(() => {
    fetchRepositories();
  }, [user]);

  // Charger les fichiers quand un dépôt est sélectionné
  useEffect(() => {
    if (selectedRepo) {
      fetchFiles(selectedRepo);
    } else {
      setFiles([]);
    }
  }, [selectedRepo]);

  const fetchRepositories = async () => {
    setIsLoadingRepos(true);
    setError(null);
    
    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: user.access_token,
          plan: user?.plan || 'free' 
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

  const fetchFiles = async (repo) => {
    setIsLoadingFiles(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner || repo.full_name?.split('/')[0] || 'unknown',
          repo: repo.name,
          accessToken: user.access_token
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des fichiers');
      }

      const data = await response.json();
      setFiles(data.files || []);
      setCurrentPath(''); // Réinitialiser le chemin
      setBreadcrumbs([]); // Réinitialiser le fil d'Ariane
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Navigation par niveaux
  const navigateToFolder = (folderPath, folderName) => {
    setCurrentPath(folderPath);
    const newBreadcrumbs = [...breadcrumbs, { path: folderPath, name: folderName }];
    setBreadcrumbs(newBreadcrumbs);
  };

  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      // Retour à la racine
      setCurrentPath('');
      setBreadcrumbs([]);
    } else {
      // Navigation vers un niveau spécifique
      const targetBreadcrumb = breadcrumbs[index];
      setCurrentPath(targetBreadcrumb.path);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  // Obtenir les éléments du niveau actuel
  const getCurrentLevelItems = () => {
    if (!files.length) return [];

    if (currentPath === '') {
      // Niveau racine - fichiers et dossiers de premier niveau
      const rootItems = files.filter(file => {
        const pathParts = file.path.split('/');
        return pathParts.length === 1 || (pathParts.length === 2 && pathParts[1] === '');
      });
      return rootItems;
    }

    // Trouver les éléments du dossier actuel
    return files.filter(file => {
      const filePath = file.path;
      const currentPathWithSlash = currentPath + '/';
      
      // Vérifier si le fichier est dans le dossier actuel
      if (filePath.startsWith(currentPathWithSlash)) {
        const relativePath = filePath.substring(currentPathWithSlash.length);
        const pathParts = relativePath.split('/');
        
        // Retourner seulement les éléments directs (pas les sous-dossiers)
        return pathParts.length === 1 || pathParts[0] === '';
      }
      return false;
    });
  };

  // Fonction pour obtenir les enfants d'un dossier
  const getFolderChildren = (folderPath) => {
    if (!files.length) return [];
    
    const folderPathWithSlash = folderPath + '/';
    return files.filter(file => {
      const filePath = file.path;
      
      // Vérifier si le fichier est dans le dossier spécifié
      if (filePath.startsWith(folderPathWithSlash)) {
        const relativePath = filePath.substring(folderPathWithSlash.length);
        const pathParts = relativePath.split('/');
        
        // Retourner seulement les éléments directs du dossier
        return pathParts.length === 1 || pathParts[0] === '';
      }
      return false;
    });
  };

  // Fonction pour déterminer si un élément est un dossier
  const isFolder = (file) => {
    return file.type === 'tree' || file.path.endsWith('/') || file.isFolder;
  };

  // Fonction pour obtenir le nom du fichier/dossier depuis le chemin
  const getFileName = (filePath) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2] || filePath;
  };

  // Fonction pour obtenir le chemin du dossier parent
  const getParentPath = (filePath) => {
    const parts = filePath.split('/');
    return parts.slice(0, -1).join('/');
  };

  // Fonction pour charger le contenu d'un fichier
  const loadFileContent = async (file) => {
    if (!selectedRepo || !user?.access_token) return;
    
    try {
      const response = await fetch('/api/fetchFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner?.login || selectedRepo.owner || selectedRepo.full_name?.split('/')[0] || 'unknown',
          repo: selectedRepo.name,
          path: file.path,
          branch: selectedRepo.default_branch || 'main',
          accessToken: user.access_token
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du contenu du fichier');
      }

      const data = await response.json();
      
      // Appeler la fonction de sélection de fichier avec le contenu
      onFileSelect({
        ...file,
        content: data.content,
        size: data.size
      });
    } catch (error) {
      console.error('Erreur lors du chargement du contenu:', error);
      setError(error.message);
    }
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Node.js': 'bg-green-600',
      'Java': 'bg-orange-500',
      'C++': 'bg-blue-600',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600'
    };
    return colors[language] || 'bg-gray-500';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `il y a ${Math.ceil(diffDays / 30)} mois`;
  };

  const filteredAndSortedRepos = repos
    .filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || 
                           (filter === 'public' && !repo.private) ||
                           (filter === 'private' && repo.private) ||
                           (filter === 'fork' && repo.fork);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
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

  const currentLevelItems = getCurrentLevelItems();
  const filteredFiles = currentLevelItems.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="h-full flex flex-col">
      {/* Header avec navigation et contrôles */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedRepo ? 'Explorateur de Fichiers' : 'Mes Dépôts'}
            </h2>
            {selectedRepo && (
              <button
                onClick={() => onRepoSelect(null)}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
              >
                ← Retour
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedRepo && (
              <>
                <button
                  onClick={() => setTreeView(!treeView)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    treeView 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {treeView ? 'Vue Grille' : 'Vue Arbre'}
                </button>
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  {viewMode === 'grid' ? 'Liste' : 'Grille'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumbs */}
        {selectedRepo && breadcrumbs.length > 0 && (
          <div className="flex items-center space-x-2 mb-4 text-sm">
            <button
              onClick={() => navigateToBreadcrumb(-1)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              📁 Racine
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-500">/</span>
                <button
                  onClick={() => navigateToBreadcrumb(index)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {crumb.name}
                </button>
              </div>
            ))}
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
                <option value="updated">Mis à jour</option>
                <option value="created">Créé</option>
                <option value="name">Nom</option>
                <option value="stars">Étoiles</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {!selectedRepo ? (
          // Vue des dépôts
          <div className="p-6">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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
                          <p className="text-gray-400 text-sm">@{repo.owner?.login || repo.owner || repo.full_name?.split('/')[0] || 'unknown'}</p>
                        </div>
                        {repo.private && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Privé</span>
                        )}
                      </div>

                      {repo.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{repo.description}</p>
                      )}

                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        {repo.language && (
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>🍴</span>
                          <span>{repo.forks_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>📦</span>
                          <span>{formatFileSize(repo.size)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-400">
                      <p>Mis à jour {formatDate(repo.updated_at)}</p>
                      <p className="text-xs mt-1">Branche: {repo.default_branch}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredAndSortedRepos.length === 0 && (
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
          </div>
        ) : (
          // Vue des fichiers avec navigation par niveaux
          <div className="p-6">
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Chargement des fichiers...</p>
                </div>
              </div>
            ) : treeView ? (
              // Vue arbre
              <div className="space-y-2">
                {filteredFiles.map((file, index) => {
                  const isFolderItem = isFolder(file);
                  const folderPath = isFolderItem ? file.path : file.path.split('/').slice(0, -1).join('/');
                  
                  return (
                    <motion.div
                      key={file.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="flex items-center py-2 px-3 hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        if (isFolderItem) {
                          // Pour les dossiers, naviguer vers le dossier et montrer ses enfants
                          navigateToFolder(file.path, getFileName(file.path));
                        } else {
                          // Pour les fichiers, charger le contenu et ouvrir l'éditeur
                          loadFileContent(file);
                        }
                      }}
                    >
                      <FileIcon 
                        type={isFolderItem ? "tree" : "file"} 
                        name={getFileName(file.path)} 
                        size="sm" 
                        className="mr-3"
                      />
                      <span className="text-gray-300 text-sm flex-1">{getFileName(file.path)}</span>
                      {!isFolderItem && (
                        <span className="text-gray-500 text-xs">{formatFileSize(file.size || 0)}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // Vue grille
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {filteredFiles.map((file, index) => {
                  const isFolderItem = isFolder(file);
                  
                  return (
                    <motion.div
                      key={file.path}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        if (isFolderItem) {
                          // Pour les dossiers, naviguer vers le dossier et montrer ses enfants
                          navigateToFolder(file.path, getFileName(file.path));
                        } else {
                          // Pour les fichiers, charger le contenu et ouvrir l'éditeur
                          loadFileContent(file);
                        }
                      }}
                      className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500/50 hover:bg-gray-800/70"
                    >
                      <div className="text-center">
                        <FileIcon 
                          type={isFolderItem ? "tree" : "file"} 
                          name={getFileName(file.path)} 
                          size="lg" 
                          className="mx-auto mb-3"
                        />
                        <h4 className="text-white font-medium text-sm truncate">{getFileName(file.path)}</h4>
                        {!isFolderItem && (
                          <p className="text-gray-400 text-xs mt-1">{formatFileSize(file.size || 0)}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {filteredFiles.length === 0 && !isLoadingFiles && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Aucun fichier trouvé</h3>
                <p className="text-gray-400">
                  {searchQuery ? 'Aucun fichier ne correspond à votre recherche' : 'Ce dépôt ne contient aucun fichier'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 