import React, { useState, useEffect } from 'react';

export default function RepositoryDetails({ data }) {
  const [animatedData, setAnimatedData] = useState({
    stars: 0,
    forks: 0,
    watchers: 0,
    size: 0,
    openIssues: 0
  });

  useEffect(() => {
    if (!data) return;

    const animateData = () => {
      // Extraire les vraies données du repository
      const repoStats = data.repoStats || {};
      const issues = data.issues || {};
      const pulls = data.pulls || {};
      
      const targetData = {
        stars: repoStats.stargazers_count || 0,
        forks: repoStats.forks_count || 0,
        watchers: repoStats.watchers_count || 0,
        size: repoStats.size || 0,
        openIssues: issues.open || 0
      };

      const steps = 30;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setAnimatedData({
          stars: Math.floor(targetData.stars * progress),
          forks: Math.floor(targetData.forks * progress),
          watchers: Math.floor(targetData.watchers * progress),
          size: Math.floor(targetData.size * progress),
          openIssues: Math.floor(targetData.openIssues * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, 50);

      return () => clearInterval(timer);
    };

    animateData();
  }, [data]);

  if (!data) {
    return (
      <div className="bg-gray-800/20 border border-gray-600/50 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-2xl mb-2">📊</div>
        <h3 className="text-gray-300 font-semibold mb-2">Aucune donnée disponible</h3>
      </div>
    );
  }

  // Extraire les vraies données
  const repoStats = data.repoStats || {};
  const issues = data.issues || {};
  const pulls = data.pulls || {};
  const languages = data.languages || {};

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'PHP': 'bg-purple-500',
      'Ruby': 'bg-red-600',
      'C#': 'bg-green-600',
      'Swift': 'bg-orange-600',
      'Kotlin': 'bg-purple-600',
      'C++': 'bg-blue-600',
      'C': 'bg-gray-500',
      'HTML': 'bg-orange-500',
      'CSS': 'bg-blue-500',
      'Shell': 'bg-green-600',
      'Dockerfile': 'bg-blue-600',
      'Makefile': 'bg-gray-600'
    };
    return colors[language] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtenir le langage principal
  const mainLanguage = Object.keys(languages).length > 0 
    ? Object.keys(languages).sort((a, b) => languages[b] - languages[a])[0]
    : repoStats.language;

  return (
    <div className="space-y-6">
      {/* Header avec informations principales */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {repoStats.name || 'Repository'}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {repoStats.description || 'Aucune description disponible'}
            </p>
            
            {/* Langage principal */}
            {mainLanguage && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(mainLanguage)}`}></div>
                <span className="text-white font-medium">{mainLanguage}</span>
                {languages[mainLanguage] && (
                  <span className="text-gray-400 text-sm">
                    ({Math.round((languages[mainLanguage] / Object.values(languages).reduce((a, b) => a + b, 0)) * 100)}%)
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Statistiques principales */}
          <div className="text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">⭐</div>
                <div className="text-lg font-bold text-white">{animatedData.stars}</div>
                <div className="text-xs text-gray-400">Stars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">🔀</div>
                <div className="text-lg font-bold text-white">{animatedData.forks}</div>
                <div className="text-xs text-gray-400">Forks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Taille"
            value={formatSize(animatedData.size * 1024)} // GitHub retourne en KB
            icon="📦"
            color="blue"
          />
          <MetricCard
            title="Watchers"
            value={animatedData.watchers}
            icon="👀"
            color="green"
          />
          <MetricCard
            title="Issues Ouvertes"
            value={animatedData.openIssues}
            icon="🐛"
            color="red"
          />
          <MetricCard
            title="Licence"
            value={repoStats.license?.name || 'Non spécifiée'}
            icon="📄"
            color="purple"
          />
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations temporelles */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Informations Temporelles</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Créé le:</span>
              <span className="text-white">{formatDate(repoStats.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernière mise à jour:</span>
              <span className="text-white">{formatDate(repoStats.updated_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernier push:</span>
              <span className="text-white">{formatDate(repoStats.pushed_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Branche par défaut:</span>
              <span className="text-white">{repoStats.default_branch || 'main'}</span>
            </div>
          </div>
        </div>

        {/* Statut du repository */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Statut du Repository</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Archivé:</span>
              <span className={`px-2 py-1 rounded text-xs ${repoStats.archived ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {repoStats.archived ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Désactivé:</span>
              <span className={`px-2 py-1 rounded text-xs ${repoStats.disabled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {repoStats.disabled ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Licence:</span>
              <span className="text-white">{repoStats.license?.name || 'Non spécifiée'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Topics:</span>
              <span className="text-white">{repoStats.topics?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Langages utilisés */}
      {Object.keys(languages).length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Langages Utilisés</h4>
          <div className="space-y-2">
            {Object.entries(languages)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([language, bytes]) => {
                const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
                const percentage = Math.round((bytes / totalBytes) * 100);
                return (
                  <div key={language} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}></div>
                      <span className="text-white text-sm">{language}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">{percentage}%</span>
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getLanguageColor(language)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Topics */}
      {repoStats.topics && repoStats.topics.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {repoStats.topics.map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques d'activité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Issues</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Ouvertes:</span>
              <span className="text-white">{issues.open || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fermées:</span>
              <span className="text-white">{issues.closed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-white">{issues.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Pull Requests</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Ouvertes:</span>
              <span className="text-white">{pulls.open || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mergeées:</span>
              <span className="text-white">{pulls.merged || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-white">{pulls.total || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Commits</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-white">{data.commits?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ce mois:</span>
              <span className="text-white">{data.commits?.recent?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contributeurs:</span>
              <span className="text-white">{data.contributors?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      yellow: 'from-yellow-500 to-yellow-600',
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
        {value}
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