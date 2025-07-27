'use client';

import { useEffect, useState } from 'react';
import CodeComplexityChart from './CodeComplexityChart';
import CommitTimeline from './CommitTimeline';
import DeveloperActivityHeatmap from './DeveloperActivityHeatmap';
import RepositoryHealthScore from './RepositoryHealthScore';
import PerformanceMetrics from './PerformanceMetrics';
import SecurityAnalysis from './SecurityAnalysis';
import CodeQualityMetrics from './CodeQualityMetrics';
import TeamCollaboration from './TeamCollaboration';

export default function AdvancedAnalyticsPanel({ user, selectedRepo }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (selectedRepo) {
      fetchAdvancedAnalytics();
    }
  }, [selectedRepo]);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      // Simulation d'analytics avancés
      const data = {
        overview: {
          healthScore: 87,
          complexityScore: 72,
          maintainabilityIndex: 85,
          technicalDebt: 23,
          codeCoverage: 78,
          performanceScore: 91
        },
        commits: {
          total: 1247,
          thisMonth: 89,
          thisWeek: 23,
          averagePerDay: 3.2,
          trend: 'increasing'
        },
        developers: {
          active: 8,
          total: 12,
          topContributor: 'Sarah Chen',
          newContributors: 3
        },
        codeQuality: {
          cyclomaticComplexity: 4.2,
          codeDuplication: 8.5,
          testCoverage: 78,
          documentationCoverage: 65
        },
        performance: {
          buildTime: 2.3,
          testTime: 1.8,
          deploymentTime: 4.2,
          responseTime: 120
        },
        security: {
          vulnerabilities: 2,
          criticalIssues: 0,
          securityScore: 94,
          lastScan: '2024-01-15'
        }
      };

      setAnalyticsData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Analyse approfondie en cours...</p>
        <p className="text-gray-500 text-sm mt-2">Préparation des métriques avancées</p>
      </div>
    );
  }

  if (!analyticsData) {
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

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'quality', name: 'Qualité du Code', icon: '🔍' },
    { id: 'security', name: 'Sécurité', icon: '🛡️' },
    { id: 'team', name: 'Équipe', icon: '👥' },
    { id: 'timeline', name: 'Timeline', icon: '📈' }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header avec navigation */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Avancés</h2>
          <p className="text-gray-400 text-sm">Analyse approfondie de {selectedRepo.name}</p>
        </div>
        
        {/* Navigation par onglets */}
        <div className="flex space-x-1 px-6 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <RepositoryHealthScore data={analyticsData.overview} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeComplexityChart data={analyticsData.codeQuality} />
              <DeveloperActivityHeatmap />
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceMetrics data={analyticsData.performance} />
        )}

        {activeTab === 'quality' && (
          <CodeQualityMetrics data={analyticsData.codeQuality} />
        )}

        {activeTab === 'security' && (
          <SecurityAnalysis data={analyticsData.security} />
        )}

        {activeTab === 'team' && (
          <TeamCollaboration data={analyticsData.developers} />
        )}

        {activeTab === 'timeline' && (
          <CommitTimeline data={analyticsData.commits} />
        )}
      </div>
    </div>
  );
} 