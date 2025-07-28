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
      <div className="bg-black/20 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 sticky top-20 z-40">
        <div className="w-full flex items-center justify-between">
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
                className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-sm"
              >
                Analyser un autre dépôt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bannière d'upgrade - seulement en mode éditeur */}
      {currentView === 'editor' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Débloquez toutes les fonctionnalités</h3>
                <p className="text-gray-300 text-xs">Connectez-vous pour accéder à l'historique complet et aux analyses avancées</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-xs font-medium"
              >
                Se connecter
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-200 text-xs"
              >
                Tarifs
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contenu principal - largeur conditionnelle */}
      <div className={currentView === 'editor' ? 'w-full px-2 sm:px-4 lg:px-6 py-4 lg:py-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'}>
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
              className="grid grid-cols-1 xl:grid-cols-5 gap-2 lg:gap-4"
            >
              {/* Commits */}
              <div className="xl:col-span-1 lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3 flex-shrink-0">Historique des commits</h3>
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
              <div className="xl:col-span-4 lg:col-span-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3 flex-shrink-0">Structure du projet</h3>
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
              className="grid grid-cols-1 xl:grid-cols-12 gap-2 lg:gap-4"
            >
              {/* Navigation des fichiers - Responsive */}
              <div className="xl:col-span-3 lg:col-span-4 md:col-span-5">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3 flex-shrink-0">Autres fichiers</h3>
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
              <div className="xl:col-span-6 lg:col-span-5 md:col-span-7">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between mb-3 flex-shrink-0">
                    <h3 className="text-base lg:text-lg font-semibold text-white">Code source</h3>
                    <button
                      onClick={handleBackToExplorer}
                      className="text-gray-400 hover:text-white transition-colors text-xs lg:text-sm px-2 py-1 bg-white/5 rounded hover:bg-white/10"
                    >
                      ← Retour à l'explorateur
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mb-2 flex-shrink-0 p-2 bg-white/5 rounded">
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
              <div className="xl:col-span-3 lg:col-span-3 md:col-span-12">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 lg:p-4 border border-white/10 h-[calc(100vh-16rem)] overflow-hidden flex flex-col shadow-2xl">
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-3 flex-shrink-0">Documentation générée</h3>
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
      </div>

      {/* Footer - seulement quand pas en mode éditeur */}
      {currentView !== 'editor' && (
        <footer className="bg-black/40 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Logo et description */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">⚡</span>
                  </div>
                  <span className="text-2xl font-bold text-white">gitShadow</span>
                </div>
                <p className="text-gray-300 mb-6 max-w-md">
                  Générateur de documentation IA pour vos dépôts GitHub. 
                  Analysez votre code et créez une documentation intelligente automatiquement.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Liens rapides */}
              <div>
                <h4 className="text-white font-semibold mb-4">Produit</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aide</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Statut</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Communauté</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 gitShadow. Tous droits réservés.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Confidentialité</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Conditions</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      )}

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