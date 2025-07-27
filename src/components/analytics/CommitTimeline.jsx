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
      if (!data?.commits) return;
      
      const targetData = {
        total: data.commits.total || 0,
        thisMonth: calculateThisMonth(data.commits.recent || []),
        thisWeek: calculateThisWeek(data.commits.recent || []),
        averagePerDay: calculateAveragePerDay(data.commits.recent || [])
      };
      
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

  // Calculer les vraies données
  const commitHistory = generateRealCommitHistory(data?.commits?.recent || []);
  const commitTypes = generateRealCommitTypes(data?.commits?.recent || []);
  const weeklyActivity = generateRealWeeklyActivity(data?.commits?.recent || []);
  const commitTrends = generateRealCommitTrends(data);

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
                  style={{ height: `${(day.commits / Math.max(...weeklyActivity.map(d => d.commits), 1)) * 100}%` }}
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

      {/* Types de commits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-white font-semibold mb-4">Types de Commits</h4>
          <CommitTypesChart data={commitTypes} />
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
          <h4 className="text-white font-semibold mb-4">Tendances</h4>
          <CommitTrendsChart data={commitTrends} />
        </div>
      </div>

      {/* Métriques avancées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdvancedCommitMetric
          title="Taux de Merge"
          value={`${calculateMergeRate(data?.pulls || {})}%`}
          description="Pull requests mergées"
          color="green"
        />
        <AdvancedCommitMetric
          title="Temps Moyen"
          value={`${calculateAverageCommitTime(data?.commits?.recent || [])}h`}
          description="Entre les commits"
          color="blue"
        />
        <AdvancedCommitMetric
          title="Contributeurs Actifs"
          value={data?.contributors?.total || 0}
          description="Ce mois"
          color="purple"
        />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CommitInsight
          type="positive"
          title="Activité Régulière"
          description="Les commits sont distribués de manière cohérente"
          icon="📈"
        />
        <CommitInsight
          type="warning"
          title="Code Reviews"
          description="Améliorer le processus de review"
          icon="👥"
        />
      </div>

      {/* Comparaisons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComparisonCard
          metric="Commits/Jour"
          current={animatedData.averagePerDay.toFixed(1)}
          standard="5.2"
          status="Au-dessus"
          color="green"
        />
        <ComparisonCard
          metric="Taille Moyenne"
          current="2.3"
          standard="3.1"
          status="En dessous"
          color="green"
        />
        <ComparisonCard
          metric="Temps de Merge"
          current="4.2h"
          standard="6.8h"
          status="Plus rapide"
          color="green"
        />
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
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getColorClasses(color)} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">{value}</span>
        </div>
      </div>
      <h5 className="text-white font-medium">{title}</h5>
    </div>
  );
}

function CommitCard({ commit }) {
  const getTypeColor = (type) => {
    const colors = {
      feat: 'bg-green-500/20 text-green-400 border-green-500/30',
      fix: 'bg-red-500/20 text-red-400 border-red-500/30',
      docs: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      refactor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      style: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      test: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      chore: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[type] || colors.chore;
  };

  const getTypeIcon = (type) => {
    const icons = {
      feat: '✨',
      fix: '🐛',
      docs: '📚',
      refactor: '♻️',
      style: '💄',
      test: '🧪',
      chore: '🔧'
    };
    return icons[type] || '📝';
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
      <div className="flex-shrink-0">
        <img
          src={commit.avatar_url || `https://github.com/identicons/${commit.author}.png`}
          alt={commit.author}
          className="w-10 h-10 rounded-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(commit.type)}`}>
            {getTypeIcon(commit.type)} {commit.type}
          </span>
          <span className="text-white font-medium">{commit.author}</span>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-400 text-sm">{commit.time}</span>
        </div>
        <p className="text-gray-300 text-sm mb-2 line-clamp-2">{commit.message}</p>
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>{commit.files} fichier{commit.files > 1 ? 's' : ''}</span>
          <span className="font-mono">{commit.hash}</span>
          {commit.branch && <span>📁 {commit.branch}</span>}
        </div>
      </div>
    </div>
  );
}

function CommitTypesChart({ data }) {
  return (
    <div className="space-y-3">
      {data.map((type, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
            <span className="text-white capitalize">{type.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 font-medium">{type.count}</span>
            <span className="text-gray-400 text-sm">({type.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommitTrendsChart({ data }) {
  return (
    <div className="space-y-3">
      {data.map((trend, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-white">{trend.name}</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${trend.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {trend.trend === 'up' ? '↗' : '↘'} {trend.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdvancedCommitMetric({ title, value, description, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colors[colorName] || colors.green;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-white font-medium">{title}</h5>
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getColorClasses(color)} flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">{value}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function CommitInsight({ type, title, description, icon }) {
  const getTypeColor = (typeName) => {
    const colors = {
      positive: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      negative: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[typeName] || colors.positive;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <h5 className="text-white font-medium mb-1">{title}</h5>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(type)}`}>
          {type === 'positive' ? '✅' : type === 'warning' ? '⚠️' : '❌'}
        </span>
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

// Fonctions pour générer les vraies données
function generateRealCommitHistory(commits) {
  return commits.slice(0, 10).map(commit => {
    const type = getCommitType(commit.message);
    const time = formatTimeAgo(commit.date);
    
    return {
      type,
      message: commit.message.split('\n')[0],
      author: commit.author,
      time,
      files: commit.files?.length || 0,
      hash: commit.sha.substring(0, 7),
      branch: 'main', // On pourrait récupérer la branche si disponible
      avatar_url: commit.avatar_url
    };
  });
}

function generateRealCommitTypes(commits) {
  const typeCounts = {};
  const total = commits.length;

  commits.forEach(commit => {
    const type = getCommitType(commit.message);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const colors = {
    feat: 'bg-green-500',
    fix: 'bg-red-500',
    docs: 'bg-blue-500',
    refactor: 'bg-yellow-500',
    style: 'bg-purple-500',
    test: 'bg-orange-500',
    chore: 'bg-gray-500'
  };

  return Object.entries(typeCounts).map(([type, count]) => ({
    name: type,
    count,
    percentage: Math.round((count / total) * 100),
    color: colors[type] || colors.chore
  })).sort((a, b) => b.count - a.count);
}

function generateRealWeeklyActivity(commits) {
  const now = new Date();
  const activity = {};

  // Initialiser les 30 derniers jours
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    activity[dateStr] = 0;
  }

  // Compter les commits par jour
  commits.forEach(commit => {
    const date = new Date(commit.date).toISOString().split('T')[0];
    if (activity[date] !== undefined) {
      activity[date]++;
    }
  });

  return Object.entries(activity).map(([date, commits]) => ({
    day: new Date(date).getDate().toString(),
    commits
  }));
}

function generateRealCommitTrends(data) {
  const trends = [];
  
  if (data?.trends?.commits) {
    const { recent, previous, trend } = data.trends.commits;
    trends.push({
      name: 'Commits par jour',
      trend: trend > 0 ? 'up' : 'down',
      value: `${trend > 0 ? '+' : ''}${Math.round(trend)}%`
    });
  }

  if (data?.commits?.total) {
    trends.push({
      name: 'Total commits',
      trend: 'up',
      value: `+${data.commits.total}`
    });
  }

  if (data?.contributors?.total) {
    trends.push({
      name: 'Contributeurs',
      trend: 'up',
      value: `+${data.contributors.total}`
    });
  }

  return trends;
}

// Fonctions utilitaires
function getCommitType(message) {
  const types = ['feat', 'fix', 'docs', 'refactor', 'style', 'test', 'chore'];
  const lowerMessage = message.toLowerCase();
  
  for (const type of types) {
    if (lowerMessage.startsWith(type + ':')) {
      return type;
    }
  }
  return 'chore';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'À l\'instant';
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return `Il y a ${Math.ceil(diffDays / 7)}sem`;
}

function calculateThisMonth(commits) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return commits.filter(commit => new Date(commit.date) >= thisMonth).length;
}

function calculateThisWeek(commits) {
  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return commits.filter(commit => new Date(commit.date) >= thisWeek).length;
}

function calculateAveragePerDay(commits) {
  if (commits.length === 0) return 0;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentCommits = commits.filter(commit => new Date(commit.date) >= thirtyDaysAgo);
  
  return recentCommits.length / 30;
}

function calculateMergeRate(pulls) {
  if (!pulls.total || pulls.total === 0) return 0;
  return Math.round((pulls.merged / pulls.total) * 100);
}

function calculateAverageCommitTime(commits) {
  if (commits.length < 2) return 0;
  
  const sortedCommits = commits.sort((a, b) => new Date(b.date) - new Date(a.date));
  const timeDiffs = [];
  
  for (let i = 0; i < sortedCommits.length - 1; i++) {
    const diff = new Date(sortedCommits[i].date) - new Date(sortedCommits[i + 1].date);
    timeDiffs.push(diff / (1000 * 60 * 60)); // Convertir en heures
  }
  
  const average = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
  return Math.round(average);
} 