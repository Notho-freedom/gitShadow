'use client';

import { useEffect, useState } from 'react';
import AdvancedAnalyticsPanel from './analytics/AdvancedAnalyticsPanel';

export default function AnalyticsPanel({ user, selectedRepo }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Extraire les informations du repository
  const getRepositoryData = () => {
    if (!selectedRepo) return null;
    
    // Si selectedRepo est une URL, extraire owner et name
    if (typeof selectedRepo === 'string') {
      const match = selectedRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        return {
          owner: match[1],
          name: match[2].replace('.git', '')
        };
      }
    }
    
    // Si selectedRepo est un objet avec les propriétés
    if (selectedRepo.owner && selectedRepo.name) {
      // S'assurer que owner est une chaîne de caractères
      let ownerName = selectedRepo.owner;
      if (typeof selectedRepo.owner === 'object' && selectedRepo.owner.login) {
        ownerName = selectedRepo.owner.login;
      } else if (typeof selectedRepo.owner === 'string') {
        ownerName = selectedRepo.owner;
      } else {
        ownerName = 'unknown';
      }
      
      return {
        owner: ownerName,
        name: selectedRepo.name
      };
    }
    
    // Fallback - essayer d'extraire depuis le nom
    return {
      owner: 'unknown',
      name: selectedRepo.name || selectedRepo
    };
  };

  const repositoryData = getRepositoryData();

  if (!selectedRepo) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analytics Avancés</h3>
        <p className="text-gray-400">Sélectionnez un dépôt pour voir les analyses détaillées</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec toggle */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Analytics Avancés</h2>
              <p className="text-gray-400 text-sm">
                Analyse approfondie de {typeof selectedRepo === 'object' && selectedRepo.name ? selectedRepo.name : selectedRepo}
              </p>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                showAdvanced
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              {showAdvanced ? '📊 Mode Avancé' : '🚀 Activer Analytics Avancés'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto">
        {showAdvanced ? (
          <AdvancedAnalyticsPanel repositoryData={repositoryData} user={user} />
        ) : (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Découvrez les Analytics Ultra-Avancés</h3>
              <p className="text-gray-400 mb-6">
                Plongez dans une analyse approfondie de votre repository avec des métriques avancées, 
                des visualisations sophistiquées et des insights prédictifs basés sur des données réelles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <FeatureCard
                  icon="📊"
                  title="Score de Santé"
                  description="Analyse complète de la qualité et de la maintenabilité"
                />
                <FeatureCard
                  icon="🔍"
                  title="Analyse de Complexité"
                  description="Métriques détaillées sur la complexité cyclomatique"
                />
                <FeatureCard
                  icon="👥"
                  title="Collaboration d'Équipe"
                  description="Heatmaps d'activité et métriques de collaboration"
                />
                <FeatureCard
                  icon="⚡"
                  title="Performance"
                  description="Métriques de build, test et déploiement"
                />
                <FeatureCard
                  icon="🛡️"
                  title="Sécurité"
                  description="Analyse des vulnérabilités et recommandations"
                />
                <FeatureCard
                  icon="📈"
                  title="Timeline Avancée"
                  description="Historique détaillé des commits et tendances"
                />
              </div>

              <button
                onClick={() => setShowAdvanced(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Activer les Analytics Ultra-Avancés
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
