'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Sidebar({ activeView, onViewChange, user, selectedRepo, collapsed, onToggleCollapse, checkAndShowUpgrade }) {
  const menuItems = [
    {
      id: 'repos',
      name: 'Dépôts',
      icon: '📁',
      description: 'Parcourir vos dépôts GitHub',
      badge: null
    },
    {
      id: 'editor',
      name: 'Éditeur',
      icon: '💻',
      description: 'Éditer le code avec coloration syntaxique',
      badge: null
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: '📚',
      description: 'Générer et consulter la documentation',
      badge: 'PRO'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'Statistiques et métriques du projet',
      badge: 'PRO'
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      icon: '👥',
      description: 'Gérer l\'équipe et les permissions',
      badge: 'ENTERPRISE'
    },
    {
      id: 'search',
      name: 'Recherche',
      icon: '🔍',
      description: 'Recherche avancée dans le code',
      badge: 'PRO'
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration et préférences',
      badge: null
    }
  ];

  // Fonction pour gérer le clic sur un élément du menu
  const handleMenuClick = (itemId) => {
    // Vérifier si un upgrade est nécessaire
    if (checkAndShowUpgrade && checkAndShowUpgrade(itemId)) {
      return; // Arrêter ici si un upgrade est nécessaire
    }
    // Sinon, changer la vue normalement
    onViewChange(itemId);
  };

  // Vérifier si user existe
  if (!user) {
    return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
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

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" animate={false} />
            {!collapsed && (
              <div>
                <h2 className="text-white font-bold text-lg">gitShadow</h2>
                <p className="text-gray-400 text-xs">v2.0.0</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-gray-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user.name}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  user.plan === 'free' ? 'bg-gray-600 text-white' :
                  user.plan === 'pro' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' :
                  user.plan === 'enterprise' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' :
                  'bg-gray-600 text-white'
                }`}>
                  {user.plan === 'free' ? 'FREE' :
                   user.plan === 'pro' ? 'PRO' :
                   user.plan === 'enterprise' ? 'ENTERPRISE' :
                   user.plan.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Repository Info */}
      {selectedRepo && !collapsed && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-400 text-sm">📂</span>
              <span className="text-white text-sm font-medium truncate">{selectedRepo.name}</span>
            </div>
            {selectedRepo.description && (
              <p className="text-gray-400 text-xs line-clamp-2">{selectedRepo.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        item.badge === 'PRO' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' :
                        item.badge === 'ENTERPRISE' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-center">
            <p className="text-gray-400 text-xs">gitShadow v2.0.0</p>
            <p className="text-gray-500 text-xs mt-1">Powered by GitHub</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
