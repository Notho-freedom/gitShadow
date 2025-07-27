'use client';

import { useEffect, useState } from 'react';

export default function PerformanceMetrics({ data }) {
  const [animatedData, setAnimatedData] = useState({
    buildTime: 0,
    testTime: 0,
    deploymentTime: 0,
    responseTime: 0
  });

  useEffect(() => {
    const animateData = () => {
      const targetData = { ...data };
      let currentData = { ...animatedData };
      const steps = 40;
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

  const getPerformanceColor = (value, threshold) => {
    if (value <= threshold * 0.7) return 'text-green-400';
    if (value <= threshold) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceStatus = (value, threshold) => {
    if (value <= threshold * 0.7) return { status: 'Excellent', emoji: '🚀' };
    if (value <= threshold) return { status: 'Bon', emoji: '✅' };
    return { status: 'À améliorer', emoji: '⚠️' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Métriques de Performance</h3>
          <div className="text-2xl">⚡</div>
        </div>

        {/* Score de performance global */}
        <div className="text-center mb-8">
          <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {Math.round((1 - (animatedData.buildTime + animatedData.testTime + animatedData.deploymentTime) / 15) * 100)}
          </div>
          <div className="text-gray-400 text-sm">Score de Performance Global</div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PerformanceMetric
            title="Temps de Build"
            value={animatedData.buildTime}
            unit="min"
            threshold={5}
            color="blue"
            icon="🔨"
          />
          <PerformanceMetric
            title="Temps de Tests"
            value={animatedData.testTime}
            unit="min"
            threshold={3}
            color="green"
            icon="🧪"
          />
          <PerformanceMetric
            title="Déploiement"
            value={animatedData.deploymentTime}
            unit="min"
            threshold={8}
            color="purple"
            icon="🚀"
          />
          <PerformanceMetric
            title="Temps de Réponse"
            value={animatedData.responseTime}
            unit="ms"
            threshold={200}
            color="orange"
            icon="⚡"
          />
        </div>
      </div>

      {/* Graphiques de tendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="Évolution des Temps de Build"
          data={generateTrendData('build')}
          color="blue"
        />
        <TrendChart
          title="Évolution des Temps de Test"
          data={generateTrendData('test')}
          color="green"
        />
      </div>

      {/* Analyse détaillée */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Analyse Détaillée</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Optimisations possibles */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h5 className="text-white font-medium mb-3">Optimisations Possibles</h5>
            <div className="space-y-3 text-sm">
              {animatedData.buildTime > 3 && (
                <div className="flex items-center text-blue-400">
                  <span className="mr-2">🔧</span>
                  Optimiser la configuration webpack
                </div>
              )}
              {animatedData.testTime > 2 && (
                <div className="flex items-center text-green-400">
                  <span className="mr-2">⚡</span>
                  Paralléliser les tests unitaires
                </div>
              )}
              {animatedData.deploymentTime > 5 && (
                <div className="flex items-center text-purple-400">
                  <span className="mr-2">🚀</span>
                  Améliorer le pipeline CI/CD
                </div>
              )}
              {animatedData.responseTime > 150 && (
                <div className="flex items-center text-orange-400">
                  <span className="mr-2">📊</span>
                  Optimiser les requêtes API
                </div>
              )}
            </div>
          </div>

          {/* Comparaison avec les standards */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h5 className="text-white font-medium mb-3">Comparaison Standards</h5>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Build Time:</span>
                <span className={getPerformanceColor(animatedData.buildTime, 5)}>
                  {animatedData.buildTime.toFixed(1)}min vs 3min (standard)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Test Time:</span>
                <span className={getPerformanceColor(animatedData.testTime, 3)}>
                  {animatedData.testTime.toFixed(1)}min vs 2min (standard)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Deployment:</span>
                <span className={getPerformanceColor(animatedData.deploymentTime, 8)}>
                  {animatedData.deploymentTime.toFixed(1)}min vs 5min (standard)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Response Time:</span>
                <span className={getPerformanceColor(animatedData.responseTime, 200)}>
                  {Math.round(animatedData.responseTime)}ms vs 150ms (standard)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Recommandations Prioritaires</h4>
        <div className="space-y-4">
          <RecommendationCard
            priority="Haute"
            title="Optimiser le Build"
            description="Réduire le temps de build de 2.3min à 1.5min"
            impact="Impact: Élevé"
            effort="Effort: Moyen"
            color="red"
          />
          <RecommendationCard
            priority="Moyenne"
            title="Paralléliser les Tests"
            description="Réduire le temps de test de 1.8min à 1.2min"
            impact="Impact: Moyen"
            effort="Effort: Faible"
            color="yellow"
          />
          <RecommendationCard
            priority="Basse"
            title="Optimiser le Déploiement"
            description="Réduire le temps de déploiement de 4.2min à 3min"
            impact="Impact: Moyen"
            effort="Effort: Élevé"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

function PerformanceMetric({ title, value, unit, threshold, color, icon }) {
  const status = getPerformanceStatus(value, threshold);
  
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
      <div className="text-2xl font-bold text-white mb-1">
        {value.toFixed(1)}{unit}
      </div>
      <div className="text-sm text-gray-400 mb-2">
        {status.emoji} {status.status}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
          style={{ width: `${Math.min((value / threshold) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function TrendChart({ title, data, color }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">{title}</h5>
      <div className="flex items-end justify-between h-32">
        {data.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 bg-gradient-to-t ${getColorClasses(color)} rounded-t transition-all duration-500`}
              style={{ height: `${(point.value / maxValue) * 100}%` }}
            />
            <div className="text-xs text-gray-400 mt-2">{point.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ priority, title, description, impact, effort, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start justify-between mb-3">
        <h5 className="text-white font-medium">{title}</h5>
        <span className={`px-2 py-1 text-xs rounded bg-gradient-to-r ${getColorClasses(color)} text-white`}>
          {priority}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="flex justify-between text-xs">
        <span className="text-green-400">{impact}</span>
        <span className="text-blue-400">{effort}</span>
      </div>
    </div>
  );
}

function getColorClasses(colorName) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };
  return colors[colorName] || colors.blue;
}

function generateTrendData(type) {
  const baseValue = type === 'build' ? 2.3 : 1.8;
  return Array.from({ length: 7 }, (_, i) => ({
    label: `${i + 1}j`,
    value: baseValue + (Math.random() - 0.5) * 0.8
  }));
} 