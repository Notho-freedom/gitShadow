'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Sidebar({ activeView, onViewChange, user, selectedRepo, collapsed, onToggleCollapse }) {
          const menuItems = [
          {
            id: 'repos',
            name: 'Dépôts',
            icon: '📁',
            description: 'Parcourir vos dépôts GitHub'
          },
    {
      id: 'editor',
      name: 'Éditeur',
      icon: '💻',
      description: 'Éditer le code avec coloration syntaxique'
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: '📚',
      description: 'Générer et consulter la documentation'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'Statistiques et métriques du projet'
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      icon: '👥',
      description: 'Gérer l\'équipe et les permissions'
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration et préférences'
    }
  ];

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
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-gray-400 text-sm truncate">@{user.login}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activeView === item.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
            title={collapsed ? item.description : undefined}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-400 truncate">{item.description}</p>
              </div>
            )}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700/50">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Plan actuel</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {user.plan === 'free' ? 'Gratuit' : 
                 user.plan === 'pro' ? 'Pro' : 'Enterprise'}
              </span>
            </div>
            {user.plan === 'free' && (
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Passer au Pro
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
