import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
  // États globaux
  const [user, setUser] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repositories, setRepositories] = useState([]);
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
    if (!user?.access_token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/userStats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: user.access_token })
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
  }, [user?.access_token]);

  // Fonction pour récupérer les repositories de l'utilisateur
  const fetchUserRepositories = useCallback(async () => {
    if (!user?.access_token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: user.access_token })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des repositories');
      
      const data = await response.json();
      setUserRepositories(data.repositories || []);
    } catch (err) {
      setError(err.message);
      console.error('Erreur fetchUserRepositories:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  // Fonction pour récupérer les commits d'un repository
  const fetchCommits = useCallback(async (owner, repo) => {
    if (!user?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des commits');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchCommits:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour récupérer les collaborateurs
  const fetchCollaborators = useCallback(async (owner, repo) => {
    if (!user?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCollaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des collaborateurs');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchCollaborators:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour récupérer l'activité du repository
  const fetchRepoActivity = useCallback(async (owner, repo) => {
    if (!user?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchRepoActivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'activité');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchRepoActivity:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour récupérer les analytics du repository
  const fetchRepoAnalytics = useCallback(async (owner, repo) => {
    if (!user?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchRepoAnalytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des analytics');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchRepoAnalytics:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour récupérer l'arborescence des fichiers
  const fetchFileTree = useCallback(async (owner, repo, branch = 'HEAD') => {
    if (!user?.access_token || !owner || !repo) return null;

    try {
      const response = await fetch('/api/fetchCommit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          sha: branch,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'arborescence');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchFileTree:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour récupérer le contenu d'un fichier
  const fetchFileContent = useCallback(async (owner, repo, path, branch = 'main') => {
    if (!user?.access_token || !owner || !repo || !path) return null;

    try {
      const response = await fetch('/api/fetchFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          path,
          branch,
          accessToken: user.access_token
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération du contenu du fichier');
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erreur fetchFileContent:', err);
      return null;
    }
  }, [user?.access_token]);

  // Fonction pour charger toutes les données d'un repository
  const loadRepositoryData = useCallback(async (owner, repo) => {
    if (!user?.access_token || !owner || !repo) return;

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
  }, [user?.access_token, fetchCommits, fetchCollaborators, fetchRepoActivity, fetchRepoAnalytics, fetchFileTree]);

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
    if (user?.access_token) {
      await Promise.all([fetchUserStats(), fetchUserRepositories()]);
    }
  }, [selectedRepo, user?.access_token, loadRepositoryData, fetchUserStats, fetchUserRepositories]);

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
    setUser(newUser);
    if (newUser) {
      fetchUserStats();
      fetchUserRepositories();
    } else {
      clearData();
    }
  }, [fetchUserStats, fetchUserRepositories, clearData]);

  // Effet pour charger les données utilisateur quand l'utilisateur change
  useEffect(() => {
    if (user?.access_token) {
      fetchUserStats();
      fetchUserRepositories();
    }
  }, [user?.access_token, fetchUserStats, fetchUserRepositories]);

  // Valeur du contexte
  const contextValue = {
    // États
    user,
    selectedRepo,
    repositories: userRepositories,
    repoData,
    userStats,
    loading,
    error,

    // Actions
    setUser: updateUser,
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
    hasUser: !!user,
    hasSelectedRepo: !!selectedRepo,
    hasRepoData: Object.values(repoData).some(data => data !== null)
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}; 