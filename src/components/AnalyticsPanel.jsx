'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsPanel({ user, selectedRepo }) {
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedRepo) {
      calculateRealStats();
    }
  }, [selectedRepo]);

  const calculateRealStats = () => {
    setLoading(true);
    
    try {
      // Statistiques basées sur les données du dépôt sélectionné
      const repoInfo = {
        name: selectedRepo.name,
        owner: selectedRepo.owner?.login || selectedRepo.owner,
        language: selectedRepo.language,
        stars: selectedRepo.stargazers_count || 0,
        forks: selectedRepo.forks_count || 0,
        updatedAt: selectedRepo.updated_at
      };

      // Données simulées pour la démonstration
      const mockStats = {
        totalCommits: Math.floor(Math.random() * 1000) + 100,
        totalFiles: Math.floor(Math.random() * 500) + 50,
        topAuthors: [
          { name: user.name, count: Math.floor(Math.random() * 200) + 50 },
          { name: 'Alice Johnson', count: Math.floor(Math.random() * 150) + 30 },
          { name: 'Bob Smith', count: Math.floor(Math.random() * 100) + 20 }
        ],
        topFileTypes: [
          { ext: 'js', count: Math.floor(Math.random() * 100) + 20 },
          { ext: 'ts', count: Math.floor(Math.random() * 80) + 15 },
          { ext: 'css', count: Math.floor(Math.random() * 60) + 10 },
          { ext: 'md', count: Math.floor(Math.random() * 40) + 5 },
          { ext: 'json', count: Math.floor(Math.random() * 30) + 5 }
        ],
        topCommitTypes: [
          { type: 'feat', count: Math.floor(Math.random() * 200) + 50 },
          { type: 'fix', count: Math.floor(Math.random() * 150) + 30 },
          { type: 'docs', count: Math.floor(Math.random() * 100) + 20 },
          { type: 'refactor', count: Math.floor(Math.random() * 80) + 15 },
          { type: 'style', count: Math.floor(Math.random() * 60) + 10 }
        ]
      };

      setUsageStats({
        ...mockStats,
        repoInfo
      });
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      setUsageStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Calcul des statistiques...
      </div>
    );
  }

  if (!usageStats) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-400">Sélectionnez un dépôt pour voir les statistiques</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
      
      {/* Informations du dépôt */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Dépôt: {usageStats.repoInfo.name}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Propriétaire:</span>
            <span className="text-white ml-2">{usageStats.repoInfo.owner}</span>
          </div>
          <div>
            <span className="text-gray-400">Langage:</span>
            <span className="text-white ml-2">{usageStats.repoInfo.language || 'Non spécifié'}</span>
          </div>
          <div>
            <span className="text-gray-400">Étoiles:</span>
            <span className="text-white ml-2">⭐ {usageStats.repoInfo.stars}</span>
          </div>
          <div>
            <span className="text-gray-400">Forks:</span>
            <span className="text-white ml-2">🍴 {usageStats.repoInfo.forks}</span>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{usageStats.totalCommits}</div>
          <div className="text-gray-400 text-sm">Total commits</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{usageStats.topAuthors.length}</div>
          <div className="text-gray-400 text-sm">Contributeurs</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{usageStats.totalFiles}</div>
          <div className="text-gray-400 text-sm">Fichiers modifiés</div>
        </div>
      </div>



      {/* Top contributeurs */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Top Contributeurs</h3>
        <div className="space-y-2">
          {usageStats.topAuthors.map((author, index) => (
            <div key={author.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">#{index + 1}</span>
                <span className="text-white">{author.name}</span>
              </div>
              <span className="text-blue-400 font-medium">{author.count} commits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Types de commits */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Types de Commits</h3>
        <div className="space-y-2">
          {usageStats.topCommitTypes.map((type, index) => (
            <div key={type.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  type.type === 'feat' ? 'bg-green-500/20 text-green-400' :
                  type.type === 'fix' ? 'bg-red-500/20 text-red-400' :
                  type.type === 'docs' ? 'bg-blue-500/20 text-blue-400' :
                  type.type === 'style' ? 'bg-purple-500/20 text-purple-400' :
                  type.type === 'refactor' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {type.type}
                </span>
              </div>
              <span className="text-white font-medium">{type.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Types de fichiers */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Types de Fichiers Modifiés</h3>
        <div className="space-y-2">
          {usageStats.topFileTypes.map((fileType, index) => (
            <div key={fileType.ext} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">.{fileType.ext}</span>
              </div>
              <span className="text-white font-medium">{fileType.count} fichiers</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
