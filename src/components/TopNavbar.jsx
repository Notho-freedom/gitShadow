'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function TopNavbar({ 
  user, 
  selectedRepo, 
  selectedFile, 
  activeView, 
  onSearchOpen, 
  onNotificationOpen, 
  onLogout,
  theme,
  layout,
  onLayoutChange
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);

  const layoutOptions = [
    { id: 'default', name: 'Défaut', icon: '📱' },
    { id: 'code-focus', name: 'Code', icon: '💻' },
    { id: 'documentation-focus', name: 'Documentation', icon: '📚' },
    { id: 'split', name: 'Partagé', icon: '⚡' }
  ];

  const getBreadcrumb = () => {
    const parts = [];
    if (selectedRepo) parts.push(selectedRepo.name);
    if (selectedFile) parts.push(selectedFile.name);
    return parts.join(' / ');
  };

  return (
    <header className="h-16 bg-gray-800/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center justify-between px-6">
      {/* Left Section - Breadcrumb & Navigation */}
      <div className="flex items-center space-x-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400 capitalize">{activeView}</span>
          {getBreadcrumb() && (
            <>
              <span className="text-gray-600">/</span>
              <span className="text-white font-medium truncate max-w-xs">
                {getBreadcrumb()}
              </span>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchOpen}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            title="Recherche globale (Ctrl+K)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
            title="Changer la disposition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Center Section - Status & Info */}
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">Connecté</span>
        </div>

        {/* Plan Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          user.plan === 'pro' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
          user.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
        }`}>
          {user.plan === 'free' ? 'Gratuit' : 
           user.plan === 'pro' ? 'Pro' : 'Enterprise'}
        </div>
      </div>

      {/* Right Section - User & Notifications */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNotificationOpen}
          className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 006 3h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 01.19-1.81z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </motion.button>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <img 
              src={user.avatar_url} 
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-blue-500 transition-colors"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">@{user.login}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          {/* User Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50"
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                    Mon profil
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                    Paramètres
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                    Aide & Support
                  </button>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layout Menu */}
        <AnimatePresence>
          {isLayoutMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-6 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Disposition
                </p>
                {layoutOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onLayoutChange(option.id);
                      setIsLayoutMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                      layout === option.id 
                        ? 'text-blue-400 bg-blue-500/20' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{option.icon}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close menus */}
      {(isUserMenuOpen || isLayoutMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsLayoutMenuOpen(false);
          }}
        />
      )}
    </header>
  );
} 