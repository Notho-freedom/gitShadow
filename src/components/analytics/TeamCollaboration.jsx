'use client';

import { useEffect, useState } from 'react';

export default function TeamCollaboration({ data }) {
  const [animatedData, setAnimatedData] = useState({
    active: 0,
    total: 0,
    topContributor: '',
    newContributors: 0
  });

  useEffect(() => {
    const animateData = () => {
      if (!data) return;
      
      const targetData = {
        active: data.contributors?.total || 0,
        total: (data.contributors?.total || 0) + (data.collaborators?.length || 0),
        topContributor: getTopContributor(data),
        newContributors: getNewContributors(data)
      };
      
      let currentData = { ...animatedData };
      const steps = 25;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        Object.keys(targetData).forEach(key => {
          if (key !== 'topContributor') {
            currentData[key] = targetData[key] * progress;
          } else {
            currentData[key] = targetData[key];
          }
        });

        setAnimatedData({ ...currentData });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, 60);

      return () => clearInterval(timer);
    };

    animateData();
  }, [data]);

  // Générer les vraies données d'équipe
  const teamMembers = generateRealTeamMembers(data);
  const collaborationData = generateRealCollaborationData(data);
  const activityData = generateRealActivityData(data);

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Collaboration d'Équipe</h3>
          <div className="text-2xl">👥</div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <TeamMetric
            title="Membres Actifs"
            value={Math.round(animatedData.active)}
            icon="👥"
            color="green"
          />
          <TeamMetric
            title="Total Équipe"
            value={Math.round(animatedData.total)}
            icon="👨‍💻"
            color="blue"
          />
          <TeamMetric
            title="Nouveaux"
            value={Math.round(animatedData.newContributors)}
            icon="🆕"
            color="purple"
          />
          <TeamMetric
            title="Taux d'Activité"
            value={Math.round((animatedData.active / Math.max(animatedData.total, 1)) * 100)}
            icon="📈"
            color="orange"
            unit="%"
          />
        </div>

        {/* Top contributeur */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Top Contributeur</h4>
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl mr-4">
              👩‍💻
            </div>
            <div>
              <div className="text-white font-medium">{animatedData.topContributor || 'Aucun contributeur'}</div>
              <div className="text-gray-400 text-sm">Plus actif ce mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Membres de l'équipe */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Membres de l'Équipe</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>

      {/* Métriques de collaboration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CollaborationMetric
          title="Code Reviews"
          value={calculateCodeReviewRate(data)}
          description="Taux de code reviews"
          color="green"
        />
        <CollaborationMetric
          title="Pull Requests"
          value={calculatePullRequestRate(data)}
          description="PRs par semaine"
          color="blue"
        />
        <CollaborationMetric
          title="Collaboration"
          value={calculateCollaborationScore(data)}
          description="Score de collaboration"
          color="purple"
        />
      </div>

      {/* Graphique de collaboration */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Activité de Collaboration</h4>
        <CollaborationChart data={collaborationData} />
      </div>

      {/* Timeline d'activité */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Activité Récente</h4>
        <ActivityTimeline data={activityData} />
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          type="positive"
          title="Équipe Engagée"
          description="Taux de participation élevé dans les reviews"
          icon="✅"
        />
        <InsightCard
          type="warning"
          title="Amélioration Possible"
          description="Augmenter la fréquence des pair programming"
          icon="⚠️"
        />
      </div>

      {/* Outils de collaboration */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Outils de Collaboration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToolCard
            name="GitHub"
            status="Actif"
            usage="95"
            color="green"
            icon="🐙"
          />
          <ToolCard
            name="Slack"
            status="Actif"
            usage="78"
            color="blue"
            icon="💬"
          />
          <ToolCard
            name="Jira"
            status="Actif"
            usage="82"
            color="purple"
            icon="📋"
          />
        </div>
      </div>
    </div>
  );
}

function TeamMetric({ title, value, icon, color, unit = '' }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
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
          <span className="text-white text-sm font-bold">{value}{unit}</span>
        </div>
      </div>
      <h5 className="text-white font-medium">{title}</h5>
    </div>
  );
}

function TeamMemberCard({ member }) {
  const getColorClasses = (colorName) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      yellow: 'from-yellow-500 to-yellow-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center mb-3">
        <img
          src={member.avatar_url || `https://github.com/identicons/${member.login}.png`}
          alt={member.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h5 className="text-white font-medium">{member.name}</h5>
          <p className="text-gray-400 text-sm">{member.role}</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">{member.commits} commits</span>
        <div className={`w-3 h-3 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
      </div>
    </div>
  );
}

function CollaborationChart({ data }) {
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-white">{item.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 font-medium">{item.value}</span>
            <span className="text-gray-400 text-sm">({item.percentage}%)</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityTimeline({ data }) {
  return (
    <div className="space-y-3">
      {data.map((activity, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${activity.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-gray-400 text-sm">{activity.time}</span>
          <span className="text-white">{activity.description}</span>
        </div>
      ))}
    </div>
  );
}

function CollaborationMetric({ title, value, description, color }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-2">{title}</h5>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <p className="text-gray-400 text-sm mb-3">{description}</p>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({ type, title, description, icon }) {
  const getTypeColor = (typeName) => {
    const colors = {
      positive: 'text-green-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
      suggestion: 'text-purple-400'
    };
    return colors[typeName] || colors.info;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <h5 className={`font-medium mb-2 ${getTypeColor(type)}`}>{title}</h5>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ name, status, usage, color, icon }) {
  const getColorClasses = (colorName) => {
    const colors = {
      green: 'from-green-500 to-green-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600'
    };
    return colors[colorName] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded ${status === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {status}
        </span>
      </div>
      <h5 className="text-white font-medium mb-2">{name}</h5>
      <div className="text-sm text-gray-400 mb-2">Utilisation: {usage}%</div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: `${parseInt(usage)}%` }}
        />
      </div>
    </div>
  );
}

// Fonctions pour générer les vraies données
function generateRealTeamMembers(data) {
  const members = [];
  
  // Ajouter les collaborateurs
  if (data?.collaborators?.length > 0) {
    data.collaborators.forEach(collaborator => {
      members.push({
        name: collaborator.name || collaborator.login,
        login: collaborator.login,
        role: getRoleLabel(collaborator.role),
        commits: collaborator.recentActivity?.length || 0,
        avatar_url: collaborator.avatar_url,
        status: 'active',
        color: getRoleColor(collaborator.role)
      });
    });
  }
  
  // Ajouter les contributeurs
  if (data?.contributors?.recent?.length > 0) {
    data.contributors.recent.forEach(contributor => {
      members.push({
        name: contributor.login,
        login: contributor.login,
        role: 'Contributeur',
        commits: contributor.contributions || 0,
        avatar_url: contributor.avatar_url,
        status: 'active',
        color: 'green'
      });
    });
  }
  
  // Trier par nombre de commits
  return members.sort((a, b) => b.commits - a.commits).slice(0, 6);
}

function generateRealCollaborationData(data) {
  const collaborationData = [];
  
  // Code Reviews (basé sur les PRs)
  const prCount = data?.pulls?.total || 0;
  const reviewRate = Math.min(prCount * 2, 100); // Estimation
  collaborationData.push({
    type: 'Code Reviews',
    value: prCount,
    percentage: Math.round(reviewRate),
    color: 'bg-green-500'
  });
  
  // Pull Requests
  collaborationData.push({
    type: 'Pull Requests',
    value: prCount,
    percentage: Math.round((prCount / Math.max(data?.contributors?.total || 1, 1)) * 100),
    color: 'bg-blue-500'
  });
  
  // Collaborateurs actifs
  const activeCollaborators = data?.collaborators?.length || 0;
  collaborationData.push({
    type: 'Collaborateurs',
    value: activeCollaborators,
    percentage: Math.round((activeCollaborators / Math.max(data?.contributors?.total || 1, 1)) * 100),
    color: 'bg-purple-500'
  });
  
  // Contributeurs
  const contributors = data?.contributors?.total || 0;
  collaborationData.push({
    type: 'Contributeurs',
    value: contributors,
    percentage: 100,
    color: 'bg-orange-500'
  });
  
  return collaborationData;
}

function generateRealActivityData(data) {
  const activityData = [];
  
  // Basé sur les commits récents
  if (data?.commits?.recent?.length > 0) {
    const recentCommits = data.commits.recent.slice(0, 4);
    recentCommits.forEach((commit, index) => {
      const time = formatTimeAgo(commit.commit?.author?.date || commit.date);
      activityData.push({
        time: time,
        description: `Commit: ${commit.commit?.message?.split('\n')[0] || 'Sans message'}`,
        status: 'active'
      });
    });
  }
  
  // Si pas assez d'activité, ajouter des activités par défaut
  while (activityData.length < 4) {
    activityData.push({
      time: 'Récent',
      description: 'Activité de collaboration',
      status: 'active'
    });
  }
  
  return activityData;
}

// Fonctions utilitaires
function getTopContributor(data) {
  if (!data?.contributors?.recent?.length) {
    return 'Aucun contributeur';
  }
  
  const topContributor = data.contributors.recent.reduce((top, current) => {
    return (current.contributions || 0) > (top.contributions || 0) ? current : top;
  });
  
  return topContributor.login || 'Aucun contributeur';
}

function getNewContributors(data) {
  if (!data?.contributors?.recent?.length) {
    return 0;
  }
  
  // Compter les contributeurs avec peu de contributions (nouveaux)
  return data.contributors.recent.filter(contributor => 
    (contributor.contributions || 0) <= 5
  ).length;
}

function getRoleLabel(role) {
  const labels = {
    admin: 'Administrateur',
    write: 'Développeur',
    read: 'Lecteur'
  };
  return labels[role] || 'Membre';
}

function getRoleColor(role) {
  const colors = {
    admin: 'red',
    write: 'blue',
    read: 'gray'
  };
  return colors[role] || 'blue';
}

function calculateCodeReviewRate(data) {
  const prCount = data?.pulls?.total || 0;
  const contributors = data?.contributors?.total || 1;
  return Math.round((prCount / contributors) * 10);
}

function calculatePullRequestRate(data) {
  return data?.pulls?.total || 0;
}

function calculateCollaborationScore(data) {
  const contributors = data?.contributors?.total || 0;
  const collaborators = data?.collaborators?.length || 0;
  const total = contributors + collaborators;
  
  if (total === 0) return 0;
  
  // Score basé sur la diversité de l'équipe
  const diversityScore = Math.min((total / 10) * 100, 100);
  return Math.round(diversityScore);
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Récent';
  
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