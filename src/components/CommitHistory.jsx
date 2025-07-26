'use client';

import { useState, useEffect } from 'react';

export default function CommitHistory({ repo, onCommitSelect, selectedCommit, onCommitsLoaded }) {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (repo) {
      fetchBranches();
      fetchCommits();
    }
  }, [repo]);

  useEffect(() => {
    if (repo && branch) {
      setPage(1);
      fetchCommits(1);
    }
  }, [repo, branch]);

  const fetchBranches = async () => {
    if (!repo) return;
    
    try {
      const response = await fetch('/api/fetchBranches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner,
          repo: repo.name,
          accessToken: repo.accessToken || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(data.branches);
        if (data.defaultBranch && !branch) {
          setBranch(data.defaultBranch);
        }
      } else {
        console.error('Erreur lors du chargement des branches');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des branches:', error);
    }
  };

  const fetchCommits = async (pageNum = 1) => {
    if (!repo) return;
    
    setLoading(pageNum === 1);
    setError(null);
    
    try {
      const response = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: repo.owner?.login || repo.owner,
          repo: repo.name,
          branch: branch,
          page: pageNum,
          per_page: 30,
          accessToken: repo.accessToken || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des commits');
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setCommits(data.commits);
        onCommitsLoaded?.(data.commits);
      } else {
        setCommits(prev => [...prev, ...data.commits]);
        onCommitsLoaded?.([...commits, ...data.commits]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Erreur lors du chargement des commits:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCommits(page + 1);
    }
  };

  const getCommitType = (message) => {
    const types = {
      'feat': { label: 'Feature', color: 'bg-green-500', icon: '✨' },
      'fix': { label: 'Fix', color: 'bg-red-500', icon: '🐛' },
      'docs': { label: 'Docs', color: 'bg-blue-500', icon: '📚' },
      'style': { label: 'Style', color: 'bg-purple-500', icon: '💄' },
      'refactor': { label: 'Refactor', color: 'bg-yellow-500', icon: '♻️' },
      'test': { label: 'Test', color: 'bg-orange-500', icon: '🧪' },
      'chore': { label: 'Chore', color: 'bg-gray-500', icon: '🔧' },
      'perf': { label: 'Perf', color: 'bg-indigo-500', icon: '⚡' },
      'ci': { label: 'CI', color: 'bg-teal-500', icon: '🔧' },
      'build': { label: 'Build', color: 'bg-cyan-500', icon: '📦' }
    };

    for (const [key, value] of Object.entries(types)) {
      if (message.toLowerCase().startsWith(key + ':')) {
        return value;
      }
    }
    return { label: 'Other', color: 'bg-gray-500', icon: '📝' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hier';
    if (diffDays < 7) return `il y a ${diffDays} jours`;
    if (diffDays < 30) return `il y a ${Math.ceil(diffDays / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredCommits = commits.filter(commit =>
    commit.commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (commit.author?.login && commit.author.login.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (commit.commit.author.name && commit.commit.author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!repo) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sélectionnez un dépôt</h3>
          <p className="text-gray-400">Choisissez un dépôt pour voir son historique de commits</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Historique des Commits</h2>
            <p className="text-gray-400">{repo.name}</p>
          </div>
          <div className="text-sm text-gray-400">
            {filteredCommits.length} commit{filteredCommits.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Sélecteur de branche */}
          <div className="flex-1">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {branches.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} {b.isDefault ? '(défaut)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton d'actualisation */}
          <button
            onClick={() => fetchCommits(1)}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>

          {/* Barre de recherche */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher dans les commits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Liste des commits */}
      {loading && page === 1 ? (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
          {filteredCommits.map((commit) => {
            const commitType = getCommitType(commit.commit.message);
            const isSelected = selectedCommit?.sha === commit.sha;
            
            return (
              <div
                key={commit.sha}
                onClick={() => onCommitSelect(commit)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={commit.author?.avatar_url || `https://github.com/identicons/${commit.author?.login || 'user'}.png`}
                      alt={commit.author?.login || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${commitType.color} text-white`}>
                        {commitType.icon} {commitType.label}
                      </span>
                      <span className="text-sm text-gray-400">
                        {commit.author?.login || commit.commit.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(commit.commit.author.date)}
                      </span>
                    </div>

                    <h3 className="text-white font-medium mb-2 line-clamp-2">
                      {commit.commit.message.split('\n')[0]}
                    </h3>

                    {/* Statistiques */}
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="text-green-400">+{commit.stats?.additions || 0}</span>
                        <span className="text-red-400">-{commit.stats?.deletions || 0}</span>
                      </span>
                      <span>{commit.files?.length || 0} fichier{(commit.files?.length || 0) > 1 ? 's' : ''}</span>
                      <span className="text-xs font-mono text-gray-500">
                        {commit.sha.substring(0, 7)}
                      </span>
                    </div>

                    {/* Fichiers modifiés */}
                    {commit.files && commit.files.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {commit.files.slice(0, 3).map((file, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded ${
                              file.status === 'added' ? 'bg-green-900/30 text-green-400' :
                              file.status === 'modified' ? 'bg-yellow-900/30 text-yellow-400' :
                              file.status === 'removed' ? 'bg-red-900/30 text-red-400' :
                              'bg-gray-700/30 text-gray-400'
                            }`}
                          >
                            {file.filename}
                          </span>
                        ))}
                        {commit.files.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded bg-gray-700/30 text-gray-400">
                            +{commit.files.length - 3} autres
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bouton "Charger plus" */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? 'Chargement...' : 'Charger plus de commits'}
              </button>
            </div>
          )}

          {/* Message si aucun commit */}
          {!loading && filteredCommits.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Aucun commit trouvé</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Aucun commit ne correspond à votre recherche' : 'Ce dépôt ne contient aucun commit'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

