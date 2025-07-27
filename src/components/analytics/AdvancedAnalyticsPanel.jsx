'use client';

import React, { useState, useEffect } from 'react';
import RepositoryHealthScore from './RepositoryHealthScore';
import CodeComplexityChart from './CodeComplexityChart';
import DeveloperActivityHeatmap from './DeveloperActivityHeatmap';
import PerformanceMetrics from './PerformanceMetrics';
import SecurityAnalysis from './SecurityAnalysis';
import CodeQualityMetrics from './CodeQualityMetrics';
import TeamCollaboration from './TeamCollaboration';
import CommitTimeline from './CommitTimeline';

export default function AdvancedAnalyticsPanel({ repositoryData }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!repositoryData?.owner || !repositoryData?.name) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/analytics?owner=${repositoryData.owner}&repoName=${repositoryData.name}`
        );
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Erreur analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [repositoryData]);

  const tabs = [
    { id: 'health', label: 'Santé', icon: '🏥' },
    { id: 'complexity', label: 'Complexité', icon: '🧮' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'quality', label: 'Qualité', icon: '✨' },
    { id: 'team', label: 'Équipe', icon: '👥' },
    { id: 'commits', label: 'Commits', icon: '📊' },
    { id: 'activity', label: 'Activité', icon: '🔥' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <div className="text-red-400 text-2xl mb-2">⚠️</div>
        <h3 className="text-red-400 font-semibold mb-2">Erreur d'analyse</h3>
        <p className="text-gray-400 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-gray-800/20 border border-gray-600/50 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-2xl mb-2">📊</div>
        <h3 className="text-gray-300 font-semibold mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-400 text-sm">
          Sélectionnez un repository pour commencer l'analyse
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec informations du repository */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {repositoryData?.name || 'Repository'}
            </h2>
            <p className="text-gray-400 text-sm">
              {repositoryData?.owner || 'Owner'} • Analyse avancée en temps réel
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {analyticsData.health?.score || 0}
            </div>
            <div className="text-gray-400 text-sm">Score global</div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[600px]">
        {activeTab === 'health' && (
          <RepositoryHealthScore data={analyticsData.health} />
        )}
        {activeTab === 'complexity' && (
          <CodeComplexityChart data={analyticsData.complexity} />
        )}
        {activeTab === 'performance' && (
          <PerformanceMetrics data={analyticsData.performance} />
        )}
        {activeTab === 'security' && (
          <SecurityAnalysis data={analyticsData.security} />
        )}
        {activeTab === 'quality' && (
          <CodeQualityMetrics data={analyticsData.complexity} />
        )}
        {activeTab === 'team' && (
          <TeamCollaboration data={analyticsData.team} />
        )}
        {activeTab === 'commits' && (
          <CommitTimeline data={analyticsData.commits} />
        )}
        {activeTab === 'activity' && (
          <DeveloperActivityHeatmap data={analyticsData.activity} />
        )}
      </div>

      {/* Footer avec métriques rapides */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">
              {analyticsData.commits?.total || 0}
            </div>
            <div className="text-xs text-gray-400">Total Commits</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {analyticsData.team?.activeMembers || 0}
            </div>
            <div className="text-xs text-gray-400">Contributeurs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {analyticsData.security?.vulnerabilities || 0}
            </div>
            <div className="text-xs text-gray-400">Vulnérabilités</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {analyticsData.complexity?.testCoverage?.toFixed(0) || 0}%
            </div>
            <div className="text-xs text-gray-400">Couverture Tests</div>
          </div>
        </div>
      </div>
    </div>
  );
} 