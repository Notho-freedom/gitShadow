'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileIcon from './FileIcon';

export default function FileTreeExplorer({ 
  user, 
  selectedRepo, 
  onFileSelect, 
  onBackToRepos,
  loading 
}) {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [files, setFiles] = useState([]);
  const [treeView, setTreeView] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Charger les commits quand un dépôt est sélectionné
  useEffect(() => {
    if (selectedRepo) {
      loadCommits();
    }
  }, [selectedRepo]);

  // Charger les fichiers quand un commit est sélectionné
  useEffect(() => {
    if (selectedCommit) {
      loadFiles();
    }
  }, [selectedCommit]);

  const loadCommits = async () => {
    if (!selectedRepo || !user?.access_token) return;
    
    setLoadingCommits(true);
    try {
      const response = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name,
          accessToken: user.access_token
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCommits(data.commits || []);
        // Sélectionner le premier commit par défaut
        if (data.commits && data.commits.length > 0) {
          setSelectedCommit(data.commits[0]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commits:', error);
    } finally {
      setLoadingCommits(false);
    }
  };

  const loadFiles = async () => {
    if (!selectedCommit || !user?.access_token) return;
    
    setLoadingFiles(true);
    try {
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name,
          accessToken: user.access_token
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
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

  const getFolderStructure = () => {
    const folders = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Fichier
          if (!folders[currentPath]) folders[currentPath] = { files: [], folders: [] };
          folders[currentPath].files.push(file);
        } else {
          // Dossier
          const folderPath = currentPath ? `${currentPath}/${part}` : part;
          if (!folders[folderPath]) folders[folderPath] = { files: [], folders: [] };
          if (!folders[currentPath]) folders[currentPath] = { files: [], folders: [] };
          if (!folders[currentPath].folders.includes(folderPath)) {
            folders[currentPath].folders.push(folderPath);
          }
          currentPath = folderPath;
        }
      });
    });
    
    return folders;
  };

  const renderTreeItem = (item, path = '', level = 0) => {
    const isExpanded = expandedFolders.has(path);
    const indent = level * 20;

    if (item.type === 'tree') {
      const folderStructure = getFolderStructure();
      const folder = folderStructure[path] || { files: [], folders: [] };
      
      return (
        <div key={path} className="select-none">
          <motion.div
            className="flex items-center py-1 px-2 hover:bg-gray-700/50 rounded cursor-pointer"
            style={{ paddingLeft: `${indent + 8}px` }}
            onClick={() => toggleFolder(path)}
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
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {folder.folders.map(folderPath => {
                  const folderName = folderPath.split('/').pop();
                  return renderTreeItem(
                    { type: 'tree', name: folderName, path: folderPath },
                    folderPath,
                    level + 1
                  );
                })}
                {folder.files.map(file => renderTreeItem(file, file.path, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    } else {
      return (
        <motion.div
          key={path}
          className="flex items-center py-1 px-2 hover:bg-blue-600/20 rounded cursor-pointer"
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => onFileSelect(file)}
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

  if (!selectedRepo) {
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
              <h2 className="text-lg font-semibold text-white">{selectedRepo.name}</h2>
              <p className="text-sm text-gray-400">{selectedRepo.description}</p>
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

        {/* Sélecteur de commit */}
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
            ) : files.length > 0 ? (
              <div className="space-y-1">
                {files.map(file => renderTreeItem(file, file.path))}
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
            ) : files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map(file => (
                  <motion.div
                    key={file.path}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-blue-500/50 cursor-pointer transition-all duration-200"
                    onClick={() => onFileSelect(file)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <FileIcon type="blob" name={file.name} size="lg" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{file.name}</h4>
                        <p className="text-gray-400 text-xs truncate">{file.path}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.path.split('/').length - 1} niveaux</span>
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