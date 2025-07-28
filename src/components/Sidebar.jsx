'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import UserStats from './UserStats';

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  user, 
  selectedRepo, 
  collapsed, 
  onToggleCollapse,
  notifications = [],
  onQuickAction
}) {
  const sidebarRef = useRef(null);

  const menuItems = [
    {
      id: 'repos',
      name: 'Dépôts',
      icon: '📁',
      description: 'Parcourir vos dépôts GitHub',
      badge: null,
      shortcut: 'Ctrl+R',
      color: 'blue'
    },
    {
      id: 'explorer',
      name: 'Explorateur',
      icon: '🔍',
      description: 'Explorer la structure des fichiers',
      badge: null,
      shortcut: 'Ctrl+E',
      color: 'green'
    },
    {
      id: 'editor',
      name: 'Éditeur',
      icon: '💻',
      description: 'Éditer le code avec coloration syntaxique',
      badge: null,
      shortcut: 'Ctrl+D',
      color: 'purple'
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: '📚',
      description: 'Générer et consulter la documentation',
      badge: null,
      shortcut: 'Ctrl+K',
      color: 'orange'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'Statistiques et métriques du projet',
      badge: null,
      shortcut: 'Ctrl+A',
      color: 'cyan'
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      icon: '👥',
      description: 'Gérer l\'équipe et les permissions',
      badge: null,
      shortcut: 'Ctrl+L',
      color: 'pink'
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration et préférences',
      badge: null,
      shortcut: 'Ctrl+,',
      color: 'gray'
    }
  ];

  const quickActions = [
    {
      id: 'search',
      name: 'Recherche',
      icon: '🔎',
      description: 'Rechercher dans le code',
      shortcut: 'Ctrl+F'
    },
    {
      id: 'new-file',
      name: 'Nouveau fichier',
      icon: '📄',
      description: 'Créer un nouveau fichier',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'save',
      name: 'Sauvegarder',
      icon: '💾',
      description: 'Sauvegarder les modifications',
      shortcut: 'Ctrl+S'
    }
  ];

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const item = menuItems.find(item => item.shortcut === `${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}`);
        if (item) {
          e.preventDefault();
          onViewChange(item.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuItems, onViewChange]);

  // Vérifier si user existe
  if (!user) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <Logo size="md" animate={false} />
            <div>
              <h2 className="text-white font-bold text-lg">gitShadow</h2>
              <p className="text-gray-400 text-xs">v2.0.0</p>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const getColorClasses = (color, isActive = false) => {
    const colorMap = {
      blue: isActive ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'hover:bg-blue-500/10',
      green: isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'hover:bg-green-500/10',
      purple: isActive ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'hover:bg-purple-500/10',
      orange: isActive ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'hover:bg-orange-500/10',
      cyan: isActive ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'hover:bg-cyan-500/10',
      pink: isActive ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'hover:bg-pink-500/10',
      gray: isActive ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'hover:bg-gray-500/10'
    };
    return colorMap[color] || colorMap.gray;
  };

  return (
    <>
      <motion.div
        ref={sidebarRef}
        initial={false}
        className="bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col relative h-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size="md" animate={false} />
              <div>
                <h2 className="text-white font-bold text-lg">gitShadow</h2>
                <p className="text-gray-400 text-xs">v2.0.0</p>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Redimensionner la sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* User Info */}
        <motion.div 
          className="p-4 border-b border-gray-700/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <motion.img 
              src={user.avatar_url} 
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-gray-600"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-sm truncate">@{user.login}</p>
            </div>
          </div>
        </motion.div>

        {/* Repository Info */}
        {selectedRepo && (
          <motion.div 
            className="p-4 border-b border-gray-700/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="bg-gray-700/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">📁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{selectedRepo.name}</p>
                  <p className="text-gray-400 text-xs truncate">{selectedRepo.owner?.login || selectedRepo.owner}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>⭐ {selectedRepo.stargazers_count || 0}</span>
                <span>🔄 {selectedRepo.forks_count || 0}</span>
                <span>👀 {selectedRepo.watchers_count || 0}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ 
                  scale: 1.02, 
                  x: 5,
                  backgroundColor: undefined
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 relative ${
                  activeView === item.id
                    ? `bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg ${getColorClasses(item.color, true)}`
                    : `text-gray-300 hover:text-white ${getColorClasses(item.color)}`
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.badge && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                    {item.shortcut}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="pt-6 border-t border-gray-700/50"
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Actions rapides
            </h3>
            <div className="space-y-1">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickAction?.(action.id)}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50"
                >
                  <span className="text-lg">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{action.name}</p>
                    <p className="text-xs text-gray-400 truncate">{action.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                    {action.shortcut}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </nav>

        {/* User Stats */}
        <UserStats 
          user={user} 
          selectedRepo={selectedRepo} 
          collapsed={false} 
        />

        {/* Footer avec options */}
        <motion.div 
          className="p-4 border-t border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Plan actuel</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                (user.plan || 'free') === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                (user.plan || 'free') === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {(user.plan || 'free') === 'free' ? 'Gratuit' : 
                 (user.plan || 'free') === 'pro' ? 'Pro' : 'Enterprise'}
              </span>
            </div>
            {(user.plan || 'free') === 'free' && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all duration-200 font-medium"
              >
                Passer au Pro
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
