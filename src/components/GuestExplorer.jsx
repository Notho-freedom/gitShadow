'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RepositoryInput from './RepositoryInput';
import CodeViewer from './CodeViewer';
import DocumentationPanel from './DocumentationPanel';
import GuestFileExplorer from './GuestFileExplorer';
import GuestCommitHistory from './GuestCommitHistory';

export default function GuestExplorer() {
  const [currentView, setCurrentView] = useState('input'); // 'input', 'explorer', 'editor'
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);
  const [commits, setCommits] = useState([]);
  const [repoData, setRepoData] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Afficher la modale d'upgrade après 5 secondes si on est dans la vue explorateur
  useEffect(() => {
    if (currentView === 'explorer' && commits.length > 0) {
      const timer = setTimeout(() => {
        setShowUpgradeModal(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentView, commits]);

  const handleRepoUrlChange = (url) => {
    setSelectedRepo(url);
    setError('');
  };

  const handleFetchRepo = async (files, repoUrl) => {
    setRepoFiles(files);
    setCurrentView('explorer');
    
    // Utiliser l'URL passée en paramètre ou selectedRepo
    const urlToUse = repoUrl || selectedRepo;
    
    if (!urlToUse) {
      console.error('Aucune URL de dépôt fournie');
      return;
    }
    
    // Extraire les informations du dépôt depuis l'URL
    const urlParts = urlToUse.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];
    
    setRepoData({ owner, repo, url: urlToUse });
    setSelectedRepo(urlToUse);
    
    // Récupérer les commits
    try {
      const commitsResponse = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          owner, 
          repo
        })
      });
      
      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json();
        const commitsList = commitsData.commits || [];
        setCommits(commitsList);
        
        // Sélectionner automatiquement le premier commit
        if (commitsList.length > 0) {
          setSelectedCommit(commitsList[0]);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des commits:', err);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    setError('');

    try {
      // Récupérer le contenu du fichier
      const contentResponse = await fetch('/api/fetchFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: repoData.owner,
          repo: repoData.repo,
          path: file.path,
          url: repoData.url
        })
      });

      if (!contentResponse.ok) {
        throw new Error('Erreur lors de la récupération du contenu du fichier');
      }

      const contentData = await contentResponse.json();
      setFileContent(contentData.content || '');

      // Générer la documentation pour ce fichier
      const docResponse = await fetch('/api/generateDoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentData.content,
          filename: file.name,
          path: file.path,
          language: getFileLanguage(file.name)
        })
      });

      if (docResponse.ok) {
        const docData = await docResponse.json();
        setDocumentation(docData.documentation || '');
      }

      setCurrentView('editor');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSelect = async (commit) => {
    setSelectedCommit(commit);
    setLoading(true);
    
    try {
      // Charger les fichiers du commit sélectionné
      const response = await fetch('/api/fetchRepo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: selectedRepo,
          commit: commit.sha 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRepoFiles(data.tree || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des fichiers du commit:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFileLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'txt': 'text'
    };
    return languageMap[ext] || 'text';
  };

  const handleBackToInput = () => {
    // Si on est à la vue input, on retourne à la page d'accueil
    if (currentView === 'input') {
      window.location.href = '/';
      return;
    }
    
    setCurrentView('input');
    setSelectedRepo(null);
    setSelectedFile(null);
    setSelectedCommit(null);
    setFileContent('');
    setDocumentation('');
    setRepoFiles([]);
    setCommits([]);
    setRepoData(null);
    setError('');
  };

  const handleBackToExplorer = () => {
    setCurrentView('explorer');
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
  };

  // Fonction pour afficher la modale d'upgrade
  const handleShowUpgradeModal = () => {
    setShowUpgradeModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20">
      {/* Header */}
      <div className="bg-black/20 border-b border-white/10 px-6 py-4 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToInput}
              className="text-white hover:text-blue-400 transition-colors"
            >
              {currentView === 'input' ? '← Accueil' : '← Retour'}
            </button>
            {repoData && (
              <div className="text-white">
                <span className="text-gray-400">Analyse de :</span>
                <span className="ml-2 font-medium">{repoData.owner}/{repoData.repo}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Bouton retour ajouté ici pour plus de visibilité */}
            {currentView !== 'input' && (
              <button
                onClick={handleBackToInput}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Analyser un autre dépôt
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <AnimatePresence mode="wait">
          {currentView === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Analysez votre dépôt GitHub
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Collez l'URL de votre dépôt GitHub pour générer automatiquement une documentation intelligente 
                  et explorer votre code avec l'IA
                </p>
              </motion.div>
              
              <RepositoryInput
                onRepoUrlChange={handleRepoUrlChange}
                onFetchRepo={handleFetchRepo}
                loading={loading}
                setLoading={setLoading}
              />
            </motion.div>
          )}

          {currentView === 'explorer' && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6"
            >
              {/* Commits */}
              <div className="xl:col-span-1">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex-shrink-0">Historique des commits</h3>
                  <div className="flex-1 overflow-y-auto">
                    <GuestCommitHistory
                      commits={commits}
                      onCommitSelect={handleCommitSelect}
                      selectedCommit={selectedCommit}
                      onShowUpgradeModal={handleShowUpgradeModal}
                    />
                  </div>
                </div>
              </div>

              {/* Files */}
              <div className="xl:col-span-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex-shrink-0">Structure du projet</h3>
                  <div className="flex-1 overflow-y-auto">
                    <GuestFileExplorer
                      files={repoFiles}
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-10 gap-4 lg:gap-6"
            >
              {/* Navigation des fichiers - Responsive */}
              <div className="xl:col-span-2 lg:col-span-3 md:col-span-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex-shrink-0">Autres fichiers</h3>
                  <div className="flex-1 overflow-y-auto">
                    <GuestFileExplorer
                      files={repoFiles}
                      onFileSelect={handleFileSelect}
                      selectedFile={selectedFile}
                      loading={false}
                    />
                  </div>
                </div>
              </div>

              {/* Code Viewer - Responsive */}
              <div className="xl:col-span-6 lg:col-span-5 md:col-span-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">Code source</h3>
                    <button
                      onClick={handleBackToExplorer}
                      className="text-gray-400 hover:text-white transition-colors text-xs lg:text-sm px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10"
                    >
                      ← Retour à l'explorateur
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mb-3 flex-shrink-0 p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-gray-400 break-all font-mono">{selectedFile.path}</span>
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <CodeViewer
                      content={fileContent}
                      file={selectedFile}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Documentation - Responsive */}
              <div className="xl:col-span-2 lg:col-span-2 md:col-span-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 flex-shrink-0">Documentation générée</h3>
                  <div className="flex-1 overflow-hidden">
                    <DocumentationPanel
                      documentation={documentation}
                      file={selectedFile ? { ...selectedFile, content: fileContent } : null}
                      repository={repoData}
                      user={{ plan: 'free', isGuest: true }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Upgrade Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 lg:p-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-3xl border border-white/10 backdrop-blur-sm shadow-2xl"
        >
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 lg:mb-12">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-2xl">
                <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">
                Débloquez toutes les fonctionnalités
              </h3>
              <p className="text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Connectez-vous pour accéder à l'historique complet, aux analyses avancées, 
                à l'export de documentation et à vos dépôts privés
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-8 lg:mb-12">
              <div className="p-6 lg:p-8 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Historique complet des commits</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Analyses avancées</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Export de documentation</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 lg:p-8 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Dépôts privés</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Collaboration équipe</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-semibold text-lg">Sauvegarde automatique</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-xl transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                Se connecter gratuitement
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-10 py-5 border-2 border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold text-xl"
              >
                Voir les tarifs
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modale d'upgrade */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                {/* Icône */}
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                {/* Titre */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  Débloquez l'historique complet
                </h3>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Vous ne voyez que les 5 commits les plus récents. 
                  Connectez-vous pour accéder à l'historique complet et à toutes les fonctionnalités avancées.
                </p>

                {/* Fonctionnalités */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Historique complet des commits</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Analyses techniques avancées</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Export de documentation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm">Dépôts privés</span>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      window.location.href = '/auth';
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Se connecter gratuitement
                  </button>
                  <button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      window.location.href = '/pricing';
                    }}
                    className="flex-1 px-6 py-3 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold"
                  >
                    Voir les tarifs
                  </button>
                </div>

                {/* Bouton fermer */}
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Continuer en mode invité
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 