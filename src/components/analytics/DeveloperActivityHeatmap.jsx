'use client';

import { useEffect, useState } from 'react';

export default function DeveloperActivityHeatmap({ data }) {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateRealHeatmapData();
  }, [data]);

  const generateRealHeatmapData = () => {
    setIsLoading(true);
    
    // Générer les vraies données des développeurs
    const developers = generateRealDevelopers(data);
    
    // Générer des données d'activité basées sur les vrais commits
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmap = developers.map(dev => ({
      ...dev,
      activity: generateDeveloperActivity(dev, data, days, hours)
    }));

    setHeatmapData(heatmap);
    setIsLoading(false);
  };

  const generateRealDevelopers = (data) => {
    const developers = [];
    
    // Ajouter les collaborateurs
    if (data?.collaborators?.length > 0) {
      data.collaborators.forEach(collaborator => {
        developers.push({
          name: collaborator.name || collaborator.login,
          login: collaborator.login,
          avatar_url: collaborator.avatar_url,
          commits: collaborator.recentActivity?.length || 0,
          color: getRoleColor(collaborator.role),
          role: getRoleLabel(collaborator.role)
        });
      });
    }
    
    // Ajouter les contributeurs
    if (data?.contributors?.recent?.length > 0) {
      data.contributors.recent.forEach(contributor => {
        developers.push({
          name: contributor.login,
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          commits: contributor.contributions || 0,
          color: 'green',
          role: 'Contributeur'
        });
      });
    }
    
    // Trier par nombre de commits et limiter à 8 développeurs
    return developers
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 8);
  };

  const generateDeveloperActivity = (developer, data, days, hours) => {
    // Analyser les commits récents pour générer l'activité
    const commits = data?.commits?.recent || [];
    const developerCommits = commits.filter(commit => {
      const author = commit.author?.login || commit.commit?.author?.name;
      return author === developer.login;
    });

    return days.map(day => 
      hours.map(hour => {
        const dayCommits = developerCommits.filter(commit => {
          const commitDate = new Date(commit.commit?.author?.date || commit.date);
          const commitDay = commitDate.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
          const commitHour = commitDate.getHours();
          
          // Convertir les jours de la semaine
          const dayMap = { 0: 'Dim', 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam' };
          const dayName = dayMap[commitDay];
          
          return dayName === day && commitHour === hour;
        });

        const commits = dayCommits.length;
        const intensity = commits > 0 ? Math.min(commits / 3, 1) : 0; // Normaliser l'intensité

        return {
          day,
          hour,
          commits,
          intensity
        };
      })
    );
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
      pink: 'from-pink-500 to-pink-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-500 to-gray-600'
    };
    return colors[color] || colors.blue;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      write: 'blue',
      read: 'gray'
    };
    return colors[role] || 'blue';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      write: 'Développeur',
      read: 'Lecteur'
    };
    return labels[role] || 'Membre';
  };

  const getActivityInsights = () => {
    if (!data?.commits?.recent?.length) {
      return [
        { icon: '📊', text: 'Aucune activité récente', color: 'text-gray-400' },
        { icon: '👥', text: 'Aucun développeur actif', color: 'text-gray-400' },
        { icon: '⏰', text: 'Pas de données d\'activité', color: 'text-gray-400' }
      ];
    }

    const commits = data.commits.recent;
    const insights = [];

    // Trouver le pic d'activité
    const hourCounts = Array(24).fill(0);
    commits.forEach(commit => {
      const date = new Date(commit.commit?.author?.date || commit.date);
      const hour = date.getHours();
      hourCounts[hour]++;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    insights.push({
      icon: '📈',
      text: `Pic d'activité à ${peakHour}h`,
      color: 'text-green-400'
    });

    // Développeur le plus actif
    if (heatmapData.length > 0) {
      const topDev = heatmapData[0];
      insights.push({
        icon: '👥',
        text: `${topDev.name} est le plus actif avec ${topDev.commits} commits`,
        color: 'text-blue-400'
      });
    }

    // Activité du weekend
    const weekendCommits = commits.filter(commit => {
      const date = new Date(commit.commit?.author?.date || commit.date);
      const day = date.getDay();
      return day === 0 || day === 6; // Dimanche ou Samedi
    });

    const weekendPercentage = Math.round((weekendCommits.length / commits.length) * 100);
    insights.push({
      icon: '⏰',
      text: `${weekendPercentage}% d'activité le weekend`,
      color: weekendPercentage > 20 ? 'text-yellow-400' : 'text-green-400'
    });

    return insights;
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

  if (heatmapData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-white font-semibold mb-2">Aucune activité</h3>
            <p className="text-gray-400 text-sm">Aucun développeur actif trouvé</p>
          </div>
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
              key={dev.login}
              onClick={() => setSelectedDeveloper(selectedDeveloper === index ? null : index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedDeveloper === index
                  ? `bg-gradient-to-r ${getDeveloperColor(dev.color)} text-white shadow-lg`
                  : 'bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              <img 
                src={dev.avatar_url || `https://github.com/identicons/${dev.login}.png`}
                alt={dev.name}
                className="w-4 h-4 rounded-full mr-2 inline"
              />
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
            <div key={dev.login} className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={dev.avatar_url || `https://github.com/identicons/${dev.login}.png`}
                  alt={dev.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
                <div>
                  <span className="text-white text-sm">{dev.name}</span>
                  <span className="text-gray-400 text-xs ml-2">({dev.role})</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-400 text-sm">{dev.commits} commits</span>
                <div className="w-16 bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${getDeveloperColor(dev.color)}`}
                    style={{ width: `${(dev.commits / Math.max(...heatmapData.map(d => d.commits), 1)) * 100}%` }}
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
          {getActivityInsights().map((insight, index) => (
            <div key={index} className={`flex items-center ${insight.color}`}>
              <span className="mr-2">{insight.icon}</span>
              {insight.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 