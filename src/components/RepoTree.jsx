'use client';

import { useState, useMemo } from 'react';

export default function RepoTree({ repoTree = [], searchQuery = '', onSelectFile, selectedFile }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

  // Fonction pour trier les éléments : dossiers en premier, puis fichiers
  const sortTreeItems = (items) => {
    return items.sort((a, b) => {
      // Dossiers en premier
      if (a.type === 'tree' && b.type !== 'tree') return -1;
      if (a.type !== 'tree' && b.type === 'tree') return 1;
      
      // Si les deux sont du même type, trier par nom
      return a.name.localeCompare(b.name);
    });
  };

  // Organiser les fichiers en structure d'arbre
  const organizedTree = useMemo(() => {
    if (!repoTree.length) return [];

    const tree = {};
    const filteredFiles = repoTree.filter(item => 
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
            type: index === parts.length - 1 ? item.type : 'tree',
            children: {},
            item: index === parts.length - 1 ? item : null
          };
        }
        current = current[part].children;
      });
    });

    const convertToArray = (obj) => {
      const array = Object.values(obj).map(node => ({
        ...node,
        children: Object.keys(node.children).length > 0 ? convertToArray(node.children) : []
      }));
      
      // Trier les éléments : dossiers en premier
      return sortTreeItems(array);
    };

    return convertToArray(tree);
  }, [repoTree, searchQuery]);

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
      'svelte': '🧡'
    };
    return iconMap[ext] || '📄';
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedFile?.path === node.path;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node.path} className="select-none">
          <div
            className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-all duration-150
              ${isSelected ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-muted/50'}
              ${level > 0 ? `ml-${Math.min(level * 4, 16)}` : ''}`}
            onClick={() => {
              if (node.type === 'tree' && hasChildren) {
                toggleFolder(node.path);
              } else if (node.type === 'blob' && node.item) {
                onSelectFile(node.item);
              }
            }}
          >
            {/* Indicateur d'expansion pour les dossiers */}
            <span className="w-4 h-4 flex items-center justify-center mr-2 text-xs">
              {node.type === 'tree' && hasChildren ? (
                isExpanded ? '📂' : '📁'
              ) : (
                getFileIcon(node.name)
              )}
            </span>

            {/* Nom du fichier/dossier */}
            <span className={`flex-1 text-sm truncate ${
              node.type === 'tree' ? 'font-medium' : ''
            }`}>
              {node.name}
            </span>

            {/* Indicateur de sélection */}
            {isSelected && (
              <span className="w-2 h-2 bg-primary rounded-full ml-2" />
            )}
          </div>

          {/* Enfants (récursif) */}
          {node.type === 'tree' && hasChildren && isExpanded && (
            <div className="ml-2 border-l border-border/30 pl-2">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!repoTree.length) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Aucun dépôt chargé
        </p>
      </div>
    );
  }

  const filteredCount = organizedTree.length;
  const totalCount = repoTree.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Arborescence
        </h3>
        <span className="text-xs text-muted-foreground">
          {searchQuery ? `${filteredCount} résultats` : `${totalCount} fichiers`}
        </span>
      </div>

      <div className="bg-card border border-border rounded-lg p-3 max-h-96 overflow-y-auto">
        {organizedTree.length > 0 ? (
          <div className="space-y-1">
            {renderTree(organizedTree)}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-2xl mb-2 block">🔍</span>
            <p className="text-sm text-muted-foreground">
              Aucun fichier trouvé pour "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Total des fichiers:</span>
          <span className="font-mono">{totalCount}</span>
        </div>
        {searchQuery && (
          <div className="flex justify-between">
            <span>Résultats filtrés:</span>
            <span className="font-mono">{filteredCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
