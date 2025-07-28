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
import QuickActions from './QuickActions';
import NotificationCenter from './NotificationCenter';
import SearchOverlay from './SearchOverlay';
import KeyboardShortcuts from './KeyboardShortcuts';
import ResizableLayout from './ResizableLayout';

export default function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('repos');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [currentView, setCurrentView] = useState('repos'); // 'repos', 'explorer', 'editor'
  const [repoFiles, setRepoFiles] = useState([]);
  const [documentation, setDocumentation] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [layout, setLayout] = useState('default'); // default, code-focus, documentation-focus
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Vérifier si user existe
  if (!user) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const handleRepoSelect = useCallback((repo) => {
    setSelectedRepo(repo);
    setSelectedFile(null);
    setFileContent('');
    setDocumentation('');
    setCurrentView('explorer');
  }, []);

  const handleBackToRepos = useCallback(() => {
    setSelectedRepo(null);
    setSelectedFile(null);
    setFileContent('');
    setRepoFiles([]);
    setCurrentView('repos');
  }, []);

  const handleBackToExplorer = useCallback(() => {
    setSelectedFile(null);
    setFileContent('');
    setCurrentView('explorer');
  }, []);

  // Gestion des actions rapides du sidebar
  const handleQuickAction = useCallback((actionId) => {
    switch (actionId) {
      case 'search':
        setIsSearchOpen(true);
        break;
      case 'new-file':
        // Logique pour créer un nouveau fichier
        console.log('Créer un nouveau fichier');
        break;
      case 'save':
        // Logique pour sauvegarder
        console.log('Sauvegarder les modifications');
        break;
      default:
        break;
    }
  }, []);

  // Gestion des raccourcis clavier globaux
  const handleKeyboardShortcut = useCallback((action) => {
    switch (action) {
      case 'repos':
        setCurrentView('repos');
        break;
      case 'explorer':
        setCurrentView('explorer');
        break;
      case 'editor':
        setCurrentView('editor');
        break;
      case 'documentation':
        setCurrentView('documentation');
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
      case 'search':
        setIsSearchOpen(true);
        break;
      case 'new-file':
        console.log('Créer un nouveau fichier');
        break;
      case 'save':
        console.log('Sauvegarder les modifications');
        break;
      case 'escape':
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        break;
      default:
        break;
    }
  }, []);

  // Synchroniser activeView avec currentView
  useEffect(() => {
    setActiveView(currentView);
  }, [currentView]);

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
      setLoading(false);
    }
  }, [selectedRepo, user.access_token]);

  const handleGenerateDocumentation = useCallback(async () => {
    if (!selectedFile || !fileContent) return;

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
        setCurrentView('documentation');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de documentation:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, fileContent, selectedRepo, user]);

  const renderMainContent = () => {
    switch (currentView) {
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
            onLogout={onLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      <ResizableLayout
        defaultSizes={[320, 1]} // Sidebar: 320px, Main: reste
        minSizes={[250, 600]} // Tailles minimales
        maxSizes={[500, null]} // Tailles maximales
        direction="horizontal"
        className="h-full"
      >
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setCurrentView(view);
          }}
          user={user}
          selectedRepo={selectedRepo}
          collapsed={false} // Désactiver le collapse car on a le redimensionnement
          onToggleCollapse={() => {}} // Fonction vide
          notifications={notifications}
          onQuickAction={handleQuickAction}
        />

        {/* Main Content Area */}
        <div className="flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <TopNavbar
            user={user}
            selectedRepo={selectedRepo}
            selectedFile={selectedFile}
            activeView={currentView}
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
            loading={loading}
          />
        </div>
      </ResizableLayout>

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

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts onShortcut={handleKeyboardShortcut} />
    </div>
  );
}
