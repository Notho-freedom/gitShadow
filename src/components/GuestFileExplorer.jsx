'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FileIcon from './FileIcon';

export default function GuestFileExplorer({ files, onFileSelect, selectedFile, loading }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderPath = (filePath) => {
    const parts = filePath.split('/');
    return parts.slice(0, -1).join('/');
  };

  const getFileName = (filePath) => {
    return filePath.split('/').pop();
  };

  const isFolder = (file) => {
    return file.type === 'tree' || file.type === 'dir' || file.mode === '040000';
  };

  const isFile = (file) => {
    return file.type === 'blob' || file.type === 'file' || file.mode === '100644' || file.mode === '100755';
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filteredFiles = files.filter(file => {
    if (!searchQuery) return true;
    return file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
           file.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const groupedFiles = filteredFiles.reduce((acc, file) => {
    const folderPath = getFolderPath(file.path);
    if (!acc[folderPath]) {
      acc[folderPath] = [];
    }
    acc[folderPath].push(file);
    return acc;
  }, {});

  // Trier les fichiers : dossiers d'abord, puis fichiers
  Object.keys(groupedFiles).forEach(folderPath => {
    groupedFiles[folderPath].sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);
      
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      
      return a.name.localeCompare(b.name);
    });
  });

  const renderFile = (file) => (
    <motion.div
      key={file.path}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 5 }}
      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
        selectedFile?.path === file.path
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'hover:bg-white/5'
      }`}
      onClick={() => onFileSelect(file)}
    >
      <FileIcon filename={file.name} type={file.type} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{file.name}</div>
        {file.size && (
          <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
        )}
      </div>
    </motion.div>
  );

  const renderFolder = (folderPath, folderFiles) => {
    const folderName = folderPath.split('/').pop() || 'Root';
    const isExpanded = expandedFolders.has(folderPath);
    const folderCount = folderFiles.filter(file => isFolder(file)).length;
    const fileCount = folderFiles.filter(file => isFile(file)).length;

    return (
      <div key={folderPath} className="mb-2">
        <div
          className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => toggleFolder(folderPath)}
        >
          <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="text-sm text-white font-medium">{folderName}</span>
          <span className="text-xs text-gray-400">
            ({folderCount} dossier{folderCount > 1 ? 's' : ''}, {fileCount} fichier{fileCount > 1 ? 's' : ''})
          </span>
        </div>
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 space-y-1"
          >
            {folderFiles.map(file => renderFile(file))}
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Chargement des fichiers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un fichier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Files List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Object.keys(groupedFiles).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'Aucun fichier trouvé' : 'Aucun fichier disponible'}
          </div>
        ) : (
          Object.entries(groupedFiles).map(([folderPath, folderFiles]) => 
            renderFolder(folderPath, folderFiles)
          )
        )}
      </div>
    </div>
  );
} 