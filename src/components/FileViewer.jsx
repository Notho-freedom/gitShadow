'use client';

import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function FileViewer({ file, content, loading }) {
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
      'svelte': 'svelte'
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
    
    return { lines: lines.length, chars, words, size };
  }, [content]);

  // Formatage de la taille
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!file) {
    return (
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun fichier sélectionné</h3>
          <p className="text-muted-foreground">
            Sélectionnez un fichier dans l'arborescence pour voir son contenu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête du fichier */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">📄</span>
              <div>
                <h2 className="text-lg font-semibold">{file.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">{file.path}</p>
              </div>
            </div>
            
            {/* Badges */}
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                {getLanguage(file.name)}
              </span>
              {fileStats && (
                <>
                  <span className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full">
                    {fileStats.lines} lignes
                  </span>
                  <span className="px-2 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full">
                    {formatSize(fileStats.size)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(content)}
              className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              Copier
            </button>
            {file.html_url && (
              <a
                href={file.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
              >
                Voir sur GitHub
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contenu du fichier */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Contenu du fichier</span>
            {fileStats && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>{fileStats.lines} lignes</span>
                <span>{fileStats.words} mots</span>
                <span>{fileStats.chars} caractères</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground">Chargement du fichier...</span>
              </div>
            </div>
          ) : content ? (
            <div className="overflow-auto max-h-96">
              <SyntaxHighlighter
                language={getLanguage(file.name)}
                style={oneDark}
                showLineNumbers
                customStyle={{
                  fontSize: '0.95em',
                  background: 'transparent',
                  margin: 0,
                  padding: '1.25rem',
                  borderRadius: 0,
                  lineHeight: '1.7',
                  fontFamily: 'JetBrains Mono, Fira Mono, monospace',
                }}
                lineNumberStyle={{ color: '#888', marginRight: '16px' }}
                wrapLongLines
              >
                {content}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">⚠️</span>
              <p className="text-muted-foreground">
                Impossible de charger le contenu du fichier
              </p>
            </div>
          )}

          {/* Indicateur de défilement */}
          {content && content.split('\n').length > 20 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-muted-foreground">
              Défilez pour voir plus
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
