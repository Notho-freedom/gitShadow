import React, { useState, useEffect } from 'react';

export default function IssuesAndPulls({ issuesData, pullsData }) {
  const [activeTab, setActiveTab] = useState('issues');
  const [animatedIssues, setAnimatedIssues] = useState({
    total: 0,
    open: 0,
    closed: 0
  });
  const [animatedPulls, setAnimatedPulls] = useState({
    total: 0,
    open: 0,
    merged: 0,
    closed: 0
  });

  useEffect(() => {
    if (issuesData) {
      animateData(issuesData, setAnimatedIssues);
    }
  }, [issuesData]);

  useEffect(() => {
    if (pullsData) {
      animateData(pullsData, setAnimatedPulls);
    }
  }, [pullsData]);

  const animateData = (data, setter) => {
    const steps = 25;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setter({
        total: Math.floor((data.total || 0) * progress),
        open: Math.floor((data.open || 0) * progress),
        closed: Math.floor((data.closed || 0) * progress),
        merged: Math.floor((data.merged || 0) * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, 60);

    return () => clearInterval(timer);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getIssueTypeColor = (labels) => {
    if (!labels || !Array.isArray(labels)) return 'text-gray-400';
    
    if (labels.some(label => label.name?.toLowerCase().includes('bug'))) return 'text-red-400';
    if (labels.some(label => label.name?.toLowerCase().includes('feature'))) return 'text-green-400';
    if (labels.some(label => label.name?.toLowerCase().includes('enhancement'))) return 'text-blue-400';
    if (labels.some(label => label.name?.toLowerCase().includes('documentation'))) return 'text-purple-400';
    return 'text-gray-400';
  };

  const getPullStatusColor = (state, mergedAt) => {
    if (mergedAt) return 'text-green-400';
    if (state === 'open') return 'text-blue-400';
    return 'text-red-400';
  };

  // Générer les vraies données
  const realIssues = generateRealIssues(issuesData);
  const realPulls = generateRealPulls(pullsData);
  const issueTypes = generateIssueTypes(issuesData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Issues & Pull Requests</h3>
          <div className="text-2xl">📋</div>
        </div>

        {/* Navigation par onglets */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'issues'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            🐛 Issues ({animatedIssues.total})
          </button>
          <button
            onClick={() => setActiveTab('pulls')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'pulls'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            🔄 Pull Requests ({animatedPulls.total})
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeTab === 'issues' ? (
            <>
              <StatCard
                title="Total Issues"
                value={animatedIssues.total}
                icon="📊"
                color="blue"
              />
              <StatCard
                title="Ouvertes"
                value={animatedIssues.open}
                icon="🔓"
                color="green"
              />
              <StatCard
                title="Fermées"
                value={animatedIssues.closed}
                icon="🔒"
                color="red"
              />
              <StatCard
                title="Taux de Résolution"
                value={animatedIssues.total > 0 ? Math.round((animatedIssues.closed / animatedIssues.total) * 100) : 0}
                icon="📈"
                color="purple"
                unit="%"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total PRs"
                value={animatedPulls.total}
                icon="📊"
                color="blue"
              />
              <StatCard
                title="Ouvertes"
                value={animatedPulls.open}
                icon="🔓"
                color="green"
              />
              <StatCard
                title="Mergeées"
                value={animatedPulls.merged}
                icon="✅"
                color="purple"
              />
              <StatCard
                title="Fermées"
                value={animatedPulls.closed}
                icon="❌"
                color="red"
              />
            </>
          )}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[400px]">
        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* Types d'issues */}
            {Object.keys(issueTypes).length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Types d'Issues</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(issueTypes).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className="text-lg font-bold text-white">{count}</div>
                      <div className="text-xs text-gray-400 capitalize">{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues récentes */}
            {realIssues.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Issues Récentes</h4>
                <div className="space-y-3">
                  {realIssues.slice(0, 5).map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm ${getIssueTypeColor(issue.labels)}`}>
                            #{issue.number}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            issue.state === 'open' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                          }`}>
                            {issue.state === 'open' ? 'Ouverte' : 'Fermée'}
                          </span>
                        </div>
                        <div className="text-white text-sm font-medium">{issue.title}</div>
                        <div className="text-gray-400 text-xs">
                          par {issue.author} • {formatDate(issue.createdAt)}
                        </div>
                      </div>
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex space-x-1">
                          {issue.labels.slice(0, 3).map((label, labelIndex) => (
                            <span
                              key={labelIndex}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                            >
                              {label.name || label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pulls' && (
          <div className="space-y-4">
            {/* Pull requests récentes */}
            {realPulls.length > 0 && (
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Pull Requests Récentes</h4>
                <div className="space-y-3">
                  {realPulls.slice(0, 5).map((pull, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-blue-400">
                            #{pull.number}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            pull.mergedAt ? 'bg-purple-600 text-white' : 
                            pull.state === 'open' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {pull.mergedAt ? 'Mergeée' : pull.state === 'open' ? 'Ouverte' : 'Fermée'}
                          </span>
                        </div>
                        <div className="text-white text-sm font-medium">{pull.title}</div>
                        <div className="text-gray-400 text-xs">
                          par {pull.author} • {formatDate(pull.createdAt)}
                          {pull.additions && pull.deletions && (
                            <span className="ml-2">
                              +{pull.additions} -{pull.deletions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, unit = '' }) {
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs">{title}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="text-lg font-bold text-white">
        {value}{unit}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
        <div
          className={`h-1 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

// Fonctions pour générer les vraies données
function generateRealIssues(issuesData) {
  if (!issuesData?.recent || !Array.isArray(issuesData.recent)) {
    return [];
  }
  
  return issuesData.recent.map(issue => ({
    number: issue.number,
    title: issue.title,
    state: issue.state,
    author: issue.user?.login || issue.author || 'Auteur inconnu',
    createdAt: issue.created_at,
    labels: issue.labels || []
  }));
}

function generateRealPulls(pullsData) {
  if (!pullsData?.recent || !Array.isArray(pullsData.recent)) {
    return [];
  }
  
  return pullsData.recent.map(pull => ({
    number: pull.number,
    title: pull.title,
    state: pull.state,
    author: pull.user?.login || pull.author || 'Auteur inconnu',
    createdAt: pull.created_at,
    mergedAt: pull.merged_at,
    additions: pull.additions,
    deletions: pull.deletions
  }));
}

function generateIssueTypes(issuesData) {
  if (!issuesData?.recent || !Array.isArray(issuesData.recent)) {
    return {};
  }
  
  const types = {};
  
  issuesData.recent.forEach(issue => {
    if (issue.labels && Array.isArray(issue.labels)) {
      issue.labels.forEach(label => {
        const labelName = label.name || label;
        if (labelName) {
          types[labelName] = (types[labelName] || 0) + 1;
        }
      });
    }
  });
  
  return types;
} 