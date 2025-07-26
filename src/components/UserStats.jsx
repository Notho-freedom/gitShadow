'use client';

import { useState, useEffect } from 'react';

export default function UserStats({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.access_token) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/userStats?token=${user.access_token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques utilisateur:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Chargement des statistiques...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-400">Impossible de charger les statistiques utilisateur</p>
      </div>
    );
  }

  if (!stats.user) {
    return (
      <div className="p-6 text-center text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Données utilisateur manquantes</h3>
        <p className="text-gray-400">Les informations utilisateur ne sont pas disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Statistiques Utilisateur</h2>
      
      {/* Informations utilisateur */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={stats.user.avatar_url} 
            alt={stats.user.name || stats.user.login}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="text-xl font-semibold text-white">
              {stats.user.name || stats.user.login}
            </h3>
            <p className="text-gray-400">@{stats.user.login}</p>
            <p className="text-sm text-gray-500">
              Membre depuis {formatDate(stats.user.created_at)}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{stats.user.followers}</div>
            <div className="text-gray-400 text-sm">Abonnés</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.user.following}</div>
            <div className="text-gray-400 text-sm">Abonnements</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stats.user.public_repos}</div>
            <div className="text-gray-400 text-sm">Dépôts publics</div>
          </div>
        </div>
      </div>

      {/* Statistiques des dépôts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.repositories.total}</div>
          <div className="text-gray-400 text-sm">Total dépôts</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.repositories.public}</div>
          <div className="text-gray-400 text-sm">Dépôts publics</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.repositories.totalStars}</div>
          <div className="text-gray-400 text-sm">Total étoiles</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.repositories.totalForks}</div>
          <div className="text-gray-400 text-sm">Total forks</div>
        </div>
      </div>

      {/* Top langages */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Langages les plus utilisés</h3>
        <div className="space-y-2">
          {stats.topLanguages.map((lang, index) => (
            <div key={lang.language} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">#{index + 1}</span>
                <span className="text-white">{lang.language}</span>
              </div>
              <span className="text-blue-400 font-medium">{lang.count} dépôts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Activité récente</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">{activity.repo}</span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-400 text-sm font-mono">{activity.sha}</span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">{activity.commit}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 