'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsPanel() {
  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    // Simuler la récupération des statistiques d'utilisation
    setTimeout(() => {
      setUsageStats({
        totalDocsGenerated: 1245,
        activeUsers: 87,
        avgDocsPerUser: 14.3,
        mostPopularDocType: 'Documentation complète',
        recentActivity: [
          { user: 'Alice', action: 'Généré une documentation API', date: '2024-04-01' },
          { user: 'Bob', action: 'Consulté un fichier', date: '2024-03-30' },
          { user: 'Charlie', action: 'Mis à jour un dépôt', date: '2024-03-29' }
        ]
      });
    }, 1000);
  }, []);

  if (!usageStats) {
    return (
      <div className="p-6 text-center text-gray-400">
        Chargement des statistiques...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Statistiques d'utilisation</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Documents générés</h3>
          <p className="text-3xl font-bold text-blue-400">{usageStats.totalDocsGenerated}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Utilisateurs actifs</h3>
          <p className="text-3xl font-bold text-blue-400">{usageStats.activeUsers}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Docs par utilisateur</h3>
          <p className="text-3xl font-bold text-blue-400">{usageStats.avgDocsPerUser.toFixed(1)}</p>
        </div>
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white">Type de doc le plus populaire</h3>
          <p className="text-3xl font-bold text-blue-400">{usageStats.mostPopularDocType}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Activité récente</h3>
        <ul className="space-y-2 text-gray-300">
          {usageStats.recentActivity.map((item, index) => (
            <li key={index} className="flex justify-between bg-gray-700 rounded-lg p-3">
              <span>{item.user}</span>
              <span>{item.action}</span>
              <span className="text-sm text-gray-400">{item.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
