'use client';

import { useState } from 'react';

export default function DocumentationPanel({ fileContent, documentation, setDocumentation, selectedFile, user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [docType, setDocType] = useState('comprehensive');
  const [generationsUsed, setGenerationsUsed] = useState(0);

  const docTypes = {
    comprehensive: {
      label: 'Documentation complète',
      prompt: 'Génère une documentation complète et détaillée pour ce code, incluant la description, les paramètres, les valeurs de retour, les exemples d\'utilisation et les bonnes pratiques.',
      premium: false
    },
    summary: {
      label: 'Résumé rapide',
      prompt: 'Génère un résumé concis de ce code, expliquant son objectif principal et son fonctionnement en quelques phrases.',
      premium: false
    },
    api: {
      label: 'Documentation API',
      prompt: 'Génère une documentation API pour ce code, en se concentrant sur les interfaces publiques, les méthodes, les paramètres et les formats de réponse.',
      premium: true
    },
    technical: {
      label: 'Analyse technique',
      prompt: 'Effectue une analyse technique approfondie du code, incluant la complexité, les patterns utilisés, les optimisations possibles et les recommandations.',
      premium: true
    },
    security: {
      label: 'Audit sécurité',
      prompt: 'Analyse le code pour identifier les vulnérabilités potentielles, les bonnes pratiques de sécurité et les recommandations d\'amélioration.',
      premium: true
    }
  };

  const getGenerationLimit = () => {
    switch (user.plan) {
      case 'free': return 10;
      case 'pro': return Infinity;
      case 'enterprise': return Infinity;
      default: return 10;
    }
  };

  const canGenerate = () => {
    const limit = getGenerationLimit();
    return limit === Infinity || generationsUsed < limit;
  };

  const handleGenerateDoc = async () => {
    if (!fileContent || !selectedFile) {
      setError('Aucun fichier sélectionné ou contenu vide');
      return;
    }

    if (!canGenerate()) {
      setError('Limite de générations atteinte pour votre plan');
      return;
    }

    const selectedDocType = docTypes[docType];
    if (selectedDocType.premium && user.plan === 'free') {
      setError('Cette fonctionnalité est réservée aux plans Pro et Entreprise');
      return;
    }

    setLoading(true);
    setError('');
    setDocumentation('');

    try {
      // Simulation de l'appel API
      setTimeout(() => {
        const mockDoc = `# Documentation - ${selectedFile.path}

## Vue d'ensemble
Ce fichier fait partie du projet ${selectedFile.path.split('/')[0]} et implémente des fonctionnalités essentielles pour l'application.

## Description
${selectedDocType.label === 'Documentation complète' ? `
### Fonctionnalités principales
- Gestion des états de l'application
- Interface utilisateur réactive
- Intégration avec les APIs externes

### Architecture
Le code suit les bonnes pratiques React avec:
- Hooks personnalisés pour la logique métier
- Composants fonctionnels optimisés
- Gestion d'état avec useState et useEffect

### Exemples d'utilisation
\`\`\`javascript
// Exemple d'utilisation du composant
import Component from './${selectedFile.path}';

function App() {
  return <Component prop1="value" prop2={data} />;
}
\`\`\`

### Paramètres
- \`prop1\`: String - Description du premier paramètre
- \`prop2\`: Object - Données à traiter par le composant

### Valeurs de retour
Le composant retourne un élément JSX configuré selon les props fournies.
` : selectedDocType.label === 'Résumé rapide' ? `
Ce fichier implémente un composant React qui gère l'affichage et l'interaction utilisateur. Il utilise les hooks modernes et suit les conventions de développement recommandées.
` : selectedDocType.label === 'Documentation API' ? `
### Endpoints disponibles
- \`GET /api/data\` - Récupère les données
- \`POST /api/data\` - Crée une nouvelle entrée
- \`PUT /api/data/:id\` - Met à jour une entrée
- \`DELETE /api/data/:id\` - Supprime une entrée

### Formats de réponse
\`\`\`json
{
  "status": "success",
  "data": {...},
  "message": "Operation completed"
}
\`\`\`
` : selectedDocType.label === 'Analyse technique' ? `
### Complexité du code
- Complexité cyclomatique: Moyenne
- Lignes de code: ${fileContent.split('\n').length}
- Fonctions: Estimation basée sur l'analyse

### Patterns identifiés
- Pattern Observer pour la gestion d'état
- Pattern Component pour la réutilisabilité
- Pattern Hook pour la logique métier

### Optimisations recommandées
1. Utiliser React.memo pour éviter les re-renders
2. Implémenter le lazy loading pour les composants lourds
3. Optimiser les dépendances des useEffect
` : `
### Analyse de sécurité

#### Vulnérabilités potentielles
- Validation des entrées utilisateur
- Gestion des erreurs sensibles
- Protection contre les injections

#### Recommandations
1. Valider toutes les entrées côté client et serveur
2. Utiliser des bibliothèques de sécurité éprouvées
3. Implémenter une gestion d'erreur robuste
4. Chiffrer les données sensibles
`}

## Bonnes pratiques
- Suivre les conventions de nommage
- Documenter les fonctions complexes
- Tester les cas limites
- Maintenir la cohérence du style

## Maintenance
Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}
Généré par: gitShadow IA v2.0.0
`;

        setDocumentation(mockDoc);
        setGenerationsUsed(prev => prev + 1);
        setLoading(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
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
    a.download = `${selectedFile.path.split('/').pop().split('.')[0]}_documentation.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const limit = getGenerationLimit();

  return (
    <div className="h-full flex flex-col bg-gray-800/30">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-semibold text-white">Documentation IA</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {documentation && (
              <>
                <button
                  onClick={copyDocumentation}
                  className="px-3 py-1.5 text-xs bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Copier
                </button>
                <button
                  onClick={exportDocumentation}
                  className="px-3 py-1.5 text-xs bg-gray-600/50 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Exporter MD
                </button>
              </>
            )}
          </div>
        </div>

        {/* Limite de génération */}
        {user.plan === 'free' && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">
                Générations utilisées: {generationsUsed}/{limit}
              </span>
              {generationsUsed >= limit && (
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors">
                  Passer au Pro
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sélecteur de type */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Type :</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(docTypes).map(([key, type]) => (
                <option key={key} value={key} disabled={type.premium && user.plan === 'free'}>
                  {type.label} {type.premium && user.plan === 'free' ? '(Pro)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerateDoc}
            disabled={loading || !fileContent || !selectedFile || !canGenerate() || (docTypes[docType].premium && user.plan === 'free')}
            className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400">
                L'IA analyse votre code et génère la documentation...
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <div>
                <p className="text-red-400 font-medium">Erreur de génération</p>
                <p className="text-red-400/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {documentation && !loading && (
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                {documentation}
              </pre>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Type: {docTypes[docType].label}</span>
                <span>Généré le {new Date().toLocaleString('fr-FR')}</span>
              </div>
            </div>
          </div>
        )}

        {!documentation && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Prêt à documenter</h3>
            <p className="text-gray-400 mb-4">
              Sélectionnez un fichier et cliquez sur "Générer la documentation" pour commencer
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• Documentation complète avec exemples</p>
              <p>• Résumés rapides pour une vue d'ensemble</p>
              <p>• Documentation API pour les interfaces {user.plan === 'free' && '(Pro)'}</p>
              <p>• Analyse technique avancée {user.plan === 'free' && '(Pro)'}</p>
              <p>• Audit de sécurité {user.plan === 'free' && '(Pro)'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
