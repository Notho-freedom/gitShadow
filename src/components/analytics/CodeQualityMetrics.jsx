'use client';

import { useEffect, useState } from 'react';

export default function CodeQualityMetrics({ data }) {
  const [animatedData, setAnimatedData] = useState({
    cyclomaticComplexity: 0,
    codeDuplication: 0,
    testCoverage: 0,
    documentationCoverage: 0
  });

  useEffect(() => {
    const animateData = () => {
      const targetData = { ...data };
      let currentData = { ...animatedData };
      const steps = 35;
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

  const getQualityScore = () => {
    const complexityScore = Math.max(0, 100 - (animatedData.cyclomaticComplexity - 3) * 10);
    const duplicationScore = Math.max(0, 100 - animatedData.codeDuplication * 2);
    const testScore = animatedData.testCoverage;
    const docScore = animatedData.documentationCoverage;
    
    return Math.round((complexityScore + duplicationScore + testScore + docScore) / 4);
  };

  const qualityScore = getQualityScore();

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Qualité du Code</h3>
          <div className="text-2xl">🔍</div>
        </div>

        {/* Score de qualité principal */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold bg-gradient-to-r ${getQualityGradient(qualityScore)} bg-clip-text text-transparent mb-2`}>
            {qualityScore}
          </div>
          <div className="text-gray-400 text-sm">Score de Qualité Global</div>
          <div className={`text-lg font-semibold mt-2 ${getQualityColor(qualityScore)}`}>
            {getQualityStatus(qualityScore)}
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QualityMetric
            title="Complexité"
            value={animatedData.cyclomaticComplexity}
            max={10}
            color="blue"
            icon="🧠"
            inverse
          />
          <QualityMetric
            title="Duplication"
            value={animatedData.codeDuplication}
            max={20}
            color="red"
            icon="🔄"
            inverse
          />
          <QualityMetric
            title="Tests"
            value={animatedData.testCoverage}
            max={100}
            color="green"
            icon="🧪"
          />
          <QualityMetric
            title="Documentation"
            value={animatedData.documentationCoverage}
            max={100}
            color="purple"
            icon="📚"
          />
        </div>
      </div>

      {/* Analyse détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplexityAnalysis data={animatedData} />
        <CoverageAnalysis data={animatedData} />
      </div>

      {/* Recommandations de qualité */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Recommandations d'Amélioration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {animatedData.cyclomaticComplexity > 5 && (
              <QualityRecommendation
                priority="Haute"
                title="Simplifier la complexité"
                description="Refactoriser les fonctions avec une complexité > 5"
                impact="Améliore la maintenabilité"
                effort="2-4 heures"
                color="red"
              />
            )}
            {animatedData.codeDuplication > 10 && (
              <QualityRecommendation
                priority="Moyenne"
                title="Éliminer la duplication"
                description="Extraire le code dupliqué en fonctions réutilisables"
                impact="Réduit la maintenance"
                effort="1-2 heures"
                color="orange"
              />
            )}
          </div>
          
          <div className="space-y-4">
            {animatedData.testCoverage < 80 && (
              <QualityRecommendation
                priority="Haute"
                title="Augmenter la couverture"
                description="Ajouter des tests pour atteindre 80% de couverture"
                impact="Améliore la fiabilité"
                effort="4-6 heures"
                color="green"
              />
            )}
            {animatedData.documentationCoverage < 70 && (
              <QualityRecommendation
                priority="Basse"
                title="Améliorer la documentation"
                description="Ajouter des commentaires et de la documentation"
                impact="Facilite la maintenance"
                effort="2-3 heures"
                color="blue"
              />
            )}
          </div>
        </div>
      </div>

      {/* Standards et bonnes pratiques */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Standards de Qualité</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StandardCard
            standard="Complexité Cyclomatique"
            status={animatedData.cyclomaticComplexity <= 5 ? "Conforme" : "À améliorer"}
            score={Math.max(0, 100 - (animatedData.cyclomaticComplexity - 3) * 20)}
            color={animatedData.cyclomaticComplexity <= 5 ? "green" : "orange"}
          />
          <StandardCard
            standard="Couverture de Tests"
            status={animatedData.testCoverage >= 80 ? "Conforme" : "Insuffisante"}
            score={animatedData.testCoverage}
            color={animatedData.testCoverage >= 80 ? "green" : "red"}
          />
          <StandardCard
            standard="Duplication de Code"
            status={animatedData.codeDuplication <= 10 ? "Conforme" : "Élevée"}
            score={Math.max(0, 100 - animatedData.codeDuplication * 3)}
            color={animatedData.codeDuplication <= 10 ? "green" : "orange"}
          />
        </div>
      </div>

      {/* Métriques avancées */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Métriques Avancées</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdvancedMetric
            title="Maintenabilité"
            value={calculateMaintainability()}
            description="Index de maintenabilité basé sur la complexité et la duplication"
            color="green"
          />
          <AdvancedMetric
            title="Fiabilité"
            value={calculateReliability()}
            description="Score de fiabilité basé sur la couverture de tests"
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

function QualityMetric({ title, value, max, color, icon, inverse = false }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">
        {value.toFixed(1)}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {inverse ? `${max - value.toFixed(1)} restant` : `${percentage.toFixed(0)}%`}
      </div>
    </div>
  );
}

function ComplexityAnalysis({ data }) {
  const complexityLevels = [
    { level: 'Simple', range: '1-3', count: Math.round(data.cyclomaticComplexity * 0.4) },
    { level: 'Modérée', range: '4-5', count: Math.round(data.cyclomaticComplexity * 0.3) },
    { level: 'Élevée', range: '6-8', count: Math.round(data.cyclomaticComplexity * 0.2) },
    { level: 'Critique', range: '9+', count: Math.round(data.cyclomaticComplexity * 0.1) }
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Analyse de Complexité</h5>
      <div className="space-y-3">
        {complexityLevels.map((level, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${getComplexityColor(index)}`}></div>
              <span className="text-white text-sm">{level.level} ({level.range})</span>
            </div>
            <span className="text-gray-400 text-sm">{level.count} fonctions</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverageAnalysis({ data }) {
  const coverageTypes = [
    { type: 'Unit Tests', coverage: data.testCoverage * 0.8, color: 'bg-green-500' },
    { type: 'Integration Tests', coverage: data.testCoverage * 0.6, color: 'bg-blue-500' },
    { type: 'E2E Tests', coverage: data.testCoverage * 0.4, color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Analyse de Couverture</h5>
      <div className="space-y-3">
        {coverageTypes.map((type, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-white text-sm">{type.type}</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{type.coverage.toFixed(0)}%</span>
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${type.color}`}
                  style={{ width: `${type.coverage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityRecommendation({ priority, title, description, impact, effort, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      green: 'from-green-500 to-green-600',
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

function StandardCard({ standard, status, score, color }) {
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
      <h5 className="text-white font-medium mb-2">{standard}</h5>
      <div className="text-2xl font-bold text-white mb-2">{score}%</div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm ${color === 'green' ? 'text-green-400' : color === 'orange' ? 'text-orange-400' : 'text-red-400'}`}>
        {status}
      </span>
    </div>
  );
}

function AdvancedMetric({ title, value, description, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600'
    };
    return colors[colorName] || colors.green;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-2">{title}</h5>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function getQualityGradient(score) {
  if (score >= 90) return 'from-green-400 to-emerald-400';
  if (score >= 80) return 'from-yellow-400 to-orange-400';
  if (score >= 70) return 'from-orange-400 to-red-400';
  return 'from-red-400 to-pink-400';
}

function getQualityColor(score) {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-yellow-400';
  if (score >= 70) return 'text-orange-400';
  return 'text-red-400';
}

function getQualityStatus(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Bon';
  if (score >= 70) return 'Moyen';
  return 'À améliorer';
}

function getComplexityColor(index) {
  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
  return colors[index] || colors[0];
}

function calculateMaintainability() {
  // Simulation d'un calcul d'index de maintenabilité
  return Math.round(85 + Math.random() * 10);
}

function calculateReliability() {
  // Simulation d'un calcul de fiabilité
  return Math.round(78 + Math.random() * 15);
} 