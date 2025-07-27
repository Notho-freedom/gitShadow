'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Sidebar({ activeView, onViewChange, user, collapsed, onToggleCollapse, onUpgrade, isGuest }) {
  const menuItems = [
    {
      id: 'repos',
      name: 'Dépôts',
      icon: '📁',
      description: 'Parcourir vos dépôts GitHub',
      premium: false,
      guestAllowed: true
    },
    {
      id: 'files',
      name: 'Fichiers',
      icon: '📄',
      description: 'Explorer la structure des fichiers',
      premium: false,
      guestAllowed: true
    },
    {
      id: 'code',
      name: 'Code',
      icon: '💻',
      description: 'Éditer le code avec coloration syntaxique',
      premium: false,
      guestAllowed: true
    },
    {
      id: 'commits',
      name: 'Historique',
      icon: '📝',
      description: 'Voir l\'historique des commits',
      premium: false,
      guestAllowed: true
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: '📚',
      description: 'Générer et consulter la documentation',
      premium: true,
      guestAllowed: false
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: '📊',
      description: 'Statistiques et métriques du projet',
      premium: true,
      guestAllowed: false
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      icon: '👥',
      description: 'Gérer l\'équipe et les permissions',
      premium: true,
      guestAllowed: false
    },
    {
      id: 'billing',
      name: 'Facturation',
      icon: '💳',
      description: 'Gérer votre abonnement',
      premium: false,
      guestAllowed: false
    },
    {
      id: 'settings',
      name: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration et préférences',
      premium: false,
      guestAllowed: true
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

  const handleItemClick = (item) => {
    // Pour les invités, vérifier si la fonctionnalité est autorisée
    if (isGuest && !item.guestAllowed) {
      onUpgrade();
      return;
    }
    
    // Pour les utilisateurs connectés, vérifier les fonctionnalités premium
    if (item.premium && user && user.plan === 'free') {
      onUpgrade();
      return;
    }
    
    onViewChange(item.id);
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isGuest 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : user.plan === 'free'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isGuest ? 'Invité' : user.plan === 'free' ? 'Gratuit' : user.plan}
                </span>
                {isGuest && (
                  <span className="text-yellow-400 text-xs">
                    {user.repos?.length || 0}/3
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const isLocked = (isGuest && !item.guestAllowed) || (item.premium && user.plan === 'free');
          
          return (
            <motion.button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                  : isLocked
                  ? 'opacity-60 hover:opacity-80 text-gray-400 hover:text-gray-300'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: isLocked ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.premium && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full">
                        PRO
                      </span>
                    )}
                    {isGuest && !item.guestAllowed && (
                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                        🔒
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-700/50">
          {isGuest ? (
            <div className="space-y-3">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-xs text-center">
                  Mode invité - {user.repos?.length || 0}/3 dépôts
                </p>
              </div>
              <button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                Se connecter
              </button>
            </div>
          ) : user.plan === 'free' ? (
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              Passer au Pro
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-xs">Plan {user.plan} actif</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
