'use client';

import { useEffect, useState } from 'react';

export default function CodeComplexityChart({ data }) {
  const [animatedData, setAnimatedData] = useState({
    cyclomaticComplexity: 0,
    codeDuplication: 0,
    testCoverage: 0,
    documentationCoverage: 0
  });

  useEffect(() => {
    const animateData = () => {
      const targetData = {
        cyclomaticComplexity: data.cyclomaticComplexity,
        codeDuplication: data.codeDuplication,
        testCoverage: data.testCoverage,
        documentationCoverage: data.documentationCoverage
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

  const getComplexityColor = (value) => {
    if (value <= 3) return 'text-green-400';
    if (value <= 5) return 'text-yellow-400';
    if (value <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplexityStatus = (value) => {
    if (value <= 3) return { status: 'Simple', emoji: '✅' };
    if (value <= 5) return { status: 'Modérée', emoji: '⚠️' };
    if (value <= 7) return { status: 'Élevée', emoji: '🔴' };
    return { status: 'Critique', emoji: '🚨' };
  };

  const complexityStatus = getComplexityStatus(animatedData.cyclomaticComplexity);

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Analyse de Complexité</h3>
        <div className={`text-2xl ${getComplexityColor(animatedData.cyclomaticComplexity)}`}>
          {complexityStatus.emoji}
        </div>
      </div>

      {/* Complexité cyclomatique principale */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white mb-2">
          {animatedData.cyclomaticComplexity.toFixed(1)}
        </div>
        <div className="text-gray-400 text-sm">Complexité cyclomatique moyenne</div>
        <div className={`text-sm font-medium mt-1 ${getComplexityColor(animatedData.cyclomaticComplexity)}`}>
          {complexityStatus.status}
        </div>
      </div>

      {/* Graphique radar simplifié */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <ComplexityMetric
            label="Duplication"
            value={animatedData.codeDuplication}
            max={20}
            color="red"
            icon="🔄"
          />
          <ComplexityMetric
            label="Couverture Tests"
            value={animatedData.testCoverage}
            max={100}
            color="green"
            icon="🧪"
          />
          <ComplexityMetric
            label="Documentation"
            value={animatedData.documentationCoverage}
            max={100}
            color="blue"
            icon="📚"
          />
          <ComplexityMetric
            label="Complexité"
            value={animatedData.cyclomaticComplexity}
            max={10}
            color="orange"
            icon="🧠"
          />
        </div>
      </div>

      {/* Analyse détaillée */}
      <div className="space-y-4">
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Analyse Détaillée</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fonctions complexes (&gt;5):</span>
              <span className="text-white font-medium">
                {Math.round(animatedData.cyclomaticComplexity * 2.5)} fonctions
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Code dupliqué:</span>
              <span className="text-white font-medium">
                {animatedData.codeDuplication.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tests manquants:</span>
              <span className="text-white font-medium">
                {Math.round(100 - animatedData.testCoverage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Recommandations</h4>
          <div className="space-y-2 text-sm">
            {animatedData.cyclomaticComplexity > 5 && (
              <div className="flex items-center text-orange-400">
                <span className="mr-2">🔧</span>
                Refactoriser les fonctions complexes
              </div>
            )}
            {animatedData.codeDuplication > 10 && (
              <div className="flex items-center text-red-400">
                <span className="mr-2">🔄</span>
                Éliminer le code dupliqué
              </div>
            )}
            {animatedData.testCoverage < 80 && (
              <div className="flex items-center text-blue-400">
                <span className="mr-2">🧪</span>
                Augmenter la couverture de tests
              </div>
            )}
            {animatedData.documentationCoverage < 70 && (
              <div className="flex items-center text-purple-400">
                <span className="mr-2">📚</span>
                Améliorer la documentation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplexityMetric({ label, value, max, color, icon }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = (colorName) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="text-lg font-bold text-white mb-1">
        {value.toFixed(1)}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {percentage.toFixed(0)}% du maximum
      </div>
    </div>
  );
} 