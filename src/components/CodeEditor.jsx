'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeEditor({ file, content, onGenerateDoc, loading, theme }) {
  const [code, setCode] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setCode(content);
  }, [content]);

  const getLanguageFromFilename = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'zsh': 'bash',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore'
    };
    return languageMap[ext] || 'text';
  };

  const handleTextChange = (e) => {
    setCode(e.target.value);
    updateCursorPosition(e.target);
  };

  const updateCursorPosition = (element) => {
    const { selectionStart } = element;
    const lines = element.value.substring(0, selectionStart).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    setCursorPosition({ line, column });
  };

  const handleSelectionChange = (e) => {
    const { selectionStart, selectionEnd } = e.target;
    if (selectionStart !== selectionEnd) {
      setSelectedText(e.target.value.substring(selectionStart, selectionEnd));
    } else {
      setSelectedText('');
    }
  };

  const handleKeyDown = (e) => {
    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const { selectionStart, value } = e.target;
      const lines = value.substring(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^\s*/)[0];
      
      if (currentLine.trim().endsWith('{')) {
        e.preventDefault();
        const newIndent = indent + '  ';
        const newValue = value.substring(0, selectionStart) + '\n' + newIndent + '\n' + indent + '}';
        setCode(newValue);
        setTimeout(() => {
          e.target.setSelectionRange(selectionStart + 1 + newIndent.length, selectionStart + 1 + newIndent.length);
        }, 0);
      }
    }

    // Save with Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Implémentation de la sauvegarde
      if (onSave) {
        onSave(code);
      }
    }

    // Find with Ctrl+F
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      // Implémentation de la recherche
      if (onFind) {
        onFind();
      }
    }
  };

  const formatCode = () => {
    // Implémentation du formatage de code
    if (onFormat) {
      onFormat(code);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name || 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = () => {
    const ext = file?.name?.split('.').pop()?.toLowerCase();
    const iconMap = {
      'js': '⚛️',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '📘',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'html': '🌐',
      'css': '🎨',
      'json': '📄',
      'md': '📝',
      'sql': '🗄️',
      'sh': '💻',
      'dockerfile': '🐳'
    };
    return iconMap[ext] || '📄';
  };

  const lines = code.split('\n');
  const language = getLanguageFromFilename(file?.name);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getFileIcon()}</span>
          <div>
            <h3 className="text-white font-medium">{file?.name || 'Untitled'}</h3>
            <p className="text-xs text-gray-400">{language} • {lines.length} lignes</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Cursor Position */}
          <div className="px-3 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </div>

          {/* Editor Controls */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Afficher/masquer les numéros de ligne"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWordWrap(!wordWrap)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Retour à la ligne automatique"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={formatCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Formater le code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Copier le code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadFile}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Télécharger le fichier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGenerateDoc}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            title="Générer la documentation"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="text-sm font-medium">Documenter</span>
          </motion.button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div className="w-16 bg-gray-800/50 border-r border-gray-700 text-right text-xs text-gray-500 font-mono py-4 select-none">
              {lines.map((_, index) => (
                <div key={index} className="px-2 py-0.5">
                  {index + 1}
                </div>
              ))}
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleTextChange}
              onSelect={handleSelectionChange}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none font-mono text-sm leading-6 p-4"
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                overflowWrap: wordWrap ? 'break-word' : 'normal'
              }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
            
            {/* Syntax Highlighting Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-auto">
              <SyntaxHighlighter
                language={language}
                style={tomorrow}
                customStyle={{
                  background: 'transparent',
                  padding: '1rem',
                  margin: 0,
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.5',
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                  overflowWrap: wordWrap ? 'break-word' : 'normal'
                }}
                showLineNumbers={false}
                wrapLines={true}
                lineNumberStyle={{ display: 'none' }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Footer */}
      <div className="px-4 py-2 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>{language.toUpperCase()}</span>
          <span>{lines.length} lignes</span>
          <span>{code.length} caractères</span>
          {selectedText && <span>{selectedText.length} sélectionnés</span>}
        </div>
        
        <div className="flex items-center space-x-2">
          <span>UTF-8</span>
          <span>LF</span>
          <span>{fontSize}px</span>
        </div>
      </div>
    </div>
  );
} 