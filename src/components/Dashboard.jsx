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
  const [activeView, setActiveView] = useState('repos');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
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
    
    if (payment === 'success' && plan) {
      setPaymentSuccessData({ plan, isTest: false });
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
  };

  // Fonction pour gérer l'upgrade
  const handleUpgrade = () => {
    setShowCheckoutModal(true);
    setShowUpgradeNotice(false);
  };

  // Fonction pour ajouter un dépôt en mode invité
  const handleGuestRepoAdd = async () => {
    setLoadingState(true);
    setGuestRepoError('');

    try {
      // Extraire owner et repo de l'URL GitHub
      const match = guestRepoInput.match(/github\.com\/([^\/]+)\/([^\/]+)/);
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
      setSelectedRepo(newRepo);
      setGuestRepoInput('');
      setActiveView('files');

    } catch (err) {
      setGuestRepoError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleRepoSelect = useCallback((repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    setLoadingState(true);

    try {
      const response = await fetch(`/api/fetchFileContent?owner=${selectedRepo.owner}&repo=${selectedRepo.name}&path=${file.path}&ref=${selectedRepo.default_branch || 'main'}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du contenu du fichier');
      }

      const data = await response.json();
      setFileContent(data.content || '');
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier:', error);
      setFileContent(`// Erreur: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [selectedRepo, user.access_token]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!selectedFile || !fileContent || !selectedRepo) {
      alert('Veuillez sélectionner un fichier pour générer la documentation');
      return;
    }

    if (requiresUpgrade('documentation')) {
      setShowUpgradeNotice(true);
      return;
    }

    setLoadingState(true);
    try {
      const response = await fetch('/api/generateDoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent,
          fileName: selectedFile.name,
          repoName: selectedRepo.name,
          userPlan: user.plan
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de documentation');
      }

      const data = await response.json();
      setDocumentation(data.documentation || 'Documentation générée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération de documentation:', error);
      setDocumentation('Erreur lors de la génération de documentation');
    } finally {
      setLoadingState(false);
    }
  }, [selectedFile, fileContent, selectedRepo, user]);

  const handleBackToRepos = () => {
    setSelectedRepo(null);
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
    setActiveView('repos');
  };

  const handleBackToExplorer = () => {
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
    setActiveView('files');
  };

  const renderMainContent = () => {
    switch (activeView) {
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
            onRepoSelect={handleRepoSelect}
            onFileSelect={handleFileSelect}
            loading={loadingState}
          />
        );

      case 'files':
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
            owner={selectedRepo.owner}
            repo={selectedRepo.name}
            onFileSelect={handleFileSelect}
            onBackToRepos={handleBackToRepos}
            loading={loadingState}
            isGuest={isGuest}
          />
        );

      case 'code':
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
            isGuest={isGuest}
          />
        );

      case 'documentation':
        if (requiresUpgrade('documentation')) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Fonctionnalité verrouillée</h3>
              <p className="text-gray-400 mb-6">
                La génération de documentation est disponible pour les utilisateurs connectés
              </p>
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Se connecter pour débloquer
              </button>
            </div>
          );
        }

        return (
          <DocumentationPanel
            documentation={documentation}
            selectedFile={selectedFile}
            onGenerateDoc={handleGenerateDocumentation}
            loading={loadingState}
          />
        );

      case 'analytics':
        if (requiresUpgrade('analytics')) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics Premium</h3>
              <p className="text-gray-400 mb-6">
                Les analytics avancées sont disponibles avec un plan payant
              </p>
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Passer au Pro
              </button>
            </div>
          );
        }

        return <AnalyticsPanel user={user} />;

      case 'collaboration':
        if (requiresUpgrade('collaboration')) {
          return (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Collaboration en équipe</h3>
              <p className="text-gray-400 mb-6">
                La collaboration en équipe est disponible avec un plan payant
              </p>
              <button
                onClick={handleUpgrade}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Passer au Pro
              </button>
            </div>
          );
        }

        return <CollaborationPanel user={user} />;

      case 'settings':
        return (
          <SettingsPanel
            user={user}
            theme={theme}
            setTheme={setTheme}
            layout={layout}
            setLayout={setLayout}
            onLogout={() => {}} // onLogout is now handled by AuthProvider
          />
        );

      case 'billing':
        return (
          <BillingPanel
            user={user}
            onUpgrade={handleUpgrade}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">Bienvenue sur gitShadow</h3>
            <p className="text-gray-400">
              Sélectionnez une option dans le menu pour commencer
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        isGuest={isGuest}
        onUpgrade={handleUpgrade}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar
          user={user}
          isGuest={isGuest}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationOpen={() => setIsNotificationOpen(true)}
          onLogout={() => {}} // onLogout is now handled by AuthProvider
          theme={theme}
          layout={layout}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderMainContent()}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions
          selectedRepo={selectedRepo}
          selectedFile={selectedFile}
          onGenerateDoc={handleGenerateDocumentation}
          loading={loadingState}
        />
      </div>

      {/* Modals and Overlays */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchOverlay
            onClose={() => setIsSearchOpen(false)}
            user={user}
          />
        )}

        {isNotificationOpen && (
          <NotificationCenter
            onClose={() => setIsNotificationOpen(false)}
            onUpgrade={handleUpgrade}
            user={user}
          />
        )}

        {showCheckoutModal && (
          <CheckoutModal
            isOpen={showCheckoutModal}
            onClose={() => setShowCheckoutModal(false)}
          />
        )}

        {showPaymentSuccess && (
          <PaymentSuccessModal
            isOpen={showPaymentSuccess}
            onClose={() => setShowPaymentSuccess(false)}
            data={paymentSuccessData}
          />
        )}
      </AnimatePresence>

      {/* Upgrade Notifications */}
      <UpgradeNotifications user={user} onUpgrade={handleUpgrade} />

      {/* Guest Mode Notice */}
      {isGuest && (
        <div className="fixed bottom-4 right-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-sm z-50">
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
      )}
    </div>
  );
}
