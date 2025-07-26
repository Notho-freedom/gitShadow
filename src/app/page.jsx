'use client';

import { useState } from 'react';
import RepositoryInput from '../components/RepositoryInput';
import RepoTree from '../components/RepoTree';
import FileViewer from '../components/FileViewer';
import DocumentationPanel from '../components/DocumentationPanel';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoTree, setRepoTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setFileContent('');
    setDocumentation('');
    
    if (file && file.download_url) {
      try {
        const response = await fetch(file.download_url);
        const content = await response.text();
        setFileContent(content);
      } catch (error) {
        console.error('Erreur lors du chargement du fichier:', error);
        setFileContent('Erreur lors du chargement du fichier');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header futuriste */}
      <header className="text-center space-y-4">
        <div className="relative">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            gitShadow
          </h1>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Générez une documentation intelligente à partir de votre dépôt Git avec l'IA
        </p>
      </header>

      {/* Input du repository */}
      <div className="max-w-4xl mx-auto">
        <RepositoryInput 
          onRepoUrlChange={setRepoUrl} 
          onFetchRepo={setRepoTree}
          loading={loading}
          setLoading={setLoading}
        />
      </div>

      {/* Interface principale */}
      {repoTree.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Sidebar gauche - Arbre et recherche */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="sticky top-4 space-y-4">
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
              <RepoTree 
                repoTree={repoTree} 
                searchQuery={searchQuery}
                onSelectFile={handleFileSelect}
                selectedFile={selectedFile}
              />
            </div>
          </aside>
          
          {/* Panel principal - Visualiseur et documentation */}
          <main className="lg:col-span-3 space-y-6">
            <FileViewer 
              file={selectedFile} 
              content={fileContent}
              loading={loading}
            />
            <DocumentationPanel 
              fileContent={fileContent} 
              documentation={documentation} 
              setDocumentation={setDocumentation}
              selectedFile={selectedFile}
            />
          </main>
        </div>
      )}

      {/* État vide */}
      {repoTree.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-muted/40" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Prêt à explorer</h3>
          <p className="text-muted-foreground">
            Entrez l'URL d'un dépôt Git pour commencer l'analyse
          </p>
        </div>
      )}
    </div>
  );
}
