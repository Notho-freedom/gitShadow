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

export default function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('explorer');
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
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
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
    </div>
  );
}
