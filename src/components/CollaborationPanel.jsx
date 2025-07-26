'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CollaborationPanel({ user, selectedRepo }) {
  const [activeTab, setActiveTab] = useState('team');
  const [inviteEmail, setInviteEmail] = useState('');

  const tabs = [
    { id: 'team', name: 'Équipe', icon: '👥' },
    { id: 'permissions', name: 'Permissions', icon: '🔐' },
    { id: 'activity', name: 'Activité', icon: '📊' },
    { id: 'integrations', name: 'Intégrations', icon: '🔗' }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      role: 'admin',
      status: 'online',
      lastActive: 'Il y a 5 minutes'
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      role: 'developer',
      status: 'away',
      lastActive: 'Il y a 2 heures'
    },
    {
      id: 3,
      name: 'Carol Davis',
      email: 'carol@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
      role: 'viewer',
      status: 'offline',
      lastActive: 'Hier'
    }
  ];

  const activities = [
    {
      id: 1,
      user: 'Alice Johnson',
      action: 'a modifié le fichier',
      file: 'Dashboard.jsx',
      time: 'Il y a 10 minutes',
      type: 'edit'
    },
    {
      id: 2,
      user: 'Bob Smith',
      action: 'a créé une branche',
      file: 'feature/new-dashboard',
      time: 'Il y a 1 heure',
      type: 'branch'
    },
    {
      id: 3,
      user: 'Carol Davis',
      action: 'a commenté sur',
      file: 'README.md',
      time: 'Il y a 3 heures',
      type: 'comment'
    }
  ];

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notifications et intégrations Slack',
      icon: '💬',
      connected: true
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Notifications Discord',
      icon: '🎮',
      connected: false
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Intégration Teams',
      icon: '🏢',
      connected: false
    }
  ];

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      developer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[role] || colors.viewer;
  };

  const getStatusColor = (status) => {
    const colors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      offline: 'bg-gray-500'
    };
    return colors[status] || colors.offline;
  };

  const getActivityIcon = (type) => {
    const icons = {
      edit: '✏️',
      branch: '🌿',
      comment: '💬',
      commit: '📝',
      merge: '🔀'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Collaboration</h2>
          <p className="text-gray-400 text-sm">Gérez votre équipe</p>
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
          {/* Team Tab */}
          {activeTab === 'team' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Équipe</h3>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Inviter un membre
                </button>
              </div>

              {/* Invite Form */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Inviter un nouveau membre</h4>
                <div className="flex space-x-4">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="viewer">Lecteur</option>
                    <option value="developer">Développeur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                  <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                    Inviter
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Membres de l'équipe</h4>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={member.avatar} 
                            alt={member.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`}></div>
                        </div>
                        <div>
                          <h5 className="text-white font-medium">{member.name}</h5>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                          <p className="text-gray-500 text-xs">{member.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                          {member.role === 'admin' ? 'Admin' : 
                           member.role === 'developer' ? 'Développeur' : 'Lecteur'}
                        </span>
                        <button className="text-gray-400 hover:text-red-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Permissions</h3>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Niveaux d'accès</h4>
                
                <div className="space-y-6">
                  <div className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">Lecteur</h5>
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Basique</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Peut voir et commenter le code</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Lecture des fichiers</li>
                      <li>• Commentaires</li>
                      <li>• Téléchargement</li>
                    </ul>
                  </div>

                  <div className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">Développeur</h5>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Standard</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Peut modifier et créer du code</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Toutes les permissions lecteur</li>
                      <li>• Édition de fichiers</li>
                      <li>• Création de branches</li>
                      <li>• Pull requests</li>
                    </ul>
                  </div>

                  <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">Administrateur</h5>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Complet</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">Accès complet au projet</p>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• Toutes les permissions développeur</li>
                      <li>• Gestion des membres</li>
                      <li>• Paramètres du projet</li>
                      <li>• Suppression de contenu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Activité récente</h3>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                      <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1">
                        <p className="text-white">
                          <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                          <span className="text-blue-400">{activity.file}</span>
                        </p>
                        <p className="text-gray-400 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Intégrations</h3>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h5 className="text-white font-medium">{integration.name}</h5>
                          <p className="text-gray-400 text-sm">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          integration.connected 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {integration.connected ? 'Connecté' : 'Non connecté'}
                        </span>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          integration.connected
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}>
                          {integration.connected ? 'Déconnecter' : 'Connecter'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 