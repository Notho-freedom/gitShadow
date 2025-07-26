'use client';

import { useState, useEffect, useMemo } from 'react';

export default function FileExplorer({ repo, commit, onFileSelect, selectedFile }) {
  const [fileTree, setFileTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (repo && commit) {
      fetchFileTree();
    }
  }, [repo, commit]);

  const fetchFileTree = async () => {
    if (!repo || !commit) return;
    
    setLoading(true);
    try {
      // Simulation de l'arborescence des fichiers
      const mockFiles = [
        { path: 'README.md', type: 'file', size: 2048 },
        { path: 'package.json', type: 'file', size: 1024 },
        { path: 'package-lock.json', type: 'file', size: 45678 },
        { path: '.gitignore', type: 'file', size: 512 },
        { path: 'src/index.js', type: 'file', size: 1536 },
        { path: 'src/App.js', type: 'file', size: 2048 },
        { path: 'src/components/Header.jsx', type: 'file', size: 1024 },
        { path: 'src/components/Footer.jsx', type: 'file', size: 768 },
        { path: 'src/components/Dashboard/index.jsx', type: 'file', size: 3072 },
        { path: 'src/components/Dashboard/Dashboard.module.css', type: 'file', size: 1536 },
        { path: 'src/hooks/useAuth.js', type: 'file', size: 2048 },
        { path: 'src/hooks/useApi.js', type: 'file', size: 1792 },
        { path: 'src/utils/helpers.js', type: 'file', size: 1024 },
        { path: 'src/utils/constants.js', type: 'file', size: 512 },
        { path: 'src/styles/globals.css', type: 'file', size: 2048 },
        { path: 'src/styles/components.css', type: 'file', size: 1536 },
        { path: 'public/index.html', type: 'file', size: 1024 },
        { path: 'public/favicon.ico', type: 'file', size: 4096 },
        { path: 'public/images/logo.png', type: 'file', size: 8192 },
        { path: 'docs/README.md', type: 'file', size: 3072 },
        { path: 'docs/api.md', type: 'file', size: 4096 },
        { path: 'tests/App.test.js', type: 'file', size: 1024 },
        { path: 'tests/components/Header.test.jsx', type: 'file', size: 1536 },
        { path: 'tests/utils/helpers.test.js', type: 'file', size: 2048 },
        { path: '.github/workflows/ci.yml', type: 'file', size: 1024 },
        { path: '.github/workflows/deploy.yml', type: 'file', size: 1536 }
      ];

      setFileTree(mockFiles);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'arborescence:', error);
    } finally {
      setLoading(false);
    }
  };

  // Organiser les fichiers en structure d'arbre
  const organizedTree = useMemo(() => {
    if (!fileTree.length) return [];

    const tree = {};
    const filteredFiles = fileTree.filter(item => 
      item.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredFiles.forEach(item => {
      const parts = item.path.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: index === parts.length - 1 ? 'file' : 'folder',
            children: {},
            item: index === parts.length - 1 ? item : null,
            size: index === parts.length - 1 ? item.size : 0
          };
        }
        current = current[part].children;
      });
    });

    const convertToArray = (obj) => {
      return Object.values(obj)
        .map(node => ({
          ...node,
          children: Object.keys(node.children).length > 0 ? convertToArray(node.children) : []
        }))
        .sort((a, b) => {
          // Dossiers en premier, puis fichiers
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
    };

    return convertToArray(tree);
  }, [fileTree, searchQuery]);

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '🟨',
      'jsx': '⚛️',
      'ts': '🔷',
      'tsx': '⚛️',
      'css': '🎨',
      'scss': '🎨',
      'html': '🌐',
      'json': '📋',
      'md': '📝',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'vue': '💚',
      'svelte': '🧡',
      'yml': '📄',
      'yaml': '📄',
      'xml': '📄',
      'svg': '🖼️',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'ico': '🖼️'
    };
    return iconMap[ext] || '📄';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile?.path === node.path;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.path} className="select-none">
          <div
            className={`flex items-center py-2 px-3 rounded-md cursor-pointer transition-all duration-150 group ${
              isSelected ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'hover:bg-gray-700/50'
            } ${level > 0 ? `ml-${Math.min(level * 4, 16)}` : ''}`}
            onClick={() => {
              if (node.type === 'folder' && hasChildren) {
                toggleFolder(node.path);
              } else if (node.type === 'file' && node.item) {
                onFileSelect(node.item);
              }
            }}
          >
            {/* Indicateur d'expansion pour les dossiers */}
            <span className="w-4 h-4 flex items-center justify-center mr-2 text-xs">
              {node.type === 'folder' && hasChildren ? (
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  {isExpanded ? '📂' : '📁'}
                </span>
              ) : (
                getFileIcon(node.name)
              )}
            </span>

            {/* Nom du fichier/dossier */}
            <span className={`flex-1 text-sm truncate ${
              node.type === 'folder' ? 'font-medium text-gray-200' : 'text-gray-300'
            } group-hover:text-white transition-colors`}>
              {node.name}
            </span>

            {/* Taille du fichier */}
            {node.type === 'file' && node.size > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                {formatSize(node.size)}
              </span>
            )}

            {/* Indicateur de sélection */}
            {isSelected && (
              <span className="w-2 h-2 bg-blue-400 rounded-full ml-2" />
            )}
          </div>

          {/* Enfants (récursif) */}
          {node.type === 'folder' && hasChildren && isExpanded && (
            <div className="ml-2 border-l border-gray-700/50 pl-2">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!repo || !commit) {
    return (
      <div className="h-full p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-2xl">📁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sélectionnez un commit</h3>
          <p className="text-gray-400 text-sm">Choisissez un commit pour explorer ses fichiers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/30">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Explorateur
          </h3>
          <span className="text-xs text-gray-500">
            {organizedTree.length} éléments
          </span>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher des fichiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Info du commit */}
        <div className="mt-3 p-2 bg-gray-700/50 rounded-md">
          <div className="text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              <span>📝</span>
              <span className="font-mono">{commit.sha.substring(0, 7)}</span>
            </div>
            <div className="mt-1 truncate">
              {commit.commit.message.split('\n')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Arborescence */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Chargement des fichiers...</p>
            </div>
          </div>
        ) : organizedTree.length > 0 ? (
          <div className="space-y-1">
            {renderTree(organizedTree)}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-2xl mb-2 block">🔍</span>
            <p className="text-sm text-gray-400">
              {searchQuery ? `Aucun fichier trouvé pour "${searchQuery}"` : 'Aucun fichier trouvé'}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {!loading && fileTree.length > 0 && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Total des fichiers:</span>
              <span className="font-mono">{fileTree.length}</span>
            </div>
            {searchQuery && (
              <div className="flex justify-between">
                <span>Résultats filtrés:</span>
                <span className="font-mono">{organizedTree.length}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taille totale:</span>
              <span className="font-mono">
                {formatSize(fileTree.reduce((acc, file) => acc + file.size, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
