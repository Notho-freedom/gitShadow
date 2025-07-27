'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from './DataProvider';

export default function CollaborationPanel() {
  const { 
    user, 
    selectedRepo, 
    repoData, 
    hasSelectedRepo,
    loading: dataLoading,
    error: dataError
  } = useData();

  const [activeTab, setActiveTab] = useState('team');
  const [animatedData, setAnimatedData] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalCommits: 0,
    recentActivity: 0
  });

  useEffect(() => {
    if (!hasSelectedRepo || !repoData) return;

    const animateData = () => {
      const collaborators = repoData.collaborators?.collaborators || [];
      const contributors = repoData.collaborators?.contributors || [];
      const commits = repoData.commits?.recent || [];
      const activity = repoData.activity || {};

      const targetData = {
        totalMembers: collaborators.length + contributors.length,
        activeMembers: collaborators.filter(c => c.recentCommits > 0).length,
        totalCommits: commits.length,
        recentActivity: activity.recentCommits?.length || 0
      };

      const steps = 30;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setAnimatedData({
          totalMembers: Math.floor(targetData.totalMembers * progress),
          activeMembers: Math.floor(targetData.activeMembers * progress),
          totalCommits: Math.floor(targetData.totalCommits * progress),
          recentActivity: Math.floor(targetData.recentActivity * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    };

    animateData();
  }, [hasSelectedRepo, repoData]);

  if (!hasSelectedRepo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun repository sélectionné</h3>
          <p className="text-gray-400">Sélectionnez un repository pour voir la collaboration</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des données de collaboration...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h3>
          <p className="text-red-400 mb-4">{dataError}</p>
        </div>
      </div>
    );
  }

  const collaborators = repoData?.collaborators?.collaborators || [];
  const contributors = repoData?.collaborators?.contributors || [];
  const recentActivity = repoData?.activity || {};

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-500',
      maintain: 'bg-orange-500',
      write: 'bg-blue-500',
      triage: 'bg-green-500',
      read: 'bg-gray-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      maintain: 'Mainteneur',
      write: 'Écrivain',
      triage: 'Triage',
      read: 'Lecteur'
    };
    return labels[role] || role;
  };

  const getActivityIcon = (type) => {
    const icons = {
      commit: '📝',
      issue: '🐛',
      pr: '🔀',
      review: '👀',
      comment: '💬'
    };
    return icons[type] || '📊';
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Collaboration</h1>
            <p className="text-gray-400">
              Équipe et activité de {selectedRepo?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Repository:</span>
            <span className="text-sm text-white font-medium">
              {selectedRepo?.owner?.login || selectedRepo?.owner}/{selectedRepo?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="bg-gray-800/30 border-b border-gray-700/50 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">👥</div>
            <div className="text-lg font-bold text-white">{animatedData.totalMembers}</div>
            <div className="text-xs text-gray-400">Membres totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">🔥</div>
            <div className="text-lg font-bold text-white">{animatedData.activeMembers}</div>
            <div className="text-xs text-gray-400">Membres actifs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">📝</div>
            <div className="text-lg font-bold text-white">{animatedData.totalCommits}</div>
            <div className="text-xs text-gray-400">Commits récents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">⚡</div>
            <div className="text-lg font-bold text-white">{animatedData.recentActivity}</div>
            <div className="text-xs text-gray-400">Activité récente</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/30 border-b border-gray-700/50">
        <div className="flex space-x-1 p-4">
          {[
            { id: 'team', label: 'Équipe', icon: '👥' },
            { id: 'activity', label: 'Activité', icon: '🔥' },
            { id: 'contributors', label: 'Contributeurs', icon: '⭐' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full p-6"
          >
            {activeTab === 'team' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Membres de l'équipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collaborators.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={member.avatar_url || '/guest-avatar.svg'}
                          alt={member.login}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{member.login}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${getRoleColor(member.role_name)} text-white`}>
                            {getRoleLabel(member.role_name)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Commits récents:</span>
                          <span className="text-white">{member.recentCommits || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ajouté le:</span>
                          <span className="text-white">
                            {member.created_at ? new Date(member.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Activité récente</h3>
                <div className="space-y-4">
                  {recentActivity.recentCommits?.slice(0, 10).map((commit, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{getActivityIcon('commit')}</div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {commit.commit?.message || 'Commit sans message'}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {commit.author?.login || 'Auteur inconnu'} • {new Date(commit.commit?.author?.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className="text-gray-500 text-xs font-mono">
                          {commit.sha?.substring(0, 7)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contributors' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Contributeurs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contributors.map((contributor, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-green-500/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={contributor.avatar_url || '/guest-avatar.svg'}
                          alt={contributor.login}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{contributor.login}</h4>
                          <span className="text-green-400 text-xs">Contributeur</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contributions:</span>
                          <span className="text-white">{contributor.contributions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white">{contributor.type || 'User'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 