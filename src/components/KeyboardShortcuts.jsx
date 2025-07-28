'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KeyboardShortcuts({ onShortcut }) {
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const shortcuts = [
    {
      key: 'Ctrl+R',
      description: 'Aller aux dépôts',
      action: 'repos'
    },
    {
      key: 'Ctrl+E',
      description: 'Ouvrir l\'explorateur',
      action: 'explorer'
    },
    {
      key: 'Ctrl+D',
      description: 'Ouvrir l\'éditeur',
      action: 'editor'
    },
    {
      key: 'Ctrl+K',
      description: 'Générer la documentation',
      action: 'documentation'
    },
    {
      key: 'Ctrl+A',
      description: 'Ouvrir les analytics',
      action: 'analytics'
    },
    {
      key: 'Ctrl+L',
      description: 'Ouvrir la collaboration',
      action: 'collaboration'
    },
    {
      key: 'Ctrl+,',
      description: 'Ouvrir les paramètres',
      action: 'settings'
    },
    {
      key: 'Ctrl+F',
      description: 'Rechercher',
      action: 'search'
    },
    {
      key: 'Ctrl+N',
      description: 'Nouveau fichier',
      action: 'new-file'
    },
    {
      key: 'Ctrl+S',
      description: 'Sauvegarder',
      action: 'save'
    },
    {
      key: 'Ctrl+/',
      description: 'Afficher l\'aide',
      action: 'help'
    },
    {
      key: 'Escape',
      description: 'Fermer les modales',
      action: 'escape'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // Mettre à jour les touches pressées
      const newPressedKeys = new Set(pressedKeys);
      if (isCtrl) newPressedKeys.add('ctrl');
      if (isShift) newPressedKeys.add('shift');
      if (isAlt) newPressedKeys.add('alt');
      newPressedKeys.add(key);
      setPressedKeys(newPressedKeys);

      // Construire la combinaison de touches
      let keyCombo = '';
      if (isCtrl) keyCombo += 'Ctrl+';
      if (isShift) keyCombo += 'Shift+';
      if (isAlt) keyCombo += 'Alt+';
      keyCombo += key.toUpperCase();

      // Trouver le raccourci correspondant
      const shortcut = shortcuts.find(s => s.key === keyCombo);
      if (shortcut) {
        e.preventDefault();
        onShortcut?.(shortcut.action);
      }

      // Gestion spéciale pour l'aide
      if (keyCombo === 'Ctrl+/') {
        e.preventDefault();
        setShowHelp(prev => !prev);
      }

      // Gestion de l'échappement
      if (key === 'escape') {
        setShowHelp(false);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      const newPressedKeys = new Set(pressedKeys);
      
      if (!e.ctrlKey && !e.metaKey) newPressedKeys.delete('ctrl');
      if (!e.shiftKey) newPressedKeys.delete('shift');
      if (!e.altKey) newPressedKeys.delete('alt');
      newPressedKeys.delete(key);
      
      setPressedKeys(newPressedKeys);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, shortcuts, onShortcut]);

  return (
    <>
      {/* Indicateur de touches pressées */}
      {pressedKeys.size > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-xl z-50"
        >
          <div className="flex items-center space-x-2">
            {Array.from(pressedKeys).map((key, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded font-mono"
              >
                {key.toUpperCase()}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal d'aide */}
      <AnimatePresence>
        {showHelp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⌨️</span>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Raccourcis clavier</h3>
                      <p className="text-gray-400 text-sm">Maîtrisez votre productivité</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowHelp(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={shortcut.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <span className="text-gray-300 text-sm">{shortcut.description}</span>
                      <span className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded font-mono">
                        {shortcut.key}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-2">💡 Conseils</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Utilisez <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+/</kbd> pour afficher cette aide</li>
                    <li>• Les raccourcis fonctionnent dans tous les contextes</li>
                    <li>• Appuyez sur <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Escape</kbd> pour fermer les modales</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{shortcuts.length} raccourcis disponibles</span>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 