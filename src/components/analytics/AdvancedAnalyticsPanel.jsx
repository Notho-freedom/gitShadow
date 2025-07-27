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
import RepositoryDetails from './RepositoryDetails';
import IssuesAndPulls from './IssuesAndPulls';

export default function AdvancedAnalyticsPanel({ repositoryData, user }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('repository');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!repositoryData?.owner || !repositoryData?.name) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/fetchRepoAnalytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            owner: repositoryData.owner,
            repo: repositoryData.name,
            accessToken: user?.access_token
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setAnalyticsData(data);
      } catch (err) {
        console.error('Erreur analytics:', err);
        setError(err.message || 'Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [repositoryData, user]);

  const tabs = [
    { id: 'repository', label: 'Repository', icon: '📁' },
    { id: 'health', label: 'Santé', icon: '🏥' },
    { id: 'complexity', label: 'Complexité', icon: '🧮' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'quality', label: 'Qualité', icon: '✨' },
    { id: 'team', label: 'Équipe', icon: '👥' },
    { id: 'commits', label: 'Commits', icon: '📊' },
    { id: 'activity', label: 'Activité', icon: '🔥' },
    { id: 'issues', label: 'Issues & PRs', icon: '📋' }
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
        <h3 className="text-gray-400 font-semibold mb-2">Aucune donnée disponible</h3>
        <p className="text-gray-500 text-sm">Impossible de récupérer les données d'analyse</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec navigation par onglets */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Analytics Avancés</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Score de santé:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                analyticsData.healthScore >= 80 ? 'bg-green-500/20 text-green-400' :
                analyticsData.healthScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {analyticsData.healthScore}/100
              </span>
            </div>
          </div>
          
          {/* Navigation par onglets */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'repository' && (
          <RepositoryDetails data={analyticsData} />
        )}
        
        {activeTab === 'health' && (
          <RepositoryHealthScore data={analyticsData} />
        )}
        
        {activeTab === 'complexity' && (
          <CodeComplexityChart data={analyticsData} />
        )}
        
        {activeTab === 'performance' && (
          <PerformanceMetrics data={analyticsData} />
        )}
        
        {activeTab === 'security' && (
          <SecurityAnalysis data={analyticsData} />
        )}
        
        {activeTab === 'quality' && (
          <CodeQualityMetrics data={analyticsData} />
        )}
        
        {activeTab === 'team' && (
          <TeamCollaboration data={analyticsData} />
        )}
        
        {activeTab === 'commits' && (
          <CommitTimeline data={analyticsData} />
        )}
        
        {activeTab === 'activity' && (
          <DeveloperActivityHeatmap data={analyticsData} />
        )}
        
        {activeTab === 'issues' && (
          <IssuesAndPulls data={analyticsData} />
        )}
      </div>
    </div>
  );
} 