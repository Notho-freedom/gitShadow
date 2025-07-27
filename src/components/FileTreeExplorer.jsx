'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileIcon from './FileIcon';

export default function FileTreeExplorer({ 
  owner, 
  repo, 
  onFileSelect, 
  onBackToRepos,
  loading,
  isGuest = false
}) {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [files, setFiles] = useState([]);
  const [treeStructure, setTreeStructure] = useState([]);
  const [treeView, setTreeView] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [currentPath, setCurrentPath] = useState(''); // Pour la navigation par niveaux
  const [breadcrumbs, setBreadcrumbs] = useState([]); // Pour le fil d'Ariane

  // Charger les commits quand un dépôt est sélectionné
  useEffect(() => {
    if (owner && repo) {
      loadCommits();
    }
  }, [owner, repo]);

  // Charger les fichiers quand un commit est sélectionné
  useEffect(() => {
    if (selectedCommit) {
      loadFiles();
    }
  }, [selectedCommit]);

  const loadCommits = async () => {
    if (!owner || !repo) return;
    
    setLoadingCommits(true);
    try {
      // Déterminer l'owner (peut être une chaîne ou un objet)
      const ownerName = typeof owner === 'string' ? owner : owner?.login || owner;
      
      // Pour les invités, utiliser l'API publique sans token
      const url = `/api/fetchCommits?owner=${encodeURIComponent(ownerName)}&repo=${encodeURIComponent(repo)}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
        // Sélectionner le premier commit par défaut
        if (data.commits && data.commits.length > 0) {
          setSelectedCommit(data.commits[0]);
        }
      } else {
        console.error('Erreur HTTP lors du chargement des commits:', response.status);
        // En cas d'erreur, essayer avec une requête POST
        try {
          const postResponse = await fetch('/api/fetchCommits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner: ownerName,
              repo: repo
            })
          });
          if (postResponse.ok) {
            const postData = await postResponse.json();
            setCommits(postData.commits || []);
            if (postData.commits && postData.commits.length > 0) {
              setSelectedCommit(postData.commits[0]);
            }
          }
        } catch (postError) {
          console.error('Erreur lors de la tentative POST:', postError);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commits:', error);
    } finally {
      setLoadingCommits(false);
    }
  };

  const loadFiles = async () => {
    if (!owner || !repo) return;
    
    setLoadingFiles(true);
    try {
      // Déterminer l'owner (peut être une chaîne ou un objet)
      const ownerName = typeof owner === 'string' ? owner : owner?.login || owner;
      
      // Pour les invités, utiliser l'API publique sans token
      const url = `/api/fetchRepo?owner=${encodeURIComponent(ownerName)}&repo=${encodeURIComponent(repo)}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
        setTreeStructure(data.tree || []);
      } else {
        console.error('Erreur HTTP lors du chargement des fichiers:', response.status);
        // En cas d'erreur, essayer avec une requête POST
        try {
          const postResponse = await fetch('/api/fetchRepo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              owner: ownerName,
              repo: repo
            })
          });
          if (postResponse.ok) {
            const postData = await postResponse.json();
            setFiles(postData.files || []);
            setTreeStructure(postData.tree || []);
          }
        } catch (postError) {
          console.error('Erreur lors de la tentative POST:', postError);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
    } finally {
      setLoadingFiles(false);
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

  // Navigation par niveaux pour la vue grille
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
    if (!treeStructure.length) return [];

    if (currentPath === '') {
      // Niveau racine - trier les dossiers en premier
      return treeStructure.sort((a, b) => {
        const aIsFolder = a.isFolder || a.type === 'tree';
        const bIsFolder = b.isFolder || b.type === 'tree';
        
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        
        // Si les deux sont du même type, trier par nom
        return a.name.localeCompare(b.name);
      });
    }

    // Trouver le dossier actuel dans l'arborescence
    const findFolder = (items, targetPath) => {
      for (const item of items) {
        if (item.path === targetPath) {
          // Trier les enfants : dossiers en premier
          return (item.children || []).sort((a, b) => {
            const aIsFolder = a.isFolder || a.type === 'tree';
            const bIsFolder = b.isFolder || b.type === 'tree';
            
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            
            // Si les deux sont du même type, trier par nom
            return a.name.localeCompare(b.name);
          });
        }
        if (item.children) {
          const found = findFolder(item.children, targetPath);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    return findFolder(treeStructure, currentPath);
  };

  const renderTreeItem = (item, level = 0) => {
    if (!item || !item.path) return null;
    
    const isExpanded = expandedFolders.has(item.path);
    const indent = level * 20;
    const isFolder = item.isFolder || item.type === 'tree';

    if (isFolder) {
      return (
        <div key={item.path} className="select-none">
          <motion.div
            className="flex items-center py-1 px-2 hover:bg-gray-700/50 rounded cursor-pointer"
            style={{ paddingLeft: `${indent + 8}px` }}
            onClick={() => toggleFolder(item.path)}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.1 }}
          >
            <FileIcon 
              type="tree" 
              name={item.name} 
              size="sm" 
              className="mr-2"
            />
            <span className="text-gray-300 text-sm flex-1">{item.name}</span>
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-500 text-xs"
            >
              ▶
            </motion.span>
          </motion.div>
          
          <AnimatePresence>
            {isExpanded && item.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {item.children.map(child => renderTreeItem(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    } else {
      return (
        <motion.div
          key={item.path}
          className="flex items-center py-1 px-2 hover:bg-blue-600/20 rounded cursor-pointer"
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => onFileSelect(item)}
          whileHover={{ x: 2, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
          transition={{ duration: 0.1 }}
        >
          <FileIcon 
            type="blob" 
            name={item.name} 
            size="sm" 
            className="mr-2"
          />
          <span className="text-gray-300 text-sm flex-1">{item.name}</span>
          <span className="text-gray-500 text-xs">
            {formatFileSize(item.size)}
          </span>
        </motion.div>
      );
    }
  };



  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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

  if (!owner || !repo) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun dépôt sélectionné</h3>
          <p className="text-gray-400">Sélectionnez un dépôt pour commencer l'exploration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header avec navigation */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToRepos}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              ← Retour aux dépôts
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
                          <div>
                <h2 className="text-lg font-semibold text-white">{repo}</h2>
                <p className="text-sm text-gray-400">{`Dépôt de ${typeof owner === 'string' ? owner : owner?.login || 'Unknown'}`}</p>
              </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTreeView(true)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                treeView 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              🌳 Arborescence
            </button>
            <button
              onClick={() => setTreeView(false)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                !treeView 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              📋 Grille
            </button>
          </div>
        </div>

        {/* Sélecteur de commit et fil d'Ariane */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Commit:</span>
            <select
              value={selectedCommit?.sha || ''}
              onChange={(e) => {
                const commit = commits.find(c => c.sha === e.target.value);
                setSelectedCommit(commit);
              }}
              className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
              disabled={loadingCommits}
            >
              {loadingCommits ? (
                <option>Chargement des commits...</option>
              ) : (
                commits.map(commit => (
                  <option key={commit.sha} value={commit.sha}>
                    {commit.sha.substring(0, 7)} - {commit.commit.message}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Fil d'Ariane pour la vue grille */}
          {!treeView && (
            <div className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => navigateToBreadcrumb(-1)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                📁 {repo}
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {treeView ? (
          // Vue arborescence
          <div className="h-full overflow-y-auto p-4">
            {loadingFiles ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Chargement de l'arborescence...</p>
                </div>
              </div>
            ) : treeStructure.length > 0 ? (
              <div className="space-y-1">
                {treeStructure
                  .sort((a, b) => {
                    const aIsFolder = a.isFolder || a.type === 'tree';
                    const bIsFolder = b.isFolder || b.type === 'tree';
                    
                    if (aIsFolder && !bIsFolder) return -1;
                    if (!aIsFolder && bIsFolder) return 1;
                    
                    // Si les deux sont du même type, trier par nom
                    return a.name.localeCompare(b.name);
                  })
                  .map(item => renderTreeItem(item))
                  .filter(Boolean)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-400">Aucun fichier trouvé</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Vue grille
          <div className="h-full overflow-y-auto p-4">
            {loadingFiles ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Chargement des fichiers...</p>
                </div>
              </div>
            ) : getCurrentLevelItems().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getCurrentLevelItems().map(item => (
                  <motion.div
                    key={item.path}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-blue-500/50 cursor-pointer transition-all duration-200"
                    onClick={() => {
                      if (item.isFolder || item.type === 'tree') {
                        navigateToFolder(item.path, item.name);
                      } else {
                        onFileSelect(item);
                      }
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <FileIcon 
                        type={item.isFolder || item.type === 'tree' ? 'tree' : 'blob'} 
                        name={item.name} 
                        size="lg" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{item.name}</h4>
                        <p className="text-gray-400 text-xs truncate">
                          {item.isFolder || item.type === 'tree' ? 'Dossier' : formatFileSize(item.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {item.isFolder || item.type === 'tree' 
                          ? `${item.children?.length || 0} éléments` 
                          : formatFileSize(item.size)
                        }
                      </span>
                      <span>
                        {item.isFolder || item.type === 'tree' ? '📁' : '📄'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-400">Aucun fichier trouvé</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 