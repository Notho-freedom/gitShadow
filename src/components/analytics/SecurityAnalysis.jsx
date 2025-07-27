'use client';

import { useEffect, useState } from 'react';

export default function SecurityAnalysis({ data }) {
  const [animatedData, setAnimatedData] = useState({
    vulnerabilities: 0,
    criticalIssues: 0,
    securityScore: 0,
    lastScan: ''
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
          if (key !== 'lastScan') {
            currentData[key] = targetData[key] * progress;
          } else {
            currentData[key] = targetData[key];
          }
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

  const getSecurityColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSecurityStatus = (score) => {
    if (score >= 90) return { status: 'Sécurisé', emoji: '🛡️', color: 'text-green-400' };
    if (score >= 80) return { status: 'Modérément Sécurisé', emoji: '⚠️', color: 'text-yellow-400' };
    if (score >= 70) return { status: 'À Risque', emoji: '🔴', color: 'text-orange-400' };
    return { status: 'Critique', emoji: '🚨', color: 'text-red-400' };
  };

  const securityStatus = getSecurityStatus(animatedData.securityScore);

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Analyse de Sécurité</h3>
          <div className={`text-2xl ${securityStatus.color}`}>
            {securityStatus.emoji}
          </div>
        </div>

        {/* Score de sécurité principal */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold bg-gradient-to-r ${getSecurityGradient(animatedData.securityScore)} bg-clip-text text-transparent mb-2`}>
            {Math.round(animatedData.securityScore)}
          </div>
          <div className="text-gray-400 text-sm">Score de Sécurité Global</div>
          <div className={`text-lg font-semibold mt-2 ${securityStatus.color}`}>
            {securityStatus.status}
          </div>
        </div>

        {/* Métriques de sécurité */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SecurityMetric
            title="Vulnérabilités"
            value={animatedData.vulnerabilities}
            max={10}
            color="red"
            icon="🔍"
            inverse
          />
          <SecurityMetric
            title="Problèmes Critiques"
            value={animatedData.criticalIssues}
            max={5}
            color="orange"
            icon="🚨"
            inverse
          />
          <SecurityMetric
            title="Dernier Scan"
            value={animatedData.lastScan}
            max={100}
            color="green"
            icon="📅"
            isDate
          />
        </div>
      </div>

      {/* Analyse des vulnérabilités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VulnerabilityChart data={generateVulnerabilityData()} />
        <SecurityTimeline data={generateSecurityTimeline()} />
      </div>

      {/* Détails des vulnérabilités */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Vulnérabilités Détectées</h4>
        
        {animatedData.vulnerabilities > 0 ? (
          <div className="space-y-4">
            <VulnerabilityCard
              severity="Critique"
              title="Dépendance obsolète"
              description="lodash@4.17.15 contient une vulnérabilité CVE-2021-23337"
              cve="CVE-2021-23337"
              status="À corriger"
              color="red"
            />
            <VulnerabilityCard
              severity="Élevée"
              title="Injection SQL potentielle"
              description="Requête non paramétrée dans userService.js ligne 45"
              cve="CWE-89"
              status="En cours"
              color="orange"
            />
            {animatedData.vulnerabilities > 2 && (
              <VulnerabilityCard
                severity="Moyenne"
                title="Headers de sécurité manquants"
                description="Helmet.js non configuré pour les headers de sécurité"
                cve="CWE-693"
                status="Planifié"
                color="yellow"
              />
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h5 className="text-white font-medium mb-2">Aucune vulnérabilité détectée</h5>
            <p className="text-gray-400 text-sm">Votre code est sécurisé !</p>
          </div>
        )}
      </div>

      {/* Recommandations de sécurité */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Recommandations de Sécurité</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SecurityRecommendation
              priority="Critique"
              title="Mettre à jour les dépendances"
              description="Mettre à jour lodash vers la version 4.17.21"
              impact="Élimine CVE-2021-23337"
              effort="5 minutes"
              color="red"
            />
            <SecurityRecommendation
              priority="Élevée"
              title="Paramétrer les requêtes SQL"
              description="Utiliser des requêtes préparées pour éviter l'injection"
              impact="Prévention des injections SQL"
              effort="2 heures"
              color="orange"
            />
          </div>
          
          <div className="space-y-4">
            <SecurityRecommendation
              priority="Moyenne"
              title="Configurer Helmet.js"
              description="Ajouter les headers de sécurité appropriés"
              impact="Améliore la sécurité générale"
              effort="30 minutes"
              color="yellow"
            />
            <SecurityRecommendation
              priority="Basse"
              title="Audit de sécurité régulier"
              description="Programmer des scans automatiques hebdomadaires"
              impact="Détection précoce des vulnérabilités"
              effort="Configuration initiale"
              color="blue"
            />
          </div>
        </div>
      </div>

      {/* Compliance et standards */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Compliance et Standards</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComplianceCard
            standard="OWASP Top 10"
            status="Conforme"
            score={85}
            color="green"
          />
          <ComplianceCard
            standard="CWE/SANS Top 25"
            status="Partiellement Conforme"
            score={72}
            color="yellow"
          />
          <ComplianceCard
            standard="NIST Cybersecurity"
            status="En cours"
            score={68}
            color="orange"
          />
        </div>
      </div>
    </div>
  );
}

function SecurityMetric({ title, value, max, color, icon, inverse = false, isDate = false }) {
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
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">
        {isDate ? value : value}
      </div>
      {!isDate && (
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
            style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function VulnerabilityChart({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Répartition par Sévérité</h5>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
              <span className="text-white text-sm">{item.severity}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{item.count}</span>
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTimeline({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Historique des Scans</h5>
      <div className="space-y-3">
        {data.map((scan, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${scan.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-white text-sm">{scan.date}</span>
            </div>
            <span className={`text-sm ${scan.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {scan.vulnerabilities} vulnérabilités
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VulnerabilityCard({ severity, title, description, cve, status, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      yellow: 'from-yellow-500 to-yellow-600'
    };
    return colors[colorName] || colors.red;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start justify-between mb-3">
        <h5 className="text-white font-medium">{title}</h5>
        <span className={`px-2 py-1 text-xs rounded bg-gradient-to-r ${getColorClasses(color)} text-white`}>
          {severity}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-blue-400">{cve}</span>
        <span className="text-gray-400">{status}</span>
      </div>
    </div>
  );
}

function SecurityRecommendation({ priority, title, description, impact, effort, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
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

function ComplianceCard({ standard, status, score, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      orange: 'from-orange-500 to-orange-600'
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
      <span className={`text-sm ${color === 'green' ? 'text-green-400' : color === 'yellow' ? 'text-yellow-400' : 'text-orange-400'}`}>
        {status}
      </span>
    </div>
  );
}

function getSecurityGradient(score) {
  if (score >= 90) return 'from-green-400 to-emerald-400';
  if (score >= 80) return 'from-yellow-400 to-orange-400';
  if (score >= 70) return 'from-orange-400 to-red-400';
  return 'from-red-400 to-pink-400';
}

function generateVulnerabilityData() {
  return [
    { severity: 'Critique', count: 1, percentage: 25, color: 'bg-red-500' },
    { severity: 'Élevée', count: 1, percentage: 25, color: 'bg-orange-500' },
    { severity: 'Moyenne', count: 1, percentage: 25, color: 'bg-yellow-500' },
    { severity: 'Basse', count: 1, percentage: 25, color: 'bg-blue-500' }
  ];
}

function generateSecurityTimeline() {
  return [
    { date: '2024-01-15', status: 'success', vulnerabilities: 2 },
    { date: '2024-01-08', status: 'success', vulnerabilities: 3 },
    { date: '2024-01-01', status: 'success', vulnerabilities: 1 },
    { date: '2024-12-25', status: 'success', vulnerabilities: 4 }
  ];
} 