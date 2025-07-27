'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import RepositoryExplorer from './RepositoryExplorer';
import FileTreeExplorer from './FileTreeExplorer';
import CodeEditorWithTree from './CodeEditorWithTree';
import DocumentationPanel from './DocumentationPanel';
import AnalyticsPanel from './AnalyticsPanel';
import CollaborationPanel from './CollaborationPanel';
import SettingsPanel from './SettingsPanel';
import BillingPanel from './BillingPanel';
import QuickActions from './QuickActions';
import NotificationCenter from './NotificationCenter';
import SearchOverlay from './SearchOverlay';
import CheckoutModal from './CheckoutModal';
import UpgradeNotifications from './UpgradeNotifications';
import PaymentSuccessModal from './PaymentSuccessModal';
import RepositoryInput from './RepositoryInput';

export default function Dashboard() {
  const { user, loading, isGuest, updateUser } = useAuth();
  const [activeView, setActiveView] = useState('explorer');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [currentView, setCurrentView] = useState('repos'); // 'repos', 'explorer', 'editor', 'documentation'
  const [repoFiles, setRepoFiles] = useState([]);
  const [documentation, setDocumentation] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [layout, setLayout] = useState('default');
  const [loadingState, setLoadingState] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [guestRepoInput, setGuestRepoInput] = useState('');
  const [guestRepoError, setGuestRepoError] = useState('');

  // Vérifier les paramètres de succès de paiement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const plan = urlParams.get('plan');
    const test = urlParams.get('test');
    
    if (payment === 'success' && plan) {
      setPaymentSuccessData({ plan, isTest: test === 'true' });
      setShowPaymentSuccess(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      alert('Paiement annulé');
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Vérifier si user existe et a les propriétés nécessaires
  if (loading || !user || !user.plan) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre profil...</p>
          {!user && !loading && (
            <p className="text-gray-500 text-sm mt-2">Redirection vers l'authentification...</p>
          )}
        </div>
      </div>
    );
  }

  // Fonction pour vérifier si une fonctionnalité nécessite un upgrade
  const requiresUpgrade = (feature) => {
    if (!user || !user.plan) return false;
    
    // Pour les invités, toutes les fonctionnalités premium sont verrouillées
    if (isGuest) {
      const guestAllowedFeatures = ['repos', 'files', 'commits', 'code'];
      return !guestAllowedFeatures.includes(feature);
    }
    
    // Pour les utilisateurs connectés, vérifier selon le plan
    const premiumFeatures = ['analytics', 'collaboration', 'documentation'];
    return user.plan === 'free' && premiumFeatures.includes(feature);
  };

  // Fonction pour gérer le changement de vue avec vérification d'upgrade
  const handleViewChange = (view) => {
    if (requiresUpgrade(view)) {
      setShowUpgradeNotice(true);
      return;
    }
    setActiveView(view);
    
    // Navigation basée sur la vue sélectionnée
    switch (view) {
      case 'repos':
        setCurrentView('repos');
        break;
      case 'editor':
        if (selectedFile) {
          setCurrentView('editor');
        } else {
          // Si aucun fichier n'est sélectionné, rester dans la vue actuelle
          return;
        }
        break;
      case 'documentation':
        if (documentation) {
          setCurrentView('documentation');
        } else {
          // Si aucune documentation n'est générée, rester dans la vue actuelle
          return;
        }
        break;
      case 'analytics':
        setCurrentView('analytics');
        break;
      case 'collaboration':
        setCurrentView('collaboration');
        break;
      case 'settings':
        setCurrentView('settings');
        break;
      default:
        // Pour les autres vues, garder la vue actuelle
        break;
    }
  };

  const handleUpgrade = () => {
    setShowCheckoutModal(true);
    setShowUpgradeNotice(false);
  };

  const handleGuestRepoAdd = async () => {
    if (!guestRepoInput.trim()) return;

    setLoadingState(true);
    setGuestRepoError('');

    try {
      // Extraire owner et repo de l'URL
      const match = guestRepoInput.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) {
        setGuestRepoError('Format d\'URL invalide. Utilisez: https://github.com/owner/repository');
        return;
      }

      const [, owner, repo] = match;
      const repoName = repo.replace('.git', '');

      // Vérifier si le dépôt existe et est public
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      if (!response.ok) {
        setGuestRepoError('Dépôt non trouvé ou privé. Seuls les dépôts publics sont autorisés.');
        return;
      }

      const repoData = await response.json();
      if (repoData.private) {
        setGuestRepoError('Ce dépôt est privé. Seuls les dépôts publics sont autorisés.');
        return;
      }

      // Ajouter le dépôt à la liste
      const newRepo = {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        owner: repoData.owner,
        default_branch: repoData.default_branch,
        addedAt: new Date().toISOString()
      };

      const updatedRepos = [...(user.repos || []), newRepo];
      updateUser({ ...user, repos: updatedRepos });
      setGuestRepoInput('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du dépôt:', error);
      setGuestRepoError('Erreur lors de l\'ajout du dépôt. Vérifiez l\'URL et réessayez.');
    } finally {
      setLoadingState(false);
    }
  };

  const handleRepoSelect = useCallback((repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
    // Ne pas changer currentView, rester dans RepositoryExplorer
  }, []);

  const handleBackToRepos = useCallback(() => {
    setSelectedRepo(null);
    setSelectedFile(null);
    setFileContent('');
    setRepoFiles([]);
    setCurrentView('repos');
    setActiveView('repos');
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setSelectedFile(null);
    setFileContent('');
    setCurrentView('explorer');
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    setLoadingState(true);

    try {
      const response = await fetch('/api/fetchFileContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: selectedRepo.owner?.login || selectedRepo.owner,
          repo: selectedRepo.name,
          path: file.path,
          branch: selectedRepo.default_branch || 'main',
          accessToken: user.access_token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFileContent(data.content);
          setCurrentView('editor');
        } else {
          throw new Error(data.error || 'Erreur lors du chargement du fichier');
        }
      } else {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      setFileContent(`// Erreur: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [selectedRepo, user.access_token]);

  // Fonction pour récupérer les fichiers du RepositoryExplorer
  const handleRepoFilesUpdate = useCallback((files) => {
    setRepoFiles(files);
  }, []);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!selectedFile || !fileContent) return;

    setLoadingState(true);
    try {
      const response = await fetch('/api/generateDoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fileContent,
          filename: selectedFile.name,
          filepath: selectedFile.path,
          repo: selectedRepo.name,
          user: user.login
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentation(data.documentation);
        setCurrentView('documentation');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de documentation:', error);
    } finally {
      setLoadingState(false);
    }
  }, [selectedFile, fileContent, selectedRepo, user]);

  const renderMainContent = () => {
    switch (currentView) {
      case 'repos':
        if (isGuest) {
          return (
            <div className="space-y-6">
              {/* Header pour les invités */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-yellow-400 text-2xl">👤</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">Mode Invité</h2>
                    <p className="text-yellow-300 text-sm">
                      {user.repos?.length || 0}/{user.maxRepos} dépôts utilisés
                    </p>
                  </div>
                </div>
                <p className="text-yellow-200 text-sm mb-4">
                  En mode invité, vous pouvez explorer jusqu'à {user.maxRepos} dépôts publics. 
                  Connectez-vous pour accéder à tous vos dépôts et fonctionnalités premium.
                </p>
              </div>

              {/* Ajout de dépôt pour invités */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Ajouter un dépôt public</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={guestRepoInput}
                    onChange={(e) => setGuestRepoInput(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleGuestRepoAdd}
                    disabled={loadingState || !guestRepoInput}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loadingState ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
                {guestRepoError && (
                  <p className="text-red-400 text-sm mt-2">{guestRepoError}</p>
                )}
              </div>

              {/* Liste des dépôts invités */}
              {user.repos && user.repos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Vos dépôts</h3>
                  <div className="grid gap-4">
                    {user.repos.map((repo) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleRepoSelect(repo)}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedRepos = user.repos.filter(r => r.id !== repo.id);
                              updateUser({ ...user, repos: updatedRepos });
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message si aucun dépôt */}
              {(!user.repos || user.repos.length === 0) && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Aucun dépôt ajouté</h3>
                  <p className="text-gray-400">
                    Ajoutez un dépôt GitHub public pour commencer à explorer votre code
                  </p>
                </div>
              )}
            </div>
          );
        }
        
        return (
          <RepositoryExplorer
            user={user}
            selectedRepo={selectedRepo}
            onRepoSelect={handleRepoSelect}
            onFileSelect={handleFileSelect}
            loading={loadingState}
            onFilesUpdate={handleRepoFilesUpdate}
          />
        );

      case 'explorer':
        if (!selectedRepo) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun dépôt sélectionné</h3>
              <p className="text-gray-400">
                Sélectionnez un dépôt pour explorer ses fichiers
              </p>
            </div>
          );
        }

        return (
          <FileTreeExplorer
            user={user}
            selectedRepo={selectedRepo}
            onFileSelect={handleFileSelect}
            onBackToRepos={handleBackToRepos}
            loading={loadingState}
          />
        );

      case 'editor':
        if (!selectedFile) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💻</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun fichier sélectionné</h3>
              <p className="text-gray-400">
                Sélectionnez un fichier pour voir son contenu
              </p>
            </div>
          );
        }

        return (
          <CodeEditorWithTree
            file={selectedFile}
            content={fileContent}
            onGenerateDoc={handleGenerateDocumentation}
            loading={loadingState}
            theme={theme}
            onBackToExplorer={handleBackToExplorer}
            onFileSelect={handleFileSelect}
            files={repoFiles}
            selectedRepo={selectedRepo}
            user={user}
          />
        );

      case 'documentation':
        return (
          <DocumentationPanel
            file={selectedFile}
            content={fileContent}
            documentation={documentation}
            onBackToEditor={() => setCurrentView('editor')}
            theme={theme}
          />
        );

      case 'analytics':
        return <AnalyticsPanel user={user} selectedRepo={selectedRepo} />;
      case 'collaboration':
        return <CollaborationPanel user={user} selectedRepo={selectedRepo} />;
      case 'settings':
        return (
          <SettingsPanel
            user={user}
            theme={theme}
            setTheme={setTheme}
            layout={layout}
            setLayout={setLayout}
          />
        );
      case 'billing':
        return (
          <BillingPanel
            user={user}
            onUpgrade={() => setShowCheckoutModal(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        user={user}
        selectedRepo={selectedRepo}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar
          user={user}
          selectedRepo={selectedRepo}
          selectedFile={selectedFile}
          activeView={currentView}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationOpen={() => setIsNotificationOpen(true)}
          theme={theme}
          layout={layout}
          onLayoutChange={setLayout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quick Actions Floating Panel */}
        <QuickActions
          activeView={currentView}
          selectedFile={selectedFile}
          onGenerateDoc={handleGenerateDocumentation}
          loading={loadingState}
        />
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        user={user}
        selectedRepo={selectedRepo}
        onFileSelect={handleFileSelect}
      />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        user={user}
      />

      {/* Modals */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        user={user}
      />

      <UpgradeNotifications
        isOpen={showUpgradeNotice}
        onClose={() => setShowUpgradeNotice(false)}
        onUpgrade={handleUpgrade}
        user={user}
      />

      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        data={paymentSuccessData}
      />
    </div>
  );
}
