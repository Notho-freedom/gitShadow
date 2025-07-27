'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RepositoryInput from './RepositoryInput';
import CodeViewer from './CodeViewer';
import DocumentationPanel from './DocumentationPanel';
import GuestFileExplorer from './GuestFileExplorer';
import GuestCommitHistory from './GuestCommitHistory';

export default function GuestExplorer() {
  const [currentView, setCurrentView] = useState('input'); // 'input', 'explorer', 'documentation'
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

  const handleRepoUrlChange = (url) => {
    setSelectedRepo(url);
    setError('');
  };

  const handleFetchRepo = async (files) => {
    setRepoFiles(files);
    setCurrentView('explorer');
    
    // Extraire les informations du dépôt depuis l'URL
    const urlParts = selectedRepo.split('/');
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];
    
    setRepoData({ owner, repo, url: selectedRepo });
    
    // Récupérer les commits
    try {
      const commitsResponse = await fetch('/api/fetchCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          owner, 
          repo,
          url: selectedRepo 
        })
      });
      
      if (commitsResponse.ok) {
        const commitsData = await commitsResponse.json();
        setCommits(commitsData.commits || []);
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

      setCurrentView('documentation');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);
    // Ici on pourrait charger les fichiers d'un commit spécifique
    // Pour l'instant, on garde la vue actuelle
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
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                 className="mb-8"
               >
                 <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                   Analysez votre dépôt GitHub
                 </h1>
                 <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Commits */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Historique des commits</h3>
                  <GuestCommitHistory
                    commits={commits}
                    onCommitSelect={handleCommitSelect}
                    selectedCommit={selectedCommit}
                  />
                </div>
              </div>

              {/* Files */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">Structure du projet</h3>
                  <GuestFileExplorer
                    files={repoFiles}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    loading={loading}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'documentation' && (
            <motion.div
              key="documentation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Code Viewer */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Code source</h3>
                  <button
                    onClick={handleBackToExplorer}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ← Retour
                  </button>
                </div>
                {selectedFile && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-400">{selectedFile.path}</span>
                  </div>
                )}
                <CodeViewer
                  content={fileContent}
                  file={selectedFile}
                  loading={loading}
                />
              </div>

              {/* Documentation */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Documentation générée</h3>
                <DocumentationPanel
                  documentation={documentation}
                  file={selectedFile ? { ...selectedFile, content: fileContent } : null}
                  repository={repoData}
                />
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
          className="mt-12 p-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl border border-white/10 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Débloquez toutes les fonctionnalités
              </h3>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Connectez-vous pour accéder à l'historique complet, aux analyses avancées, 
                à l'export de documentation et à vos dépôts privés
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Historique complet des commits</span>
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Analyses avancées</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Export de documentation</span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Dépôts privés</span>
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Collaboration équipe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">Sauvegarde automatique</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Se connecter gratuitement
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-8 py-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-300 font-semibold text-lg"
              >
                Voir les tarifs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 