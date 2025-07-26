'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileIcon from './FileIcon';

export default function CodeEditorWithTree({ 
  file, 
  content, 
  onGenerateDoc, 
  loading, 
  theme,
  onBackToExplorer,
  onFileSelect,
  files = [],
  selectedRepo,
  user
}) {
  const [showTree, setShowTree] = useState(true);
  const [treeWidth, setTreeWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [wordWrap, setWordWrap] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [treeStructure, setTreeStructure] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const resizeRef = useRef(null);

  const getLanguageFromExtension = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript', 'jsx': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java',
      'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'php': 'php', 'rb': 'ruby', 'go': 'go',
      'rs': 'rust', 'swift': 'swift', 'kt': 'kotlin',
      'html': 'html', 'css': 'css', 'scss': 'scss',
      'json': 'json', 'xml': 'xml', 'yaml': 'yaml',
      'yml': 'yaml', 'md': 'markdown', 'sql': 'sql',
      'sh': 'bash', 'bash': 'bash', 'zsh': 'bash',
      'vue': 'vue', 'svelte': 'svelte'
    };
    return languageMap[ext] || 'text';
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

  // Charger la structure arborescente du commit quand le fichier est sélectionné
  useEffect(() => {
    if (file && file.path) {
      loadCommitTree();
    }
  }, [file]);

  const loadCommitTree = async () => {
    if (!file || !file.path || !selectedRepo || !user?.access_token) return;
    
    setLoadingTree(true);
    try {
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner?.login || selectedRepo.owner,
          repo: selectedRepo.name,
          accessToken: user.access_token
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTreeStructure(data.tree || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'arborescence du commit:', error);
    } finally {
      setLoadingTree(false);
    }
  };

  const renderTreeItem = (item, level = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const indent = level * 16;
    const isSelected = file?.path === item.path;
    const isFolder = item.isFolder || item.type === 'tree';

    if (isFolder) {
      
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
            <span className="text-gray-300 text-sm flex-1 truncate">{item.name}</span>
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
          key={path}
          className={`flex items-center py-1 px-2 rounded cursor-pointer ${
            isSelected 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
              : 'hover:bg-gray-700/50 text-gray-300'
          }`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => onFileSelect(item)}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.1 }}
        >
          <FileIcon 
            type="blob" 
            name={item.name} 
            size="sm" 
            className="mr-2"
          />
          <span className="text-sm flex-1 truncate">{item.name}</span>
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

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const handleDownload = () => {
    if (content && file) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun fichier sélectionné</h3>
          <p className="text-gray-400">Sélectionnez un fichier pour commencer l'édition</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full">
      {/* Panneau d'arborescence */}
      <AnimatePresence>
        {showTree && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: treeWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col"
            style={{ width: treeWidth }}
          >
            {/* Header de l'arborescence */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Explorateur</h3>
                <button
                  onClick={() => setShowTree(false)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={onBackToExplorer}
                className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                ← Retour à l'explorateur
              </button>
            </div>

            {/* Arborescence des fichiers */}
            <div className="flex-1 overflow-y-auto p-2">
              {loadingTree ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 text-sm">Chargement de l'arborescence...</p>
                </div>
              ) : treeStructure.length > 0 ? (
                <div className="space-y-1">
                  {treeStructure.map(item => renderTreeItem(item))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-400 text-sm">Aucun fichier disponible</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de redimensionnement */}
      {showTree && (
        <div
          ref={resizeRef}
          className="w-1 bg-gray-600 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={() => setIsResizing(true)}
        />
      )}

      {/* Éditeur principal */}
      <div className="flex-1 flex flex-col">
        {/* Header de l'éditeur */}
        <div className="bg-gray-800/50 border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {!showTree && (
                <button
                  onClick={() => setShowTree(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  📁
                </button>
              )}
              <div className="flex items-center space-x-2">
                <FileIcon type="blob" name={file.name} size="md" />
                <div>
                  <h2 className="text-lg font-semibold text-white">{file.name}</h2>
                  <p className="text-sm text-gray-400">{file.path}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLineNumbers(!lineNumbers)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  lineNumbers 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {lineNumbers ? 'Masquer' : 'Afficher'} lignes
              </button>
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  wordWrap 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Retour à la ligne
              </button>
            </div>
          </div>

          {/* Barre d'outils */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Ligne {cursorPosition.line}, Colonne {cursorPosition.column}</span>
              <span>•</span>
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{getLanguageFromExtension(file.name)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded-lg transition-colors"
              >
                📋 Copier
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded-lg transition-colors"
              >
                💾 Télécharger
              </button>
              <button
                onClick={onGenerateDoc}
                disabled={loading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    📖 Documenter
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Zone d'édition */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Chargement du fichier...</p>
              </div>
            </div>
          ) : content ? (
            <div className="h-full overflow-auto">
              <SyntaxHighlighter
                language={getLanguageFromExtension(file.name)}
                style={tomorrow}
                showLineNumbers={lineNumbers}
                wrapLines={wordWrap}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: 'transparent'
                }}
                lineNumberStyle={{
                  color: '#6b7280',
                  marginRight: '1rem'
                }}
              >
                {content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-gray-400">Contenu du fichier non disponible</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 