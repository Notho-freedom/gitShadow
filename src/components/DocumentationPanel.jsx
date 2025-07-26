'use client';

import { useState } from 'react';

export default function DocumentationPanel({ fileContent, documentation, setDocumentation, selectedFile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docType, setDocType] = useState('comprehensive'); // comprehensive, summary, api

  const docTypes = {
    comprehensive: {
      label: 'Documentation complète',
      prompt: 'Génère une documentation complète et détaillée pour ce code, incluant la description, les paramètres, les valeurs de retour, les exemples d\'utilisation et les bonnes pratiques.'
    },
    summary: {
      label: 'Résumé rapide',
      prompt: 'Génère un résumé concis de ce code, expliquant son objectif principal et son fonctionnement en quelques phrases.'
    },
    api: {
      label: 'Documentation API',
      prompt: 'Génère une documentation API pour ce code, en se concentrant sur les interfaces publiques, les méthodes, les paramètres et les formats de réponse.'
    }
  };

  const handleGenerateDoc = async () => {
    if (!fileContent || !selectedFile) {
      setError('Aucun fichier sélectionné ou contenu vide');
      return;
    }

    setLoading(true);
    setError('');
    setDocumentation('');

    try {
      const response = await fetch('/api/generateDoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: fileContent,
          filename: selectedFile.name,
          docType: docType,
          prompt: docTypes[docType].prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération de la documentation');
      }

      const data = await response.json();
      setDocumentation(data.documentation || 'Aucune documentation générée');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyDocumentation = () => {
    if (documentation) {
      navigator.clipboard.writeText(documentation);
    }
  };

  const exportDocumentation = () => {
    if (!documentation || !selectedFile) return;
    
    const blob = new Blob([documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.split('.')[0]}_documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec contrôles */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <span>🤖</span>
            <span>Documentation IA</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {documentation && (
              <>
                <button
                  onClick={copyDocumentation}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Copier
                </button>
                <button
                  onClick={exportDocumentation}
                  className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  Exporter MD
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sélecteur de type de documentation */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-muted-foreground">Type :</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Object.entries(docTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateDoc}
            disabled={loading || !fileContent || !selectedFile}
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg
                     hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Générer la documentation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Zone de documentation */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Documentation générée</span>
            {selectedFile && (
              <span className="text-xs text-muted-foreground">
                Pour : {selectedFile.name}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">
                  L'IA analyse votre code et génère la documentation...
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <span>⚠️</span>
                <div>
                  <p className="text-destructive font-medium">Erreur de génération</p>
                  <p className="text-destructive/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {documentation && !loading && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/20 p-4 rounded-lg border">
                  {documentation}
                </pre>
              </div>
              
              {/* Métadonnées */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Type: {docTypes[docType].label}</span>
                  <span>Généré le {new Date().toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>
          )}

          {!documentation && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Prêt à documenter</h3>
              <p className="text-muted-foreground mb-4">
                Sélectionnez un fichier et cliquez sur "Générer la documentation" pour commencer
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Documentation complète avec exemples</p>
                <p>• Résumés rapides pour une vue d'ensemble</p>
                <p>• Documentation API pour les interfaces</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
