'use client';

import { useEffect, useState } from 'react';

export default function RepositoryHealthScore({ data }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const animateScore = () => {
      let current = 0;
      const target = data.healthScore;
      const increment = target / 50;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
          setIsAnimating(false);
        }
        setAnimatedScore(Math.round(current));
      }, 30);

      return () => clearInterval(timer);
    };

    animateScore();
  }, [data.healthScore]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-yellow-500 to-orange-500';
    if (score >= 70) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getHealthStatus = (score) => {
    if (score >= 90) return { status: 'Excellent', emoji: '🌟', color: 'text-green-400' };
    if (score >= 80) return { status: 'Bon', emoji: '✅', color: 'text-yellow-400' };
    if (score >= 70) return { status: 'Moyen', emoji: '⚠️', color: 'text-orange-400' };
    return { status: 'Critique', emoji: '🚨', color: 'text-red-400' };
  };

  const healthStatus = getHealthStatus(data.healthScore);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Score de Santé du Repository</h3>
        <div className={`text-2xl ${healthStatus.color}`}>
          {healthStatus.emoji}
        </div>
      </div>

      {/* Score principal avec animation */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreGradient(data.healthScore)} bg-clip-text text-transparent ${
            isAnimating ? 'animate-pulse' : ''
          }`}>
            {animatedScore}
          </div>
          <div className="text-gray-400 text-sm mt-2">/ 100</div>
        </div>
        <div className={`text-lg font-semibold mt-2 ${healthStatus.color}`}>
          {healthStatus.status}
        </div>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Complexité"
          value={data.complexityScore}
          max={100}
          color="blue"
          icon="🧠"
        />
        <MetricCard
          title="Maintenabilité"
          value={data.maintainabilityIndex}
          max={100}
          color="green"
          icon="🔧"
        />
        <MetricCard
          title="Dette Technique"
          value={data.technicalDebt}
          max={100}
          color="red"
          icon="💸"
          inverse
        />
        <MetricCard
          title="Couverture"
          value={data.codeCoverage}
          max={100}
          color="purple"
          icon="🛡️"
        />
      </div>

      {/* Recommandations */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
        <h4 className="text-white font-semibold mb-3">Recommandations</h4>
        <div className="space-y-2 text-sm">
          {data.technicalDebt > 20 && (
            <div className="flex items-center text-yellow-400">
              <span className="mr-2">⚠️</span>
              Réduire la dette technique (actuellement {data.technicalDebt}%)
            </div>
          )}
          {data.codeCoverage < 80 && (
            <div className="flex items-center text-blue-400">
              <span className="mr-2">📈</span>
              Améliorer la couverture de tests (actuellement {data.codeCoverage}%)
            </div>
          )}
          {data.complexityScore > 70 && (
            <div className="flex items-center text-orange-400">
              <span className="mr-2">🔍</span>
              Simplifier la complexité cyclomatique
            </div>
          )}
          {data.healthScore >= 90 && (
            <div className="flex items-center text-green-400">
              <span className="mr-2">🎉</span>
              Repository en excellente santé !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, max, color, icon, inverse = false }) {
  const percentage = (value / max) * 100;
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      yellow: 'from-yellow-500 to-yellow-600'
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
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {inverse ? `${max - value} restant` : `${percentage.toFixed(0)}%`}
      </div>
    </div>
  );
} 