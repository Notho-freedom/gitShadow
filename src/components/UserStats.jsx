'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function UserStats({ user, selectedRepo, collapsed }) {
  const [stats, setStats] = useState({
    repositories: { total: 0, public: 0, private: 0, totalStars: 0, totalForks: 0 },
    user: { followers: 0, following: 0, public_repos: 0 },
    topLanguages: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/userStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: user.access_token,
          username: user.login
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      id: 'repositories',
      label: 'Dépôts',
      icon: '📁',
      value: stats.repositories?.total || 0,
      color: 'blue'
    },
    {
      id: 'stars',
      label: 'Stars',
      icon: '⭐',
      value: stats.repositories?.totalStars || 0,
      color: 'yellow'
    },
    {
      id: 'forks',
      label: 'Forks',
      icon: '🔄',
      value: stats.repositories?.totalForks || 0,
      color: 'green'
    },
    {
      id: 'followers',
      label: 'Followers',
      icon: '👥',
      value: stats.user?.followers || 0,
      color: 'purple'
    },
    {
      id: 'languages',
      label: 'Langages',
      icon: '💻',
      value: stats.topLanguages?.length || 0,
      color: 'orange'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colorMap[color] || colorMap.blue;
  };

  if (collapsed) {
    return (
      <div className="p-4 border-t border-gray-700/50">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-sm">📊</span>
          </div>
          {loading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            <span className="text-xs text-gray-400">{stats.repositories?.total || 0}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-4 border-t border-gray-700/50 flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Statistiques</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-700/50 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-gray-700/30 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {statItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {item.value.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Top Languages - Version compacte */}
      {stats.topLanguages && stats.topLanguages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.1 }}
          className="mb-3"
        >
          <h4 className="text-xs font-semibold text-gray-300 mb-2">Top Langages</h4>
          <div className="flex flex-wrap gap-1">
            {stats.topLanguages.slice(0, 3).map((lang) => (
              <span key={lang.language} className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded">
                {lang.language} ({lang.count})
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Repository specific stats - Version compacte */}
      {selectedRepo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="bg-gray-700/30 rounded-lg p-2"
        >
          <h4 className="text-xs font-semibold text-gray-300 mb-1">Dépôt actuel</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">⭐</span>
              <span className="text-white">{selectedRepo.stargazers_count || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">🔄</span>
              <span className="text-white">{selectedRepo.forks_count || 0}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick actions - Version compacte */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.4 }}
        className="mt-2 space-y-1"
      >
        <button 
          onClick={() => window.open(`https://github.com/${user.login}`, '_blank')}
          className="w-full px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded transition-colors border border-blue-500/30"
        >
          Voir GitHub
        </button>
      </motion.div>
    </motion.div>
  );
} 