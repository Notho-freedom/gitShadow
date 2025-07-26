'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsPanel({ repo, commits, selectedCommit }) {
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (repo && commits) {
      calculateRealStats();
    }
  }, [repo, commits, selectedCommit]);

  const calculateRealStats = () => {
    setLoading(true);
    
    try {
      // Calculer les vraies statistiques basées sur les données GitHub
      const totalCommits = commits?.length || 0;
      const totalFiles = selectedCommit?.files?.length || 0;
      
      // Analyser les types de commits
      const commitTypes = {};
      const authors = {};
      const fileTypes = {};
      
      commits?.forEach(commit => {
        // Type de commit
        const message = commit.commit.message.toLowerCase();
        let type = 'other';
        if (message.startsWith('feat:')) type = 'feat';
        else if (message.startsWith('fix:')) type = 'fix';
        else if (message.startsWith('docs:')) type = 'docs';
        else if (message.startsWith('style:')) type = 'style';
        else if (message.startsWith('refactor:')) type = 'refactor';
        else if (message.startsWith('test:')) type = 'test';
        else if (message.startsWith('chore:')) type = 'chore';
        
        commitTypes[type] = (commitTypes[type] || 0) + 1;
        
        // Auteurs
        const author = commit.author?.login || commit.commit.author.name;
        authors[author] = (authors[author] || 0) + 1;
        
        // Fichiers modifiés
        commit.files?.forEach(file => {
          const ext = file.filename.split('.').pop()?.toLowerCase();
          if (ext) {
            fileTypes[ext] = (fileTypes[ext] || 0) + 1;
          }
        });
      });

      // Statistiques du commit sélectionné
      const selectedCommitStats = selectedCommit ? {
        additions: selectedCommit.stats?.additions || 0,
        deletions: selectedCommit.stats?.deletions || 0,
        total: selectedCommit.stats?.total || 0,
        filesChanged: selectedCommit.files?.length || 0,
        filesAdded: selectedCommit.files?.filter(f => f.status === 'added').length || 0,
        filesModified: selectedCommit.files?.filter(f => f.status === 'modified').length || 0,
        filesRemoved: selectedCommit.files?.filter(f => f.status === 'removed').length || 0
      } : null;

      // Top auteurs
      const topAuthors = Object.entries(authors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Top types de fichiers
      const topFileTypes = Object.entries(fileTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([ext, count]) => ({ ext, count }));

      // Top types de commits
      const topCommitTypes = Object.entries(commitTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }));

      setUsageStats({
        totalCommits,
        totalFiles,
        selectedCommitStats,
        topAuthors,
        topFileTypes,
        topCommitTypes,
        repoInfo: {
          name: repo.name,
          owner: repo.owner?.login || repo.owner,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at
        }
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

      {/* Statistiques du commit sélectionné */}
      {usageStats.selectedCommitStats && (
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Commit sélectionné</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-400 font-bold">+{usageStats.selectedCommitStats.additions}</span>
              <div className="text-gray-400">Ajouts</div>
            </div>
            <div>
              <span className="text-red-400 font-bold">-{usageStats.selectedCommitStats.deletions}</span>
              <div className="text-gray-400">Suppressions</div>
            </div>
            <div>
              <span className="text-white font-bold">{usageStats.selectedCommitStats.filesChanged}</span>
              <div className="text-gray-400">Fichiers modifiés</div>
            </div>
            <div>
              <span className="text-white font-bold">{usageStats.selectedCommitStats.total}</span>
              <div className="text-gray-400">Total changements</div>
            </div>
          </div>
        </div>
      )}

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
