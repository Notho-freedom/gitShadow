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
      // Utiliser l'API fetchCommit pour récupérer l'état complet du commit
      const response = await fetch('/api/fetchCommit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner,
          repo: repo.name,
          commitSha: commit.sha,
          accessToken: repo.accessToken || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tree) {
          setFileTree(data.tree);
        } else {
          throw new Error(data.error || 'Erreur lors du chargement');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur de réponse du serveur');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'arborescence:', error);
      setFileTree([]);
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
            type: index === parts.length - 1 ? 'blob' : 'tree',
            children: {},
            item: index === parts.length - 1 ? item : null,
            size: index === parts.length - 1 ? item.size : 0,
            // Propager les informations de changement aux dossiers parents
            changeStatus: index === parts.length - 1 ? item.changeStatus : null,
            additions: index === parts.length - 1 ? item.additions : 0,
            deletions: index === parts.length - 1 ? item.deletions : 0
          };
        } else {
          // Si c'est un dossier, propager les changements des enfants
          if (index === parts.length - 1 && item.changeStatus) {
            current[part].changeStatus = item.changeStatus;
            current[part].additions = (current[part].additions || 0) + (item.additions || 0);
            current[part].deletions = (current[part].deletions || 0) + (item.deletions || 0);
          }
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
          // Dossiers en premier, puis fichiers, alphabétiquement
          if (a.type !== b.type) {
            return a.type === 'tree' ? -1 : 1;
          }
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
              if (node.type === 'tree' && hasChildren) {
                toggleFolder(node.path);
              } else if (node.type === 'blob' && node.item && node.changeStatus !== 'removed') {
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

            {/* Nom du fichier/dossier avec indicateur de changement */}
            <div className="flex-1 flex items-center space-x-2">
              <span className={`text-sm truncate ${
                node.type === 'tree' ? 'font-medium text-gray-200' : 'text-gray-300'
              } ${node.changeStatus === 'removed' ? 'line-through text-red-400' : ''} group-hover:text-white transition-colors`}>
                {node.name}
              </span>
              
              {/* Indicateur de changement */}
              {node.changeStatus && node.changeStatus !== 'unchanged' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  node.changeStatus === 'added' ? 'bg-green-500/20 text-green-400' :
                  node.changeStatus === 'modified' ? 'bg-yellow-500/20 text-yellow-400' :
                  node.changeStatus === 'removed' ? 'bg-red-500/20 text-red-400' :
                  node.changeStatus === 'renamed' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {node.changeStatus === 'added' ? '➕' :
                   node.changeStatus === 'modified' ? '✏️' :
                   node.changeStatus === 'removed' ? '🗑️' :
                   node.changeStatus === 'renamed' ? '🔄' : '•'}
                </span>
              )}
            </div>

            {/* Statistiques de changement */}
            {node.type === 'blob' && node.changeStatus && node.changeStatus !== 'unchanged' && (
              <div className="flex items-center space-x-1 text-xs">
                {node.additions > 0 && (
                  <span className="text-green-400">+{node.additions}</span>
                )}
                {node.deletions > 0 && (
                  <span className="text-red-400">-{node.deletions}</span>
                )}
              </div>
            )}

            {/* Taille du fichier (pas pour les fichiers supprimés) */}
            {node.type === 'blob' && node.size > 0 && node.changeStatus !== 'removed' && (
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
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📁</span>
            <h2 className="text-lg font-semibold text-white">Explorateur de Fichiers</h2>
          </div>
        </div>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher des fichiers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Chargement de l'arborescence...
          </div>
        ) : (
          <div className="p-4 max-h-full overflow-y-auto">
            {organizedTree.length > 0 ? (
              renderTree(organizedTree)
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <span className="text-2xl">📁</span>
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
