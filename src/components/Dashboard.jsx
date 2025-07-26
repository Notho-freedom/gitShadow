'use client';

import { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Sidebar from './Sidebar';
import RepositoryList from './RepositoryList';
import CommitHistory from './CommitHistory';
import FileExplorer from './FileExplorer';
import CodeViewer from './CodeViewer';
import DocumentationPanel from './DocumentationPanel';

export default function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('repositories');
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);

  // Gestion des vues
  const views = {
    repositories: 'Dépôts',
    commits: 'Commits',
    files: 'Fichiers',
    settings: 'Paramètres'
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setSelectedCommit(null);
    setSelectedFile(null);
    setActiveView('commits');
  };

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);
    setSelectedFile(null);
    setActiveView('files');
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setFileContent('');
    setDocumentation('');
    setLoading(true);

    try {
      // Simulation du chargement du contenu du fichier
      setTimeout(() => {
        const mockContent = `// ${file.name}
// Commit: ${selectedCommit?.sha?.substring(0, 7) || 'latest'}
// Repository: ${selectedRepo?.name}

${file.type === 'file' ? `
function ${file.name.replace(/\.[^/.]+$/, "")}() {
  // Implementation here
  console.log('Hello from ${file.name}');
  
  return {
    status: 'success',
    message: 'File loaded successfully'
  };
}

export default ${file.name.replace(/\.[^/.]+$/, "")};
` : '// Directory content'}`;
        
        setFileContent(mockContent);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      setFileContent('Erreur lors du chargement du fichier');
      setLoading(false);
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'repositories':
        return (
          <RepositoryList 
            user={user}
            onRepoSelect={handleRepoSelect}
            selectedRepo={selectedRepo}
          />
        );
      case 'commits':
        return (
          <CommitHistory 
            repo={selectedRepo}
            onCommitSelect={handleCommitSelect}
            selectedCommit={selectedCommit}
          />
        );
      case 'files':
        return (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={30} minSize={20}>
              <FileExplorer 
                repo={selectedRepo}
                commit={selectedCommit}
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
              />
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-700 hover:bg-gray-600 transition-colors" />
            <Panel defaultSize={70}>
              <PanelGroup direction="vertical">
                <Panel defaultSize={60} minSize={30}>
                  <CodeViewer 
                    file={selectedFile}
                    content={fileContent}
                    loading={loading}
                    repo={selectedRepo}
                    commit={selectedCommit}
                  />
                </Panel>
                <PanelResizeHandle className="h-2 bg-gray-700 hover:bg-gray-600 transition-colors" />
                <Panel defaultSize={40} minSize={20}>
                  <DocumentationPanel 
                    fileContent={fileContent}
                    documentation={documentation}
                    setDocumentation={setDocumentation}
                    selectedFile={selectedFile}
                    user={user}
                  />
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profil utilisateur</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400">@{user.login}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.plan === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                    user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    Plan {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Préférences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Thème sombre</span>
                    <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Notifications</span>
                    <button className="w-12 h-6 bg-blue-500 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        views={views}
        user={user}
        selectedRepo={selectedRepo}
        selectedCommit={selectedCommit}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-white">
                {views[activeView]}
              </h1>
              {selectedRepo && (
                <span className="text-gray-400">
                  / {selectedRepo.name}
                  {selectedCommit && ` / ${selectedCommit.sha.substring(0, 7)}`}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white text-sm">{user.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
