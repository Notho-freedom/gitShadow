'use client';

import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark, tomorrow, dracula, oneDark, materialDark, nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MediaViewer from './MediaViewer';

export default function CodeViewer({ file, content, loading, repo, commit }) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [theme, setTheme] = useState('nightOwl');
  const [showMinimap, setShowMinimap] = useState(false);

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
    nightOwl,
    atomOneDark,
    tomorrow,
    dracula,
    oneDark,
    materialDark
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
    <div className="h-full flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden code-editor">
      {/* En-tête du fichier */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
      </div>

      {/* Barre d'outils */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          {/* Sélecteur de thème */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent btn-code"
          >
            <option value="nightOwl">Night Owl</option>
            <option value="atomOneDark">Atom Dark</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="dracula">Dracula</option>
            <option value="oneDark">One Dark</option>
            <option value="materialDark">Material Dark</option>
          </select>

          {/* Taille de police */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent btn-code"
          >
            <option value="xs">Très petit</option>
            <option value="sm">Petit</option>
            <option value="base">Normal</option>
            <option value="lg">Grand</option>
            <option value="xl">Très grand</option>
            <option value="2xl">Énorme</option>
          </select>

          {/* Numérotation des lignes */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`px-3 py-1.5 rounded text-sm transition-colors btn-code ${
              showLineNumbers 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Numéros
          </button>

          {/* Retour à la ligne */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`px-3 py-1.5 rounded text-sm transition-colors btn-code ${
              wrapLines 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Retour ligne
          </button>

          {/* Minimap */}
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`px-3 py-1.5 rounded text-sm transition-colors btn-code ${
              showMinimap 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Minimap
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors flex items-center space-x-1 btn-code"
          >
            <span>📋</span>
            <span>Copier</span>
          </button>

          <button
            onClick={downloadFile}
            className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-sm transition-colors flex items-center space-x-1 btn-code"
          >
            <span>💾</span>
            <span>Télécharger</span>
          </button>
        </div>
      </div>

      {/* Contenu du fichier */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Chargement du fichier...</p>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <div className="h-full overflow-auto scrollbar-thin">
              <SyntaxHighlighter
                language={language}
                style={themes[theme]}
                showLineNumbers={showLineNumbers}
                wrapLines={wrapLines}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  backgroundColor: 'transparent',
                  fontSize: fontSize === 'xs' ? '0.75rem' : 
                           fontSize === 'sm' ? '0.875rem' : 
                           fontSize === 'base' ? '1rem' : 
                           fontSize === 'lg' ? '1.125rem' : 
                           fontSize === 'xl' ? '1.25rem' : '1.5rem',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }}
                lineNumberStyle={{
                  color: '#6b7280',
                  minWidth: '3.5em',
                  paddingRight: '1em',
                  textAlign: 'right',
                  userSelect: 'none'
                }}
                lineProps={{
                  style: {
                    padding: '0 0.5rem',
                    borderLeft: '2px solid transparent'
                  }
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'inherit',
                    fontSize: 'inherit'
                  }
                }}
              >
                {content}
              </SyntaxHighlighter>
            </div>

            {/* Minimap */}
            {showMinimap && (
              <div className="absolute top-4 right-4 w-32 h-48 bg-gray-800/80 rounded border border-gray-600 overflow-hidden minimap">
                <div className="text-xs text-gray-400 p-2 border-b border-gray-600">Minimap</div>
                <div className="p-2 text-xs text-gray-500 font-mono leading-tight">
                  {content.split('\n').slice(0, 20).map((line, i) => (
                    <div key={i} className="truncate">
                      {line.substring(0, 30)}
                    </div>
                  ))}
                  {content.split('\n').length > 20 && (
                    <div className="text-gray-600">...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer avec statistiques */}
      {fileStats && !loading && (
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-6">
              <span>Lignes: {fileStats.lines}</span>
              <span>Code: {fileStats.codeLines}</span>
              <span>Commentaires: {fileStats.commentLines}</span>
              <span>Vides: {fileStats.emptyLines}</span>
            </div>
            <div className="flex items-center space-x-6">
              <span>Mots: {fileStats.words}</span>
              <span>Caractères: {fileStats.chars}</span>
              <span>Taille: {formatSize(fileStats.size)}</span>
              <span>Encodage: UTF-8</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
