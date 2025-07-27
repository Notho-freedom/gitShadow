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
      const targetData = {
        stars: data.stars || 0,
        forks: data.forks || 0,
        watchers: data.watchers || 0,
        size: data.size || 0,
        openIssues: data.openIssues || 0
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
      'Kotlin': 'bg-purple-600'
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header avec informations principales */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{data.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{data.description || 'Aucune description disponible'}</p>
            
            {/* Langage principal */}
            {data.language && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(data.language)}`}></div>
                <span className="text-white font-medium">{data.language}</span>
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
            value={formatSize(animatedData.size)}
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
            value={data.license || 'Non spécifiée'}
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
              <span className="text-white">{new Date(data.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernière mise à jour:</span>
              <span className="text-white">{new Date(data.updatedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernier push:</span>
              <span className="text-white">{new Date(data.pushedAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Branche par défaut:</span>
              <span className="text-white">{data.defaultBranch}</span>
            </div>
          </div>
        </div>

        {/* Statut du repository */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Statut du Repository</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Archivé:</span>
              <span className={`px-2 py-1 rounded text-xs ${data.archived ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {data.archived ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Désactivé:</span>
              <span className={`px-2 py-1 rounded text-xs ${data.disabled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                {data.disabled ? 'Oui' : 'Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Licence:</span>
              <span className="text-white">{data.license || 'Non spécifiée'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Topics:</span>
              <span className="text-white">{data.topics?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Topics */}
      {data.topics && data.topics.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {data.topics.map((topic, index) => (
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