'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileIcon from './FileIcon';

export default function GuestFileExplorer({ files, onFileSelect, selectedFile, loading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [treeView, setTreeView] = useState(true); // true = vue arbre, false = vue grille
  
  // Navigation par niveaux
  const [currentPath, setCurrentPath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Fonction pour déterminer si un élément est un dossier
  const isFolder = (file) => {
    return file.type === 'tree' || file.path.endsWith('/') || file.isFolder;
  };

  // Fonction pour obtenir le nom du fichier/dossier depuis le chemin
  const getFileName = (filePath) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2] || filePath;
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

  // Fonction pour charger le contenu d'un fichier
  const loadFileContent = async (file) => {
    // Appeler la fonction de sélection de fichier
    onFileSelect(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentLevelItems = getCurrentLevelItems();
  const filteredFiles = currentLevelItems.filter(file => 
    getFileName(file.path).toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des fichiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTreeView(!treeView)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              treeView 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {treeView ? 'Vue Grille' : 'Vue Arbre'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-2 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded text-xs transition-colors"
          >
            {viewMode === 'grid' ? 'Liste' : 'Grille'}
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          {filteredFiles.length} élément{filteredFiles.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-2 text-xs mb-3">
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

      {/* Search Bar */}
      <div className="relative mb-3">
        <input
          type="text"
          placeholder="Rechercher dans les fichiers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Files List */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {treeView ? (
          // Vue arbre
          <div className="space-y-1">
            {filteredFiles.map((file, index) => {
              const isFolderItem = isFolder(file);
              
              return (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center py-1.5 px-2 hover:bg-gray-700/50 rounded cursor-pointer transition-colors"
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
                    size="xs" 
                    className="mr-2"
                  />
                  <span className="text-gray-300 text-xs flex-1">{getFileName(file.path)}</span>
                  {!isFolderItem && (
                    <span className="text-gray-500 text-xs">{formatFileSize(file.size || 0)}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Vue grille
          <div className={`grid gap-3 ${
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
                  className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-500/50 hover:bg-gray-800/70"
                >
                  <div className="text-center">
                    <FileIcon 
                      type={isFolderItem ? "tree" : "file"} 
                      name={getFileName(file.path)} 
                      size="md" 
                      className="mx-auto mb-2"
                    />
                    <h4 className="text-white font-medium text-xs truncate">{getFileName(file.path)}</h4>
                    {!isFolderItem && (
                      <p className="text-gray-400 text-xs mt-1">{formatFileSize(file.size || 0)}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            {searchQuery ? 'Aucun fichier trouvé' : 'Aucun fichier disponible'}
          </div>
        )}
      </div>
    </div>
  );
} 