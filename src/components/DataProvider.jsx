'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';

// Créer le contexte
const DataContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé dans un DataProvider');
  }
  return context;
};

// Provider principal
export const DataProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  
  // États globaux
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // États pour les données du repository sélectionné
  const [repoData, setRepoData] = useState({
    commits: null,
    collaborators: null,
    issues: null,
    pulls: null,
    branches: null,
    analytics: null,
    activity: null,
    fileTree: null,
    languages: null,
    repoStats: null
  });

  // États pour les données utilisateur
  const [userStats, setUserStats] = useState(null);
  const [userRepositories, setUserRepositories] = useState([]);

  // Fonction pour récupérer les statistiques utilisateur
  const fetchUserStats = useCallback(async () => {
    if (!authUser?.access_token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/userStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: authUser.access_token })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des stats utilisateur');
      
      const data = await response.json();
      setUserStats(data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur fetchUserStats:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer les repositories de l'utilisateur
  const fetchUserRepositories = useCallback(async () => {
    console.log('fetchUserRepositories appelé avec authUser:', authUser);
    
    // Si l'utilisateur est un invité, utiliser ses repositories locaux
    if (authUser?.isGuest) {
      console.log('Utilisateur invité détecté, utilisation des repositories locaux');
      setUserRepositories(authUser.repos || []);
      return;
    }
    
    if (!authUser?.access_token) {
      console.log('Pas d\'access_token disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Appel API /api/repositories avec token:', authUser.access_token.substring(0, 10) + '...');
      
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: authUser.access_token })
      });

      console.log('Réponse API repositories:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API repositories:', errorData);
        throw new Error('Erreur lors de la récupération des repositories');
      }
      
      const data = await response.json();
      console.log('Données repositories reçues:', data);
      setUserRepositories(data.repositories || []);
    } catch (err) {
      setError(err.message);
      console.error('Erreur fetchUserRepositories:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.access_token, authUser?.isGuest, authUser?.repos]);

  // Fonction pour récupérer les commits d'un repository
  const fetchCommits = useCallback(async (owner, repo) => {
    if (!authUser?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des commits');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchCommits:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer les collaborateurs
  const fetchCollaborators = useCallback(async (owner, repo) => {
    if (!authUser?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCollaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des collaborateurs');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchCollaborators:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer l'activité du repository
  const fetchRepoActivity = useCallback(async (owner, repo) => {
    if (!authUser?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchRepoActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'activité');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchRepoActivity:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer les analytics du repository
  const fetchRepoAnalytics = useCallback(async (owner, repo) => {
    if (!authUser?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchRepoAnalytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des analytics');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchRepoAnalytics:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer l'arborescence des fichiers
  const fetchFileTree = useCallback(async (owner, repo, branch = 'HEAD') => {
    if (!authUser?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCommit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          sha: branch,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'arborescence');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchFileTree:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour récupérer le contenu d'un fichier
  const fetchFileContent = useCallback(async (owner, repo, path, branch = 'main') => {
    if (!authUser?.access_token || !owner || !repo || !path) return null;

    try {
      const response = await fetch('/api/fetchFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          path,
          branch,
          accessToken: authUser.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du contenu du fichier');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchFileContent:', err);
      return null;
    }
  }, [authUser?.access_token]);

  // Fonction pour charger toutes les données d'un repository
  const loadRepositoryData = useCallback(async (owner, repo) => {
    if (!authUser?.access_token || !owner || !repo) return;

    setLoading(true);
    setError(null);

    try {
      // Charger toutes les données en parallèle
      const [
        commitsData,
        collaboratorsData,
        activityData,
        analyticsData,
        fileTreeData
      ] = await Promise.all([
        fetchCommits(owner, repo),
        fetchCollaborators(owner, repo),
        fetchRepoActivity(owner, repo),
        fetchRepoAnalytics(owner, repo),
        fetchFileTree(owner, repo)
      ]);

      // Mettre à jour les données du repository
      setRepoData({
        commits: commitsData,
        collaborators: collaboratorsData,
        issues: activityData?.recentIssues || null,
        pulls: activityData?.recentPulls || null,
        branches: activityData?.recentBranches || null,
        analytics: analyticsData,
        activity: activityData,
        fileTree: fileTreeData,
        languages: analyticsData?.languages || null,
        repoStats: analyticsData?.repoStats || null
      });

    } catch (err) {
      setError(err.message);
      console.error('Erreur loadRepositoryData:', err);
    } finally {
      setLoading(false);
    }
  }, [authUser?.access_token, fetchCommits, fetchCollaborators, fetchRepoActivity, fetchRepoAnalytics, fetchFileTree]);

  // Fonction pour sélectionner un repository
  const selectRepository = useCallback(async (repo) => {
    setSelectedRepo(repo);
    
    if (repo && repo.owner && repo.name) {
      await loadRepositoryData(repo.owner.login || repo.owner, repo.name);
    }
  }, [loadRepositoryData]);

  // Fonction pour rafraîchir les données
  const refreshData = useCallback(async () => {
    if (selectedRepo) {
      await loadRepositoryData(selectedRepo.owner.login || selectedRepo.owner, selectedRepo.name);
    }
    if (authUser?.access_token) {
      await Promise.all([fetchUserStats(), fetchUserRepositories()]);
    }
  }, [selectedRepo, authUser?.access_token, loadRepositoryData, fetchUserStats, fetchUserRepositories]);

  // Fonction pour nettoyer les données
  const clearData = useCallback(() => {
    setRepoData({
      commits: null,
      collaborators: null,
      issues: null,
      pulls: null,
      branches: null,
      analytics: null,
      activity: null,
      fileTree: null,
      languages: null,
      repoStats: null
    });
    setSelectedRepo(null);
    setError(null);
  }, []);

  // Fonction pour mettre à jour l'utilisateur
  const updateUser = useCallback((newUser) => {
    // This function is now managed by AuthProvider, so it should not be called here directly.
    // The AuthProvider will handle setting the user and fetching stats/repos.
  }, []);

  // Effet pour charger les données utilisateur quand l'utilisateur change
  useEffect(() => {
    if (authUser?.access_token) {
      fetchUserStats();
      fetchUserRepositories();
    } else {
      // Nettoyer les données si l'utilisateur se déconnecte
      setUserStats(null);
      setUserRepositories([]);
      clearData();
    }
  }, [authUser?.access_token, fetchUserStats, fetchUserRepositories, clearData]);

  // Effet pour charger les repositories au démarrage si l'utilisateur est déjà connecté
  useEffect(() => {
    console.log('Effet repositories - authUser:', authUser, 'loading:', loading, 'userRepositories.length:', userRepositories.length);
    
    if (authUser && !loading && userRepositories.length === 0 && !authUser.isGuest) {
      console.log('Chargement automatique des repositories');
      fetchUserRepositories();
    } else if (authUser?.isGuest) {
      console.log('Utilisateur invité, utilisation des repositories locaux');
      setUserRepositories(authUser.repos || []);
    }
  }, [authUser, loading, userRepositories.length, fetchUserRepositories]);

  // Valeur du contexte
  const contextValue = {
    // États
    user: authUser, // Use authUser from AuthProvider
    selectedRepo,
    repositories: userRepositories,
    repoData,
    userStats,
    loading,
    error,

    // Actions
    setUser: updateUser, // This action is now managed by AuthProvider
    selectRepository,
    refreshData,
    clearData,
    setError,

    // Fonctions de récupération de données
    fetchCommits,
    fetchCollaborators,
    fetchRepoActivity,
    fetchRepoAnalytics,
    fetchFileTree,
    fetchFileContent,
    loadRepositoryData,

    // États dérivés
    hasUser: !!authUser,
    hasSelectedRepo: !!selectedRepo,
    hasRepoData: Object.values(repoData).some(data => data !== null)
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}; 