'use client';

import { useEffect, useState } from 'react';

export default function DeveloperActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateHeatmapData();
  }, []);

  const generateHeatmapData = () => {
    setIsLoading(true);
    
    // Simulation de données d'activité des développeurs
    const developers = [
      { name: 'Sarah Chen', avatar: '👩‍💻', commits: 156, color: 'blue' },
      { name: 'Alex Rodriguez', avatar: '👨‍💻', commits: 134, color: 'green' },
      { name: 'Emma Wilson', avatar: '👩‍💻', commits: 98, color: 'purple' },
      { name: 'David Kim', avatar: '👨‍💻', commits: 87, color: 'orange' },
      { name: 'Lisa Thompson', avatar: '👩‍💻', commits: 76, color: 'pink' }
    ];

    // Générer des données d'activité pour les 7 derniers jours
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmap = developers.map(dev => ({
      ...dev,
      activity: days.map(day => 
        hours.map(hour => ({
          day,
          hour,
          commits: Math.floor(Math.random() * 5) * (Math.random() > 0.7 ? 1 : 0),
          intensity: Math.random()
        }))
      )
    }));

    setHeatmapData(heatmap);
    setIsLoading(false);
  };

  const getIntensityColor = (intensity, commits) => {
    if (commits === 0) return 'bg-gray-800';
    if (intensity < 0.3) return 'bg-blue-900';
    if (intensity < 0.6) return 'bg-blue-700';
    if (intensity < 0.8) return 'bg-blue-500';
    return 'bg-blue-300';
  };

  const getDeveloperColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600'
    };
    return colors[color] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Activité des Développeurs</h3>
        <div className="text-2xl">👥</div>
      </div>

      {/* Sélecteur de développeur */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {heatmapData.map((dev, index) => (
            <button
              key={dev.name}
              onClick={() => setSelectedDeveloper(selectedDeveloper === index ? null : index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedDeveloper === index
                  ? `bg-gradient-to-r ${getDeveloperColor(dev.color)} text-white shadow-lg`
                  : 'bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              <span className="mr-2">{dev.avatar}</span>
              {dev.name}
              <span className="ml-2 text-xs">({dev.commits})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-4">
          {selectedDeveloper !== null 
            ? `Activité de ${heatmapData[selectedDeveloper]?.name}`
            : 'Activité globale de l\'équipe'
          }
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* En-têtes des heures */}
            <div className="flex mb-2">
              <div className="w-16"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="w-6 text-xs text-gray-400 text-center">
                  {i}
                </div>
              ))}
            </div>

            {/* Lignes des jours */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, dayIndex) => (
              <div key={day} className="flex items-center mb-1">
                <div className="w-16 text-xs text-gray-400">{day}</div>
                {Array.from({ length: 24 }, (_, hour) => {
                  let totalCommits = 0;
                  let totalIntensity = 0;
                  let count = 0;

                  if (selectedDeveloper !== null) {
                    const activity = heatmapData[selectedDeveloper].activity[dayIndex][hour];
                    totalCommits = activity.commits;
                    totalIntensity = activity.intensity;
                    count = 1;
                  } else {
                    heatmapData.forEach(dev => {
                      const activity = dev.activity[dayIndex][hour];
                      totalCommits += activity.commits;
                      totalIntensity += activity.intensity;
                      count++;
                    });
                    totalIntensity /= count;
                  }

                  return (
                    <div
                      key={hour}
                      className={`w-6 h-6 mx-0.5 rounded-sm border border-gray-700 transition-all duration-200 ${
                        getIntensityColor(totalIntensity, totalCommits)
                      } ${totalCommits > 0 ? 'ring-1 ring-blue-400/30' : ''}`}
                      title={`${day} ${hour}h: ${totalCommits} commits`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-800 rounded-sm mr-2"></div>
            <span className="text-gray-400">Aucune activité</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-900 rounded-sm mr-2"></div>
            <span className="text-gray-400">Faible</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
            <span className="text-gray-400">Moyenne</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-300 rounded-sm mr-2"></div>
            <span className="text-gray-400">Élevée</span>
          </div>
        </div>
      </div>

      {/* Statistiques des développeurs */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Statistiques de l'Équipe</h4>
        <div className="space-y-3">
          {heatmapData.map((dev, index) => (
            <div key={dev.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">{dev.avatar}</span>
                <span className="text-white text-sm">{dev.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-400 text-sm">{dev.commits} commits</span>
                <div className="w-16 bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${getDeveloperColor(dev.color)}`}
                    style={{ width: `${(dev.commits / Math.max(...heatmapData.map(d => d.commits))) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Insights</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-green-400">
            <span className="mr-2">📈</span>
            Pic d'activité le mercredi entre 14h et 16h
          </div>
          <div className="flex items-center text-blue-400">
            <span className="mr-2">👥</span>
            Sarah Chen est la plus active avec 156 commits
          </div>
          <div className="flex items-center text-yellow-400">
            <span className="mr-2">⏰</span>
            Activité réduite le weekend (normal)
          </div>
        </div>
      </div>
    </div>
  );
} 