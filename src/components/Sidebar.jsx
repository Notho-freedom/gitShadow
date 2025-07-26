'use client';

export default function Sidebar({ activeView, onViewChange, views, user, selectedRepo, selectedCommit }) {
  const menuItems = [
    { id: 'repositories', label: 'Dépôts', icon: '📁' },
    { id: 'commits', label: 'Commits', icon: '📝', disabled: !selectedRepo },
    { id: 'files', label: 'Fichiers', icon: '📄', disabled: !selectedCommit },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold text-white">gS</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">gitShadow</h2>
            <p className="text-gray-400 text-xs">v2.0.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onViewChange(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                activeView === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : item.disabled
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.disabled && (
                <span className="ml-auto text-xs text-gray-600">
                  {item.id === 'commits' ? 'Sélectionnez un dépôt' : 'Sélectionnez un commit'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        {(selectedRepo || selectedCommit) && (
          <div className="mt-8 p-4 bg-gray-700/30 rounded-lg">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <div className="space-y-2 text-sm">
              {selectedRepo && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">📁</span>
                  <span className="text-white font-medium truncate">{selectedRepo.name}</span>
                </div>
              )}
              {selectedCommit && (
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-gray-400">📝</span>
                  <span className="text-gray-300 font-mono text-xs">
                    {selectedCommit.sha.substring(0, 7)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plan info */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`w-2 h-2 rounded-full ${
              user.plan === 'pro' ? 'bg-blue-400' :
              user.plan === 'enterprise' ? 'bg-purple-400' :
              'bg-gray-400'
            }`}></span>
            <span className="text-white text-sm font-medium">
              Plan {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            {user.plan === 'free' ? 'Passez au Pro pour plus de fonctionnalités' :
             user.plan === 'pro' ? 'Accès complet aux fonctionnalités' :
             'Plan Entreprise actif'}
          </p>
          {user.plan === 'free' && (
            <button className="mt-2 w-full px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors">
              Mettre à niveau
            </button>
          )}
        </div>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <img 
            src={user.avatar_url} 
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-gray-400 text-xs truncate">@{user.login}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
