'use client';

import { useEffect, useState } from 'react';

export default function CommitTimeline({ data }) {
  const [animatedData, setAnimatedData] = useState({
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
    averagePerDay: 0
  });

  useEffect(() => {
    const animateData = () => {
      const targetData = { ...data };
      let currentData = { ...animatedData };
      const steps = 30;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        Object.keys(targetData).forEach(key => {
          currentData[key] = targetData[key] * progress;
        });

        setAnimatedData({ ...currentData });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    };

    animateData();
  }, [data]);

  const commitHistory = generateCommitHistory();
  const commitTypes = generateCommitTypes();
  const weeklyActivity = generateWeeklyActivity();

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Timeline des Commits</h3>
          <div className="text-2xl">📈</div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CommitMetric
            title="Total Commits"
            value={Math.round(animatedData.total)}
            icon="📊"
            color="blue"
          />
          <CommitMetric
            title="Ce Mois"
            value={Math.round(animatedData.thisMonth)}
            icon="📅"
            color="green"
          />
          <CommitMetric
            title="Cette Semaine"
            value={Math.round(animatedData.thisWeek)}
            icon="📆"
            color="purple"
          />
          <CommitMetric
            title="Moyenne/Jour"
            value={animatedData.averagePerDay.toFixed(1)}
            icon="⚡"
            color="orange"
          />
        </div>

        {/* Graphique d'activité */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-4">Activité des 30 Derniers Jours</h4>
          <div className="flex items-end justify-between h-32">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-6 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-500"
                  style={{ height: `${(day.commits / Math.max(...weeklyActivity.map(d => d.commits))) * 100}%` }}
                />
                <div className="text-xs text-gray-400 mt-2">{day.day}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline des commits récents */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Commits Récents</h4>
        
        <div className="space-y-4">
          {commitHistory.map((commit, index) => (
            <CommitCard key={index} commit={commit} />
          ))}
        </div>
      </div>

      {/* Analyse des types de commits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommitTypesChart data={commitTypes} />
        <CommitTrendsChart data={generateCommitTrends()} />
      </div>

      {/* Métriques avancées */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Métriques Avancées</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdvancedCommitMetric
            title="Temps de Cycle"
            value="2.3 jours"
            description="Temps moyen entre commit et merge"
            color="green"
          />
          <AdvancedCommitMetric
            title="Lead Time"
            value="4.7 jours"
            description="Temps de développement moyen"
            color="blue"
          />
          <AdvancedCommitMetric
            title="Deployment Frequency"
            value="3.2/jour"
            description="Fréquence de déploiement"
            color="purple"
          />
        </div>
      </div>

      {/* Insights et patterns */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Insights & Patterns</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CommitInsight
              type="positive"
              title="Activité croissante"
              description="L'activité de commits a augmenté de 15% ce mois"
              icon="📈"
            />
            <CommitInsight
              type="info"
              title="Pic d'activité"
              description="Plus d'activité les mardis et jeudis"
              icon="📊"
            />
          </div>
          
          <div className="space-y-4">
            <CommitInsight
              type="warning"
              title="Commits tardifs"
              description="20% des commits sont effectués après 18h"
              icon="🌙"
            />
            <CommitInsight
              type="suggestion"
              title="Optimisation"
              description="Considérer des commits plus petits et fréquents"
              icon="💡"
            />
          </div>
        </div>
      </div>

      {/* Comparaison avec les standards */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Comparaison avec les Standards</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComparisonCard
            metric="Commits/Jour"
            current={animatedData.averagePerDay.toFixed(1)}
            standard="3.0"
            status="Bon"
            color="green"
          />
          <ComparisonCard
            metric="Taille des Commits"
            current="Moyenne"
            standard="Petite"
            status="À améliorer"
            color="orange"
          />
          <ComparisonCard
            metric="Messages de Commit"
            current="Conventionnels"
            standard="Conventionnels"
            status="Excellent"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

function CommitMetric({ title, value, icon, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
          style={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function CommitCard({ commit }) {
  const getTypeColor = (type) => {
    const colors = {
      feat: 'bg-green-500/20 text-green-400',
      fix: 'bg-red-500/20 text-red-400',
      docs: 'bg-blue-500/20 text-blue-400',
      style: 'bg-purple-500/20 text-purple-400',
      refactor: 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[type] || colors.feat;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className={`px-2 py-1 text-xs rounded mr-3 ${getTypeColor(commit.type)}`}>
              {commit.type}
            </span>
            <span className="text-white font-medium">{commit.message}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="mr-4">👤 {commit.author}</span>
            <span className="mr-4">🕒 {commit.time}</span>
            <span>📁 {commit.files} fichiers</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">{commit.hash}</div>
          <div className="text-xs text-gray-500">{commit.branch}</div>
        </div>
      </div>
    </div>
  );
}

function CommitTypesChart({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Types de Commits</h5>
      <div className="space-y-3">
        {data.map((type, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${type.color}`}></div>
              <span className="text-white text-sm">{type.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{type.count}</span>
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${type.color}`}
                  style={{ width: `${type.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommitTrendsChart({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Tendances</h5>
      <div className="space-y-3">
        {data.map((trend, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-white text-sm">{trend.name}</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${trend.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend.trend === 'up' ? '↗' : '↘'} {trend.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedCommitMetric({ title, value, description, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-2">{title}</h5>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: '75%' }}
        />
      </div>
    </div>
  );
}

function CommitInsight({ type, title, description, icon }) {
  const getTypeColor = (typeName) => {
    const colors = {
      positive: 'text-green-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      suggestion: 'text-purple-400'
    };
    return colors[typeName] || colors.info;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h5 className={`font-medium mb-2 ${getTypeColor(type)}`}>{title}</h5>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ metric, current, standard, status, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[colorName] || colors.green;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-2">{metric}</h5>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">{current}</span>
        <span className="text-gray-400 text-sm">vs {standard}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${color === 'green' ? 'text-green-400' : color === 'orange' ? 'text-orange-400' : 'text-red-400'}`}>
          {status}
        </span>
        <div className="w-16 bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
            style={{ width: color === 'green' ? '100%' : color === 'orange' ? '60%' : '30%' }}
          />
        </div>
      </div>
    </div>
  );
}

function generateCommitHistory() {
  return [
    {
      type: 'feat',
      message: 'Ajouter la fonctionnalité de recherche avancée',
      author: 'Sarah Chen',
      time: 'Il y a 2h',
      files: 8,
      hash: 'a1b2c3d',
      branch: 'feature/search'
    },
    {
      type: 'fix',
      message: 'Corriger le bug de pagination',
      author: 'Alex Rodriguez',
      time: 'Il y a 4h',
      files: 3,
      hash: 'e4f5g6h',
      branch: 'main'
    },
    {
      type: 'docs',
      message: 'Mettre à jour la documentation API',
      author: 'Emma Wilson',
      time: 'Il y a 6h',
      files: 2,
      hash: 'i7j8k9l',
      branch: 'docs/api'
    },
    {
      type: 'refactor',
      message: 'Refactoriser le composant Analytics',
      author: 'David Kim',
      time: 'Il y a 8h',
      files: 12,
      hash: 'm0n1o2p',
      branch: 'refactor/analytics'
    }
  ];
}

function generateCommitTypes() {
  return [
    { name: 'feat', count: 45, percentage: 35, color: 'bg-green-500' },
    { name: 'fix', count: 32, percentage: 25, color: 'bg-red-500' },
    { name: 'docs', count: 18, percentage: 14, color: 'bg-blue-500' },
    { name: 'refactor', count: 15, percentage: 12, color: 'bg-yellow-500' },
    { name: 'style', count: 12, percentage: 9, color: 'bg-purple-500' }
  ];
}

function generateWeeklyActivity() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    commits: Math.floor(Math.random() * 10) + 1
  }));
}

function generateCommitTrends() {
  return [
    { name: 'Commits par jour', trend: 'up', value: '+15%' },
    { name: 'Taille des commits', trend: 'down', value: '-8%' },
    { name: 'Code reviews', trend: 'up', value: '+22%' },
    { name: 'Temps de merge', trend: 'down', value: '-12%' }
  ];
} 