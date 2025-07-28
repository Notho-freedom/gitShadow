'use client';

import { useState, useEffect } from 'react';

export default function RepositoryList({ user, onRepoSelect, selectedRepo }) {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, private
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // updated, created, name, stars

  useEffect(() => {
    fetchRepositories();
  }, [user]);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      if (!user.access_token) {
        throw new Error('Token d\'accès manquant');
      }

      // Récupérer les vrais dépôts depuis l'API GitHub
      const response = await fetch(`/api/repositories?token=${user.access_token}&type=${filter}&sort=${sortBy}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des dépôts');
      }

      const data = await response.json();
      let repos = data.repositories || [];

      // Filtrer selon le plan utilisateur
      if ((user?.plan || 'free') === 'free') {
        // Plan gratuit : seulement les dépôts publics, limité à 5
        repos = repos.filter(repo => !repo.private).slice(0, 5);
      }

      // Formater les données des dépôts
      const formattedRepos = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        size: repo.size,
        default_branch: repo.default_branch,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        topics: repo.topics || [],
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url
        },
        accessToken: user.access_token // Ajouter le token d'accès
      }));

      setRepositories(formattedRepos);
    } catch (error) {
      console.error('Erreur lors du chargement des dépôts:', error);
      // Fallback en cas d'erreur
      setRepositories([]);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Node.js': 'bg-green-600',
      'Java': 'bg-orange-500',
      'C++': 'bg-blue-600',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600'
    };
    return colors[language] || 'bg-gray-500';
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

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredAndSortedRepos = repositories
    .filter(repo => {
      const matchesFilter = filter === 'all' || 
        (filter === 'public' && !repo.private) || 
        (filter === 'private' && repo.private);
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement de vos dépôts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec filtres */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Mes Dépôts</h2>
          <div className="text-sm text-gray-400">
            {filteredAndSortedRepos.length} dépôt{filteredAndSortedRepos.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un dépôt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="public">Publics</option>
              <option value="private">Privés</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">Mis à jour</option>
              <option value="created">Créé</option>
              <option value="name">Nom</option>
              <option value="stars">Étoiles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des dépôts */}
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
        {filteredAndSortedRepos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => onRepoSelect(repo)}
            className={`p-6 bg-gray-800/50 border rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/70 ${
              selectedRepo?.id === repo.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                    {repo.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {repo.private ? (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        🔒 Privé
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        🌐 Public
                      </span>
                    )}
                  </div>
                </div>

                {repo.description && (
                  <p className="text-gray-400 mb-3 line-clamp-2">{repo.description}</p>
                )}

                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  {repo.language && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                      <span>{repo.language}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>🍴</span>
                    <span>{repo.forks_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>📦</span>
                    <span>{formatSize(repo.size)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-sm text-gray-400">
                <p>Mis à jour {formatDate(repo.updated_at)}</p>
                <p className="text-xs mt-1">Branche: {repo.default_branch}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedRepos.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
            <span className="text-2xl">📁</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun dépôt trouvé</h3>
          <p className="text-gray-400">
            {searchQuery ? 'Essayez de modifier votre recherche' : 'Vous n\'avez pas encore de dépôts'}
          </p>
        </div>
      )}

      {/* Limitation plan gratuit */}
              {(user?.plan || 'free') === 'free' && repositories.length >= 5 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-400">ℹ️</span>
            <span className="text-blue-400 font-medium">Plan Gratuit</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Vous ne voyez que vos 5 premiers dépôts publics. Passez au plan Pro pour accéder à tous vos dépôts.
          </p>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
            Mettre à niveau vers Pro
          </button>
        </div>
      )}
    </div>
  );
}
