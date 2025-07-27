'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';

export default function SettingsPanel({ user, theme, setTheme, layout, setLayout }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true
  });

  const handleLogout = () => {
    logout();
    // Rediriger vers la page d'accueil
    window.location.href = '/';
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: '⚙️' },
    { id: 'appearance', name: 'Apparence', icon: '🎨' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Sécurité', icon: '🔒' },
    { id: 'billing', name: 'Facturation', icon: '💳' },
    { id: 'advanced', name: 'Avancé', icon: '🔧' }
  ];

  const themes = [
    { id: 'dark', name: 'Sombre', description: 'Thème sombre par défaut' },
    { id: 'light', name: 'Clair', description: 'Thème clair pour la journée' },
    { id: 'auto', name: 'Automatique', description: 'Suivant les préférences système' }
  ];

  const layouts = [
    { id: 'default', name: 'Défaut', description: 'Disposition standard' },
    { id: 'code-focus', name: 'Code', description: 'Optimisé pour le développement' },
    { id: 'documentation-focus', name: 'Documentation', description: 'Centré sur la documentation' },
    { id: 'split', name: 'Partagé', description: 'Vue divisée' }
  ];

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Paramètres</h2>
          <p className="text-gray-400 text-sm">Personnalisez votre expérience</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* General Tab */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Paramètres généraux</h3>
              
              {/* Profile Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Profil utilisateur</h4>
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-gray-600"
                  />
                  <div>
                    <h5 className="text-white font-medium">{user.name}</h5>
                    <p className="text-gray-400">@{user.login}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom d'affichage
                    </label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Plan d'abonnement</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      Plan {user.plan === 'free' ? 'Gratuit' : user.plan === 'pro' ? 'Pro' : 'Enterprise'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {user.plan === 'free' ? 'Fonctionnalités de base' : 
                       user.plan === 'pro' ? 'Fonctionnalités avancées' : 'Fonctionnalités complètes'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    {user.plan === 'free' ? 'Passer au Pro' : 'Gérer l\'abonnement'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Apparence</h3>
              
              {/* Theme Selection */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Thème</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themes.map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        theme === themeOption.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }`}
                    >
                      <h5 className="text-white font-medium mb-1">{themeOption.name}</h5>
                      <p className="text-gray-400 text-sm">{themeOption.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Selection */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Disposition</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {layouts.map((layoutOption) => (
                    <button
                      key={layoutOption.id}
                      onClick={() => setLayout(layoutOption.id)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        layout === layoutOption.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                      }`}
                    >
                      <h5 className="text-white font-medium mb-1">{layoutOption.name}</h5>
                      <p className="text-gray-400 text-sm">{layoutOption.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Notifications</h3>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Préférences de notification</h4>
                
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium capitalize">
                          {key === 'email' ? 'Notifications par email' :
                           key === 'push' ? 'Notifications push' :
                           key === 'updates' ? 'Mises à jour' :
                           'Marketing'}
                        </h5>
                        <p className="text-gray-400 text-sm">
                          {key === 'email' ? 'Recevoir les notifications par email' :
                           key === 'push' ? 'Notifications en temps réel' :
                           key === 'updates' ? 'Nouvelles fonctionnalités' :
                           'Offres et promotions'}
                        </p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          value ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Sécurité</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Authentification</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">Authentification GitHub</h5>
                        <p className="text-gray-400 text-sm">Connecté via GitHub OAuth</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                        Actif
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      Reconnecter GitHub
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Sessions actives</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Session actuelle</p>
                        <p className="text-gray-400 text-sm">Navigateur actuel • Il y a 2 heures</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                        Actuel
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Facturation</h3>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Plan actuel</h4>
                
                <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">
                      Plan {user.plan === 'free' ? 'Gratuit' : user.plan === 'pro' ? 'Pro' : 'Enterprise'}
                    </h5>
                    <span className="text-2xl font-bold text-white">
                      {user.plan === 'free' ? '0€' : user.plan === 'pro' ? '9€' : '29€'}/mois
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                    {user.plan === 'free' ? 'Fonctionnalités de base incluses' : 
                     user.plan === 'pro' ? 'Toutes les fonctionnalités Pro' : 'Fonctionnalités Enterprise complètes'}
                  </p>
                  
                  {user.plan === 'free' ? (
                    <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                      Passer au plan Pro
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                        Gérer l'abonnement
                      </button>
                      <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors">
                        Annuler l'abonnement
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h5 className="text-white font-medium mb-4">Historique des paiements</h5>
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💳</span>
                    </div>
                    <p>Aucun paiement pour le moment</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Paramètres avancés</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Données</h4>
                  <div className="space-y-4">
                    <button className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left">
                      <h5 className="font-medium">Exporter mes données</h5>
                      <p className="text-gray-400 text-sm">Télécharger toutes vos données</p>
                    </button>
                    <button className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-left">
                      <h5 className="font-medium">Supprimer mon compte</h5>
                      <p className="text-gray-400 text-sm">Action irréversible</p>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Déconnexion</h4>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 