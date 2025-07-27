'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CollaborationPanel({ user, selectedRepo }) {
  const [activeTab, setActiveTab] = useState('team');
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'team', name: 'Équipe', icon: '👥' },
    { id: 'permissions', name: 'Permissions', icon: '🔐' },
    { id: 'activity', name: 'Activité', icon: '📊' },
    { id: 'integrations', name: 'Intégrations', icon: '🔗' }
  ];

  // Charger les vraies données quand un dépôt est sélectionné
  useEffect(() => {
    if (selectedRepo) {
      fetchCollaborators();
      fetchRepoActivity();
    }
  }, [selectedRepo]);

  const fetchCollaborators = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/fetchCollaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: selectedRepo.owner?.login || selectedRepo.owner,
          repo: selectedRepo.name,
          accessToken: selectedRepo.accessToken || user?.access_token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.collaborators || []);
        setContributors(data.contributors || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des collaborateurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des collaborateurs:', error);
      setError(error.message);
      // Fallback avec des données vides
      setTeamMembers([]);
      setContributors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoActivity = async () => {
    if (!selectedRepo) return;
    
    try {
      const response = await fetch('/api/fetchRepoActivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: selectedRepo.owner?.login || selectedRepo.owner,
          repo: selectedRepo.name,
          accessToken: selectedRepo.accessToken || user?.access_token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Formater les activités récentes
        const formattedActivities = [];
        
        // Ajouter les commits récents
        data.recentCommits?.forEach(commit => {
          formattedActivities.push({
            id: `commit-${commit.sha}`,
            user: commit.author,
            action: 'a commité',
            file: commit.message,
            time: formatDate(commit.date),
            type: 'commit',
            html_url: commit.html_url,
            avatar_url: commit.avatar_url
          });
        });

        // Ajouter les pull requests récentes
        data.recentPulls?.forEach(pull => {
          formattedActivities.push({
            id: `pull-${pull.number}`,
            user: pull.author,
            action: 'a créé une pull request',
            file: pull.title,
            time: formatDate(pull.created_at),
            type: 'pull',
            html_url: pull.html_url,
            avatar_url: pull.avatar_url
          });
        });

        // Ajouter les issues récentes
        data.recentIssues?.forEach(issue => {
          formattedActivities.push({
            id: `issue-${issue.number}`,
            user: issue.author,
            action: 'a ouvert une issue',
            file: issue.title,
            time: formatDate(issue.created_at),
            type: 'issue',
            html_url: issue.html_url,
            avatar_url: issue.avatar_url
          });
        });

        // Trier par date et prendre les 10 plus récentes
        setActivities(formattedActivities
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 10)
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'activité:', error);
      setActivities([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.ceil(diffDays / 7)} semaines`;
    return `il y a ${Math.ceil(diffDays / 30)} mois`;
  };

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
      write: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      read: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[role] || colors.read;
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      write: 'Développeur',
      read: 'Lecteur'
    };
    return labels[role] || 'Lecteur';
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
      merge: '🔀',
      pull: '🔀',
      issue: '🐛'
    };
    return icons[type] || '📄';
  };

  if (!selectedRepo) {
    return (
      <div className="h-full flex bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Collaboration</h3>
            <p className="text-gray-400">Sélectionnez un dépôt pour voir l'équipe et l'activité</p>
          </div>
        </div>
      </div>
    );
  }

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

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Chargement des collaborateurs...</p>
                </div>
              ) : error ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <>
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
                        <option value="read">Lecteur</option>
                        <option value="write">Développeur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                      <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        Inviter
                      </button>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Membres de l'équipe ({teamMembers.length})</h4>
                    {teamMembers.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">Aucun collaborateur trouvé</p>
                    ) : (
                      <div className="space-y-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="relative">
                                <img 
                                  src={member.avatar_url} 
                                  alt={member.name}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(member.status)}`}></div>
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{member.name}</h5>
                                <p className="text-gray-400 text-sm">@{member.login}</p>
                                <p className="text-gray-500 text-xs">{member.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                                {getRoleLabel(member.role)}
                              </span>
                              <a 
                                href={member.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contributors */}
                  {contributors.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Contributeurs ({contributors.length})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contributors.slice(0, 9).map((contributor, index) => (
                          <div key={contributor.login} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                            <img 
                              src={contributor.avatar_url} 
                              alt={contributor.login}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white font-medium truncate">@{contributor.login}</h5>
                              <p className="text-gray-400 text-sm">{contributor.contributions} contributions</p>
                            </div>
                            <a 
                              href={contributor.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Activité Récente</h3>
                <button 
                  onClick={fetchRepoActivity}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Actualiser
                </button>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Activité du dépôt</h4>
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucune activité récente</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex-shrink-0">
                          <img
                            src={activity.avatar_url || `https://github.com/identicons/${activity.user}.png`}
                            alt={activity.user}
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{activity.user}</span>
                            <span className="text-gray-400 text-sm">{activity.action}</span>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-gray-500 text-sm">{activity.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getActivityIcon(activity.type)}</span>
                            <a 
                              href={activity.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                            >
                              {activity.file}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Permissions</h3>
                <p className="text-gray-400">Gérez les niveaux d'accès de votre équipe</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-500/30 rounded-lg p-4 bg-gray-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">Lecteur</h5>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">Basique</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Peut voir et cloner le code</p>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Lecture du code</li>
                    <li>• Téléchargement des releases</li>
                    <li>• Consultation des issues</li>
                    <li>• Pas de modifications</li>
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
            </motion.div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Intégrations</h3>
                <p className="text-gray-400">Connectez vos outils de collaboration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                  <div key={integration.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="text-white font-semibold">{integration.name}</h4>
                          <p className="text-gray-400 text-sm">{integration.description}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${integration.connected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                    <button className={`w-full px-4 py-2 rounded-lg transition-colors ${
                      integration.connected 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      {integration.connected ? 'Déconnecter' : 'Connecter'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 