'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function Dashboard({ user, onLogout }) {
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
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // Vérifier les paramètres de succès de paiement
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const test = urlParams.get('test');
    const plan = urlParams.get('plan');
    const portal = urlParams.get('portal');
    
    if (test === 'true' && plan) {
      setPaymentSuccessData({ plan, isTest: true });
      setShowPaymentSuccess(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (portal === 'test') {
      alert('Portail client en mode test - Fonctionnalité simulée');
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Vérifier si user existe et a les propriétés nécessaires
  if (!user || !user.plan) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre profil...</p>
          {!user && (
            <p className="text-gray-500 text-sm mt-2">Redirection vers l'authentification...</p>
          )}
        </div>
      </div>
    );
  }

  // Fonction pour vérifier si une fonctionnalité nécessite un upgrade
  const requiresUpgrade = (feature) => {
    if (!user || !user.plan) return false;
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

  const handleRepoSelect = useCallback((repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
    setActiveView('explorer');
  }, []);

  const handleBackToRepos = useCallback(() => {
    setSelectedRepo(null);
    setSelectedFile(null);
    setFileContent('');
    setRepoFiles([]);
    setActiveView('repos');
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setSelectedFile(null);
    setFileContent('');
    setActiveView('explorer');
  }, []);

  const handleFileSelect = useCallback(async (file) => {
    setSelectedFile(file);
    setLoading(true);

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
          setActiveView('editor');
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
      setLoading(false);
    }
  }, [selectedRepo, user.access_token]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!selectedFile || !fileContent) return;

    if (requiresUpgrade('documentation')) {
      setShowUpgradeNotice(true);
      return;
    }

    setLoading(true);
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
        setActiveView('documentation');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de documentation:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, fileContent, selectedRepo, user]);

  const renderMainContent = () => {
    switch (activeView) {
      case 'repos':
        return (
          <RepositoryExplorer
            user={user}
            selectedRepo={selectedRepo}
            onRepoSelect={handleRepoSelect}
            onFileSelect={handleFileSelect}
            loading={loading}
          />
        );
      case 'explorer':
        return (
          <FileTreeExplorer
            user={user}
            selectedRepo={selectedRepo}
            onFileSelect={handleFileSelect}
            onBackToRepos={handleBackToRepos}
            loading={loading}
          />
        );
      case 'editor':
        return (
          <CodeEditorWithTree
            file={selectedFile}
            content={fileContent}
            onGenerateDoc={handleGenerateDocumentation}
            loading={loading}
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
            onBackToEditor={() => setActiveView('editor')}
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
            onLogout={onLogout}
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
        onUpgrade={handleUpgrade}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNavbar
          user={user}
          selectedRepo={selectedRepo}
          selectedFile={selectedFile}
          activeView={activeView}
          onSearchOpen={() => setIsSearchOpen(true)}
          onNotificationOpen={() => setIsNotificationOpen(true)}
          onLogout={onLogout}
          theme={theme}
          layout={layout}
          onLayoutChange={setLayout}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
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
          activeView={activeView}
          selectedFile={selectedFile}
          onGenerateDoc={handleGenerateDocumentation}
          loading={loading}
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
        onUpgrade={handleUpgrade}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        user={user}
      />

      {/* Upgrade Notifications Pop-up */}
      <UpgradeNotifications
        user={user}
        onUpgrade={handleUpgrade}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        plan={paymentSuccessData?.plan}
        isTest={paymentSuccessData?.isTest}
      />

      {/* Upgrade Notice */}
      {showUpgradeNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md mx-4 border border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fonctionnalité Premium</h3>
              <p className="text-gray-300 mb-6">
                Cette fonctionnalité est disponible uniquement pour les utilisateurs Pro et Enterprise. 
                Débloquez tout le potentiel de gitShadow !
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  Accès illimité à toutes les fonctionnalités
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  Support prioritaire
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  Analytics avancées
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradeNotice(false)}
                  className="flex-1 px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Plus tard
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
                >
                  Passer au Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
