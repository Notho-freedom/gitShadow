'use client';

import { useMemo, useState } from 'react';

export default function CodeViewer({ file, content, loading, repo, commit }) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);
  const [fontSize, setFontSize] = useState('sm');

  // Détection du langage pour la coloration syntaxique basique
  const getLanguage = (filename) => {
    if (!filename) return 'text';
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'vue': 'vue',
      'svelte': 'svelte',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext] || 'text';
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
             trimmed.startsWith('<!--');
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

  // Numérotation des lignes
  const numberedContent = useMemo(() => {
    if (!content || !showLineNumbers) return content;
    return content.split('\n').map((line, index) => 
      `${(index + 1).toString().padStart(4, ' ')} │ ${line}`
    ).join('\n');
  }, [content, showLineNumbers]);

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
      <div className="h-full bg-gray-800/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun fichier sélectionné</h3>
          <p className="text-gray-400">
            Sélectionnez un fichier dans l'explorateur pour voir son contenu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800/30">
      {/* Header avec onglet */}
      <div className="border-b border-gray-700">
        {/* Onglet du fichier */}
        <div className="flex items-center bg-gray-700/50 border-b border-gray-600">
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border-r border-gray-600">
            <span className="text-lg">{file.type === 'file' ? '📄' : '📁'}</span>
            <span className="text-white text-sm font-medium">{file.path.split('/').pop()}</span>
            <button className="text-gray-400 hover:text-white ml-2">×</button>
          </div>
        </div>

        {/* Barre d'outils */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50">
          <div className="flex items-center space-x-4">
            {/* Info du fichier */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{file.type === 'file' ? '📄' : '📁'}</span>
              <div>
                <h2 className="text-white font-medium">{file.path.split('/').pop()}</h2>
                <p className="text-gray-400 text-xs font-mono">{file.path}</p>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                {getLanguage(file.path)}
              </span>
              {fileStats && (
                <>
                  <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                    {fileStats.lines} lignes
                  </span>
                  <span className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full">
                    {formatSize(fileStats.size)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Options d'affichage */}
            <div className="flex items-center space-x-2 mr-4">
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  showLineNumbers ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Numéros
              </button>
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  wrapLines ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Retour ligne
              </button>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="xs">Très petit</option>
                <option value="sm">Petit</option>
                <option value="base">Normal</option>
                <option value="lg">Grand</option>
              </select>
            </div>

            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 text-xs bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Copier
            </button>
            <button
              onClick={downloadFile}
              className="px-3 py-1.5 text-xs bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded transition-colors"
            >
              Télécharger
            </button>
            {repo && commit && (
              <a
                href={`https://github.com/${repo.full_name}/blob/${commit.sha}/${file.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Voir sur GitHub
              </a>
            )}
          </div>
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
        ) : content ? (
          <div className="h-full overflow-auto">
            <pre className={`p-4 text-${fontSize} font-mono leading-relaxed text-gray-300 bg-gray-900/50 h-full ${
              wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}>
              <code className={`language-${getLanguage(file.path)}`}>
                {showLineNumbers ? numberedContent : content}
              </code>
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <p className="text-gray-400">
                Impossible de charger le contenu du fichier
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec statistiques */}
      {fileStats && !loading && (
        <div className="border-t border-gray-700 px-4 py-2 bg-gray-800/50">
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
