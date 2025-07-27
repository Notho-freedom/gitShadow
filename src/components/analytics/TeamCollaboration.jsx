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
      const targetData = { ...data };
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

  const teamMembers = [
    { name: 'Sarah Chen', role: 'Lead Developer', commits: 156, avatar: '👩‍💻', color: 'blue', status: 'active' },
    { name: 'Alex Rodriguez', role: 'Full Stack', commits: 134, avatar: '👨‍💻', color: 'green', status: 'active' },
    { name: 'Emma Wilson', role: 'Frontend', commits: 98, avatar: '👩‍💻', color: 'purple', status: 'active' },
    { name: 'David Kim', role: 'Backend', commits: 87, avatar: '👨‍💻', color: 'orange', status: 'active' },
    { name: 'Lisa Thompson', role: 'QA Engineer', commits: 76, avatar: '👩‍💻', color: 'pink', status: 'active' },
    { name: 'Mike Johnson', role: 'DevOps', commits: 45, avatar: '👨‍💻', color: 'yellow', status: 'inactive' }
  ];

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
            value={Math.round((animatedData.active / animatedData.total) * 100)}
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
              <div className="text-white font-medium">{animatedData.topContributor}</div>
              <div className="text-gray-400 text-sm">156 commits ce mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Membres de l'équipe */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Membres de l'Équipe</h4>
        
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>

      {/* Analyse de collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollaborationChart data={generateCollaborationData()} />
        <ActivityTimeline data={generateActivityData()} />
      </div>

      {/* Métriques de collaboration */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Métriques de Collaboration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CollaborationMetric
            title="Code Reviews"
            value={87}
            description="Reviews effectuées ce mois"
            color="green"
          />
          <CollaborationMetric
            title="Pull Requests"
            value={23}
            description="PRs ouvertes et mergées"
            color="blue"
          />
          <CollaborationMetric
            title="Pair Programming"
            value={12}
            description="Sessions de pair programming"
            color="purple"
          />
        </div>
      </div>

      {/* Insights et recommandations */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Insights & Recommandations</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InsightCard
              type="positive"
              title="Excellente collaboration"
              description="L'équipe travaille efficacement ensemble avec un taux d'activité élevé"
              icon="🎉"
            />
            <InsightCard
              type="info"
              title="Nouveaux contributeurs"
              description="3 nouveaux membres ont rejoint l'équipe ce mois"
              icon="🆕"
            />
          </div>
          
          <div className="space-y-4">
            <InsightCard
              type="warning"
              title="Code reviews"
              description="Augmenter le nombre de code reviews pour améliorer la qualité"
              icon="👀"
            />
            <InsightCard
              type="suggestion"
              title="Pair programming"
              description="Encourager plus de sessions de pair programming"
              icon="👥"
            />
          </div>
        </div>
      </div>

      {/* Communication et outils */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/50">
        <h4 className="text-white font-semibold mb-4">Outils de Collaboration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ToolCard
            name="Slack"
            status="Actif"
            usage="95%"
            color="green"
            icon="💬"
          />
          <ToolCard
            name="GitHub"
            status="Actif"
            usage="100%"
            color="green"
            icon="🐙"
          />
          <ToolCard
            name="Jira"
            status="Actif"
            usage="78%"
            color="blue"
            icon="📋"
          />
          <ToolCard
            name="Figma"
            status="Actif"
            usage="65%"
            color="purple"
            icon="🎨"
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
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">
        {value}{unit}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)} transition-all duration-500`}
          style={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
        />
      </div>
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
    return colors[member.color] || colors.blue;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(member.color)} rounded-full flex items-center justify-center text-lg mr-3`}>
            {member.avatar}
          </div>
          <div>
            <div className="text-white font-medium">{member.name}</div>
            <div className="text-gray-400 text-sm">{member.role}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-medium">{member.commits} commits</div>
          <div className={`text-xs ${member.status === 'active' ? 'text-green-400' : 'text-gray-400'}`}>
            {member.status === 'active' ? 'Actif' : 'Inactif'}
          </div>
        </div>
      </div>
    </div>
  );
}

function CollaborationChart({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Activité de Collaboration</h5>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
              <span className="text-white text-sm">{item.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">{item.value}</span>
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

function ActivityTimeline({ data }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
      <h5 className="text-white font-medium mb-4">Timeline d'Activité</h5>
      <div className="space-y-3">
        {data.map((activity, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${activity.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-white text-sm">{activity.time}</span>
            </div>
            <span className="text-gray-400 text-sm">{activity.description}</span>
          </div>
        ))}
      </div>
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
          style={{ width: `${(value / 100) * 100}%` }}
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
      <div className="text-sm text-gray-400 mb-2">Utilisation: {usage}</div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(color)}`}
          style={{ width: `${parseInt(usage)}%` }}
        />
      </div>
    </div>
  );
}

function generateCollaborationData() {
  return [
    { type: 'Code Reviews', value: 87, percentage: 87, color: 'bg-green-500' },
    { type: 'Pull Requests', value: 23, percentage: 23, color: 'bg-blue-500' },
    { type: 'Pair Programming', value: 12, percentage: 12, color: 'bg-purple-500' },
    { type: 'Standups', value: 20, percentage: 100, color: 'bg-orange-500' }
  ];
}

function generateActivityData() {
  return [
    { time: '09:00', description: 'Daily Standup', status: 'active' },
    { time: '10:30', description: 'Code Review', status: 'active' },
    { time: '14:00', description: 'Pair Programming', status: 'active' },
    { time: '16:00', description: 'Sprint Planning', status: 'active' }
  ];
} 