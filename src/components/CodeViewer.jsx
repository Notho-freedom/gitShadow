'use client';

import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, tomorrow, dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MediaViewer from './MediaViewer';

export default function CodeViewer({ file, content, loading, repo, commit }) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [fontSize, setFontSize] = useState('sm');
  const [theme, setTheme] = useState('atomOneDark');

  // Détection du langage pour la coloration syntaxique
  const getLanguage = (filename) => {
    if (!filename) return 'text';
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'html': 'html',
      'htm': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
      'vue': 'vue',
      'svelte': 'svelte',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'svg': 'svg',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'fish': 'bash',
      'ps1': 'powershell',
      'psm1': 'powershell',
      'dockerfile': 'dockerfile',
      'docker': 'dockerfile',
      'gitignore': 'gitignore',
      'gitattributes': 'gitattributes',
      'env': 'env',
      'toml': 'toml',
      'ini': 'ini',
      'cfg': 'ini',
      'conf': 'ini',
      'lock': 'json',
      'log': 'text',
      'txt': 'text'
    };
    return langMap[ext] || 'text';
  };

  // Détection du type de fichier pour la prévisualisation
  const getFileType = (filename) => {
    if (!filename) return 'text';
    const ext = filename.split('.').pop()?.toLowerCase();
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(ext)) {
      return 'image';
    }
    
    // Vidéos
    if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv'].includes(ext)) {
      return 'video';
    }
    
    // Audio
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) {
      return 'audio';
    }
    
    // PDF
    if (ext === 'pdf') {
      return 'pdf';
    }
    
    // Documents Office
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
      return 'office';
    }
    
    // Code et autres fichiers texte
    return 'code';
  };

  // Statistiques du fichier
  const fileStats = useMemo(() => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const chars = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const size = new Blob([content]).size;
    
    // Analyse basique du code
    const emptyLines = lines.filter(line => line.trim() === '').length;
    const codeLines = lines.length - emptyLines;
    const commentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('#') || 
             trimmed.startsWith('/*') || trimmed.startsWith('*') ||
             trimmed.startsWith('<!--') || trimmed.startsWith('--');
    }).length;
    
    return { 
      lines: lines.length, 
      chars, 
      words, 
      size, 
      emptyLines, 
      codeLines, 
      commentLines 
    };
  }, [content]);

  // Formatage de la taille
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Thèmes disponibles
  const themes = {
    atomOneDark,
    tomorrow,
    dracula
  };

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  const downloadFile = () => {
    if (!content || !file) return;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!file) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white">Aucun fichier sélectionné</h3>
          <p className="text-gray-400">
            Sélectionnez un fichier dans l'arborescence pour voir son contenu
          </p>
        </div>
      </div>
    );
  }

  const fileType = getFileType(file.name);
  const language = getLanguage(file.name);

  // Si c'est un fichier média, utiliser le MediaViewer
  if (fileType !== 'code') {
    return <MediaViewer file={file} repo={repo} commit={commit} />;
  }

  return (
    <div className="space-y-4">
      {/* En-tête du fichier */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">📝</span>
              <div>
                <h2 className="text-lg font-semibold text-white">{file.name}</h2>
                <p className="text-sm text-gray-400 font-mono">{file.path}</p>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                {language}
              </span>
              {fileStats && (
                <>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {fileStats.lines} lignes
                  </span>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                    {formatSize(fileStats.size)}
                  </span>
                  {fileStats.codeLines > 0 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {fileStats.codeLines} lignes de code
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center space-x-2">
            {/* Sélecteur de thème */}
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="atomOneDark">Atom Dark</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="dracula">Dracula</option>
            </select>

            {/* Taille de police */}
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="xs">Très petit</option>
              <option value="sm">Petit</option>
              <option value="base">Normal</option>
              <option value="lg">Grand</option>
              <option value="xl">Très grand</option>
            </select>

            {/* Numérotation des lignes */}
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                showLineNumbers 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Lignes
            </button>

            {/* Retour à la ligne */}
            <button
              onClick={() => setWrapLines(!wrapLines)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                wrapLines 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Wrap
            </button>

            {/* Copier */}
            <button
              onClick={copyToClipboard}
              className="px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              📋
            </button>

            {/* Télécharger */}
            <button
              onClick={downloadFile}
              className="px-2 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              💾
            </button>
          </div>
        </div>
      </div>

      {/* Contenu du fichier */}
      {loading ? (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div className={`text-${fontSize}`}>
            <SyntaxHighlighter
              language={language}
              style={themes[theme]}
              showLineNumbers={showLineNumbers}
              wrapLines={wrapLines}
              customStyle={{
                margin: 0,
                padding: '1rem',
                backgroundColor: 'transparent',
                fontSize: fontSize === 'xs' ? '0.75rem' : 
                         fontSize === 'sm' ? '0.875rem' : 
                         fontSize === 'base' ? '1rem' : 
                         fontSize === 'lg' ? '1.125rem' : '1.25rem'
              }}
              lineNumberStyle={{
                color: '#6b7280',
                minWidth: '3em'
              }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
}
