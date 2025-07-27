'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import RepositoryInput from './RepositoryInput';
import FileTreeExplorer from './FileTreeExplorer';
import CodeViewer from './CodeViewer';
import CommitHistory from './CommitHistory';

export default function GuestDashboard() {
  const { user, updateUser } = useAuth();
  const [activeView, setActiveView] = useState('repository');
  const [currentRepo, setCurrentRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const menuItems = [
    { id: 'repository', name: 'Dépôt', icon: '📁' },
    { id: 'files', name: 'Fichiers', icon: '📄', disabled: !currentRepo },
    { id: 'commits', name: 'Historique', icon: '📝', disabled: !currentRepo },
    { id: 'code', name: 'Code', icon: '💻', disabled: !currentRepo }
  ];

  const handleRepositorySubmit = async (repoUrl) => {
    setLoading(true);
    setError('');

    try {
      // Extraire owner et repo de l'URL GitHub
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        throw new Error('URL GitHub invalide');
      }

      const [, owner, repo] = match;
      const cleanRepo = repo.replace('.git', '');

      // Vérifier si l'utilisateur a déjà atteint la limite
      const currentRepos = user.repos || [];
      if (currentRepos.length >= user.maxRepos) {
        throw new Error(`Limite atteinte (${user.maxRepos} dépôts maximum)`);
      }

      // Vérifier si le dépôt est public
      const response = await fetch(`/api/fetchRepo?owner=${owner}&repo=${cleanRepo}`);
      if (!response.ok) {
        throw new Error('Dépôt non trouvé ou privé (seuls les dépôts publics sont autorisés)');
      }

      const repoData = await response.json();
      
      if (repoData.private) {
        throw new Error('Seuls les dépôts publics sont autorisés en mode invité');
      }

      // Ajouter le dépôt à la liste
      const newRepo = {
        id: `${owner}/${cleanRepo}`,
        name: cleanRepo,
        owner: owner,
        full_name: `${owner}/${cleanRepo}`,
        private: false,
        description: repoData.description || '',
        html_url: repoData.html_url,
        addedAt: new Date().toISOString()
      };

      const updatedRepos = [...currentRepos, newRepo];
      const updatedUser = { ...user, repos: updatedRepos };
      
      updateUser(updatedUser);
      setCurrentRepo(newRepo);
      setActiveView('files');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeRepository = (repoId) => {
    const updatedRepos = user.repos.filter(repo => repo.id !== repoId);
    updateUser({ ...user, repos: updatedRepos });
    
    if (currentRepo && currentRepo.id === repoId) {
      setCurrentRepo(null);
      setActiveView('repository');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'repository':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Ajouter un dépôt</h2>
              <p className="text-gray-400">
                Collez l'URL d'un dépôt GitHub public pour commencer
              </p>
            </div>

            <RepositoryInput 
              onSubmit={handleRepositorySubmit}
              loading={loading}
              error={error}
              placeholder="https://github.com/owner/repository"
            />

            {/* Liste des dépôts existants */}
            {user.repos && user.repos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Vos dépôts ({user.repos.length}/{user.maxRepos})
                </h3>
                <div className="grid gap-4">
                  {user.repos.map((repo) => (
                    <motion.div
                      key={repo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{repo.full_name}</h4>
                          {repo.description && (
                            <p className="text-gray-400 text-sm mt-1">{repo.description}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-2">
                            Ajouté le {new Date(repo.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentRepo(repo)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Ouvrir
                          </button>
                          <button
                            onClick={() => removeRepository(repo.id)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'files':
        return currentRepo ? (
          <FileTreeExplorer 
            owner={currentRepo.owner}
            repo={currentRepo.name}
            isGuest={true}
          />
        ) : null;

      case 'commits':
        return currentRepo ? (
          <CommitHistory 
            owner={currentRepo.owner}
            repo={currentRepo.name}
            isGuest={true}
          />
        ) : null;

      case 'code':
        return currentRepo ? (
          <CodeViewer 
            owner={currentRepo.owner}
            repo={currentRepo.name}
            isGuest={true}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Mode Invité</h1>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                {user.repos?.length || 0}/{user.maxRepos} dépôts
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                {user.name}
              </span>
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveView(item.id)}
                disabled={item.disabled}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === item.id
                    ? 'border-blue-500 text-blue-400'
                    : item.disabled
                    ? 'border-transparent text-gray-500 cursor-not-allowed'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Current Repository Info */}
      {currentRepo && (
        <div className="bg-gray-800/30 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-400">📁</span>
                <span className="text-white font-medium">{currentRepo.full_name}</span>
                <a
                  href={currentRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Voir sur GitHub
                </a>
              </div>
              <button
                onClick={() => {
                  setCurrentRepo(null);
                  setActiveView('repository');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>

      {/* Guest Mode Notice */}
      <div className="fixed bottom-4 right-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div>
            <h4 className="text-yellow-400 font-medium text-sm">Mode Invité</h4>
            <p className="text-yellow-300 text-xs mt-1">
              Vos données sont sauvegardées localement. 
              Connectez-vous pour synchroniser avec GitHub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 