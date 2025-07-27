'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function QuickActions({ activeView, selectedFile, onGenerateDoc, loading, checkAndShowUpgrade }) {
  const actions = [
    {
      id: 'search',
      label: 'Recherche',
      icon: '🔍',
      shortcut: 'Ctrl+K',
      action: () => {
        if (checkAndShowUpgrade && checkAndShowUpgrade('search')) {
          return;
        }
        console.log('Search');
      },
      requiresUpgrade: 'search'
    },
    {
      id: 'generate-doc',
      label: 'Documenter',
      icon: '📝',
      shortcut: 'Ctrl+D',
      action: () => {
        if (checkAndShowUpgrade && checkAndShowUpgrade('documentation')) {
          return;
        }
        onGenerateDoc();
      },
      disabled: !selectedFile || loading,
      requiresUpgrade: 'documentation'
    },
    {
      id: 'format',
      label: 'Formater',
      icon: '✨',
      shortcut: 'Ctrl+Shift+F',
      action: () => {
        if (checkAndShowUpgrade && checkAndShowUpgrade('format')) {
          return;
        }
        console.log('Format');
      },
      disabled: !selectedFile,
      requiresUpgrade: 'format'
    },
    {
      id: 'save',
      label: 'Sauvegarder',
      icon: '💾',
      shortcut: 'Ctrl+S',
      action: () => console.log('Save'),
      disabled: !selectedFile
    },
    {
      id: 'share',
      label: 'Partager',
      icon: '📤',
      shortcut: 'Ctrl+Shift+S',
      action: () => {
        if (checkAndShowUpgrade && checkAndShowUpgrade('share')) {
          return;
        }
        console.log('Share');
      },
      disabled: !selectedFile,
      requiresUpgrade: 'share'
    }
  ];

  return (
    <AnimatePresence>
      {activeView === 'editor' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl p-2">
            <div className="flex flex-col space-y-2">
              {actions.map((action) => (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`relative group p-3 rounded-xl transition-all duration-200 ${
                    action.disabled 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-300 hover:text-white hover:bg-blue-500/20'
                  }`}
                  title={`${action.label} (${action.shortcut})`}
                >
                  <span className="text-xl">{action.icon}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {action.label}
                      <span className="ml-2 text-gray-400 text-xs">{action.shortcut}</span>
                    </div>
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 