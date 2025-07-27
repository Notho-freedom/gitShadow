'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { useData } from './DataProvider';
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
import PromotionPopup from './PromotionPopup';

export default function Dashboard() {
  const { user, loading, isGuest, updateUser } = useAuth();
  const { 
    selectedRepo, 
    selectRepository, 
    loading: dataLoading, 
    error: dataError,
    hasSelectedRepo,
    hasRepoData
  } = useData();
  
  const [activeView, setActiveView] = useState('explorer');
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

  // Synchroniser l'utilisateur avec le DataProvider
  useEffect(() => {
    if (user && !isGuest) {
      // L'utilisateur est déjà géré par le DataProvider via AuthProvider
    }
  }, [user, isGuest]);

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
      const guestAllowedFeatures = ['repos', 'files', 'commits', 'code', 'explorer'];
      return !guestAllowedFeatures.includes(feature);
    }
    
    // Définir les fonctionnalités par plan
    const planFeatures = {
      free: ['repos', 'files', 'commits', 'code', 'explorer', 'editor'],
      pro: ['repos', 'files', 'commits', 'code', 'explorer', 'editor', 'analytics', 'collaboration', 'documentation', 'search'],
      enterprise: ['repos', 'files', 'commits', 'code', 'explorer', 'editor', 'analytics', 'collaboration', 'documentation', 'search', 'advanced_analytics', 'team_management', 'custom_integrations', 'format', 'share']
    };
    
    const currentPlanFeatures = planFeatures[user.plan] || planFeatures.free;
    return !currentPlanFeatures.includes(feature);
  };

  // Fonction pour vérifier et afficher la popup d'upgrade
  const checkAndShowUpgrade = (feature) => {
    if (requiresUpgrade(feature)) {
      setShowUpgradeNotice(true);
      return true; // Indique qu'un upgrade est nécessaire
    }
    return false; // Indique qu'aucun upgrade n'est nécessaire
  };

  // Fonction pour gérer le changement de vue avec vérification d'upgrade
  const handleViewChange = (view) => {
    if (checkAndShowUpgrade(view)) {
      return; // Arrêter ici si un upgrade est nécessaire
    }
    setActiveView(view);
  };

  // Fonction pour gérer la sélection d'un repository
  const handleRepoSelect = async (repo) => {
    try {
      setLoadingState(true);
      await selectRepository(repo);
      setCurrentView('explorer');
      setActiveView('explorer');
    } catch (error) {
      console.error('Erreur lors de la sélection du repository:', error);
    } finally {
      setLoadingState(false);
    }
  };

  // Fonction pour gérer l'upgrade
  const handleUpgrade = () => {
    setShowCheckoutModal(true);
    setShowUpgradeNotice(false);
  };

  // Fonction pour gérer l'ajout d'un repository invité
  const handleGuestRepoAdd = async () => {
    if (!guestRepoInput.trim()) {
      setGuestRepoError('Veuillez entrer un nom de repository valide');
      return;
    }

    try {
      setLoadingState(true);
      setGuestRepoError('');

      // Créer un objet repository pour les invités
      const guestRepo = {
        name: guestRepoInput,
        owner: { login: 'guest' },
        full_name: `guest/${guestRepoInput}`,
        description: 'Repository invité',
        private: false,
        fork: false,
        stargazers_count: 0,
        watchers_count: 0,
        language: null,
        default_branch: 'main',
        updated_at: new Date().toISOString()
      };

      await selectRepository(guestRepo);
      setGuestRepoInput('');
      setCurrentView('explorer');
      setActiveView('explorer');
    } catch (error) {
      setGuestRepoError('Erreur lors de l\'ajout du repository');
      console.error('Erreur handleGuestRepoAdd:', error);
    } finally {
      setLoadingState(false);
    }
  };

  const handleBackToRepos = useCallback(() => {
    setCurrentView('repos');
    setActiveView('repos');
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setSelectedFile(null);
    setFileContent('');
    setCurrentView('explorer');
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    if (!selectedRepo) return;

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
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loadingState ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
                {guestRepoError && (
                  <p className="text-red-400 text-sm mt-2">{guestRepoError}</p>
                )}
              </div>

              {/* Liste des dépôts invités */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Dépôts explorés</h3>
                {user.repos && user.repos.length > 0 ? (
                  <div className="space-y-3">
                    {user.repos.map((repo, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{repo.full_name}</h4>
                            <p className="text-gray-400 text-sm">{repo.description || 'Aucune description'}</p>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {new Date(repo.addedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    Aucun dépôt ajouté. Ajoutez un dépôt public pour commencer.
                  </p>
                )}
              </div>
            </div>
          );
        }

        return (
          <RepositoryExplorer
            onRepoSelect={handleRepoSelect}
            onFilesUpdate={handleRepoFilesUpdate}
            loading={loadingState}
          />
        );

      case 'explorer':
        if (!hasSelectedRepo) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun repository sélectionné</h3>
                <p className="text-gray-400">Sélectionnez un repository pour commencer l'exploration</p>
              </div>
            </div>
          );
        }

        return (
          <FileTreeExplorer
            repository={selectedRepo}
            onFileSelect={handleFileSelect}
            onBackToRepos={handleBackToRepos}
            loading={loadingState}
          />
        );

      case 'editor':
        if (!selectedFile || !fileContent) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun fichier sélectionné</h3>
                <p className="text-gray-400">Sélectionnez un fichier pour l'éditer</p>
              </div>
            </div>
          );
        }

        return (
          <CodeEditorWithTree
            file={selectedFile}
            content={fileContent}
            repository={selectedRepo}
            onGenerateDocumentation={handleGenerateDocumentation}
            onBackToExplorer={() => setCurrentView('explorer')}
            loading={loadingState}
          />
        );

      case 'documentation':
        if (!documentation) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucune documentation générée</h3>
                <p className="text-gray-400">Générez de la documentation à partir d'un fichier</p>
              </div>
            </div>
          );
        }

        return (
          <DocumentationPanel
            documentation={documentation}
            file={selectedFile}
            repository={selectedRepo}
            onBackToEditor={() => setCurrentView('editor')}
          />
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Vue non trouvée</h3>
              <p className="text-gray-400">Cette vue n'existe pas</p>
            </div>
          </div>
        );
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
        checkAndShowUpgrade={checkAndShowUpgrade}
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
          checkAndShowUpgrade={checkAndShowUpgrade}
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
          checkAndShowUpgrade={checkAndShowUpgrade}
        />
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        user={user}
        selectedRepo={selectedRepo}
        onFileSelect={handleFileSelect}
        checkAndShowUpgrade={checkAndShowUpgrade}
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

      {/* Promotion Popup */}
      <PromotionPopup
        user={user}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}
