'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from './DataProvider';
import AdvancedAnalyticsPanel from './analytics/AdvancedAnalyticsPanel';

export default function AnalyticsPanel() {
  const { user, selectedRepo, repoData, hasSelectedRepo } = useData();
  const [activeTab, setActiveTab] = useState('overview');

  if (!hasSelectedRepo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucun repository sélectionné</h3>
          <p className="text-gray-400">Sélectionnez un repository pour voir les analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
            <p className="text-gray-400">
              Analyse détaillée de {selectedRepo?.name}
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

      {/* Tabs */}
      <div className="bg-gray-800/30 border-b border-gray-700/50">
        <div className="flex space-x-1 p-4">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
            { id: 'commits', label: 'Commits', icon: '📝' },
            { id: 'team', label: 'Équipe', icon: '👥' },
            { id: 'activity', label: 'Activité', icon: '🔥' },
            { id: 'issues', label: 'Issues & PRs', icon: '🐛' },
            { id: 'repository', label: 'Repository', icon: '📁' }
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
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'overview' && (
              <div className="h-full p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Métriques principales */}
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Métriques Principales</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Commits totaux:</span>
                        <span className="text-white font-medium">
                          {repoData?.commits?.total || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contributeurs:</span>
                        <span className="text-white font-medium">
                          {repoData?.collaborators?.collaborators?.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Issues ouvertes:</span>
                        <span className="text-white font-medium">
                          {repoData?.issues?.open || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">PRs ouvertes:</span>
                        <span className="text-white font-medium">
                          {repoData?.pulls?.open || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activité récente */}
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Activité Récente</h3>
                    <div className="space-y-3">
                      {repoData?.commits?.recent?.slice(0, 3).map((commit, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">
                              {commit.commit?.message || 'Commit sans message'}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {commit.author?.login || 'Auteur inconnu'} • {new Date(commit.commit?.author?.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Langages utilisés */}
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">Langages</h3>
                    <div className="space-y-2">
                      {repoData?.languages && Object.entries(repoData.languages)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([language, bytes]) => {
                          const totalBytes = Object.values(repoData.languages).reduce((a, b) => a + b, 0);
                          const percentage = Math.round((bytes / totalBytes) * 100);
                          return (
                            <div key={language} className="flex items-center justify-between">
                              <span className="text-white text-sm">{language}</span>
                              <span className="text-gray-400 text-sm">{percentage}%</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commits' && (
              <div className="h-full">
                <AdvancedAnalyticsPanel 
                  repositoryData={repoData?.analytics} 
                  user={user}
                />
              </div>
            )}

            {activeTab === 'team' && (
              <div className="h-full">
                <AdvancedAnalyticsPanel 
                  repositoryData={repoData?.analytics} 
                  user={user}
                />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="h-full">
                <AdvancedAnalyticsPanel 
                  repositoryData={repoData?.analytics} 
                  user={user}
                />
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="h-full">
                <AdvancedAnalyticsPanel 
                  repositoryData={repoData?.analytics} 
                  user={user}
                />
              </div>
            )}

            {activeTab === 'repository' && (
              <div className="h-full">
                <AdvancedAnalyticsPanel 
                  repositoryData={repoData?.analytics} 
                  user={user}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
