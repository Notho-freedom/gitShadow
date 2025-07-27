'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter({ isOpen, onClose, user, onUpgrade }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Générer des notifications dynamiques basées sur l'utilisateur
    const baseNotifications = [
      {
        id: 1,
        type: 'info',
        title: 'Bienvenue sur gitShadow !',
        message: 'Votre compte a été configuré avec succès.',
        time: 'Il y a 2 heures',
        read: false
      }
    ];

    // Ajouter des notifications d'upgrade pour les utilisateurs gratuits
    if (user && user.plan === 'free') {
      baseNotifications.push(
        {
          id: 2,
          type: 'upgrade',
          title: '🚀 Débloquez votre potentiel !',
          message: 'Passez au plan Pro pour accéder à toutes les fonctionnalités avancées.',
          time: 'Il y a 1 heure',
          read: false,
          action: 'upgrade',
          badge: 'PRO'
        },
        {
          id: 3,
          type: 'promo',
          title: '🎉 Offre spéciale -20% !',
          message: 'Économisez 20% sur votre premier mois avec le code WELCOME20.',
          time: 'Il y a 30 minutes',
          read: false,
          action: 'upgrade',
          badge: 'PROMO'
        },
        {
          id: 4,
          type: 'feature',
          title: '📊 Analytics Premium',
          message: 'Découvrez des insights détaillés sur vos projets avec les analytics avancées.',
          time: 'Il y a 15 minutes',
          read: false,
          action: 'upgrade',
          badge: 'PREMIUM'
        },
        {
          id: 5,
          type: 'promo',
          title: '⚡ Performance Boost',
          message: 'Accélérez votre workflow avec les fonctionnalités premium !',
          time: 'Il y a 10 minutes',
          read: false,
          action: 'upgrade',
          badge: 'BOOST'
        }
      );
    } else if (user && user.plan === 'pro') {
      baseNotifications.push(
        {
          id: 2,
          type: 'success',
          title: 'Documentation générée',
          message: 'La documentation pour "Dashboard.jsx" a été créée.',
          time: 'Il y a 1 heure',
          read: false,
          badge: 'PRO'
        },
        {
          id: 3,
          type: 'feature',
          title: '🎯 Nouvelle fonctionnalité',
          message: 'Essayez notre nouveau système de collaboration en temps réel !',
          time: 'Il y a 3 heures',
          read: false,
          badge: 'NEW'
        },
        {
          id: 4,
          type: 'promo',
          title: '💎 Passez à Enterprise',
          message: 'Débloquez des fonctionnalités avancées pour votre équipe !',
          time: 'Il y a 2 heures',
          read: false,
          action: 'upgrade',
          badge: 'ENTERPRISE'
        }
      );
    } else {
      baseNotifications.push(
        {
          id: 2,
          type: 'success',
          title: 'Documentation générée',
          message: 'La documentation pour "Dashboard.jsx" a été créée.',
          time: 'Il y a 1 heure',
          read: false,
          badge: 'ENTERPRISE'
        },
        {
          id: 3,
          type: 'warning',
          title: 'Mise à jour disponible',
          message: 'Une nouvelle version de gitShadow est disponible.',
          time: 'Il y a 3 heures',
          read: true,
          badge: 'UPDATE'
        }
      );
    }

    setNotifications(baseNotifications);
  }, [user]);

  const getNotificationIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      upgrade: '🚀',
      promo: '🎉',
      feature: '✨',
      new: '🆕',
      update: '🔄'
    };
    return icons[type] || 'ℹ️';
  };

  const getNotificationColor = (type) => {
    const colors = {
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      upgrade: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30',
      promo: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
      feature: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      new: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30',
      update: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[type] || 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const getBadgeColor = (badge) => {
    const colors = {
      'PRO': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      'PROMO': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'PREMIUM': 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      'BOOST': 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
      'NEW': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
      'ENTERPRISE': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
      'UPDATE': 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
    };
    return colors[badge] || 'bg-gray-600 text-white';
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationAction = (notification) => {
    if (notification.action === 'upgrade' && onUpgrade) {
      onUpgrade();
      markAsRead(notification.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end pt-16"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md h-full bg-gray-800/95 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Tout marquer comme lu
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          notification.read 
                            ? 'bg-gray-700/30 border-gray-600/50' 
                            : 'bg-blue-500/10 border-blue-500/30'
                        } ${notification.action ? 'cursor-pointer hover:scale-105' : ''}`}
                        onClick={() => notification.action && handleNotificationAction(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <h3 className={`font-medium ${
                                  notification.read ? 'text-gray-300' : 'text-white'
                                }`}>
                                  {notification.title}
                                </h3>
                                {notification.badge && (
                                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${getBadgeColor(notification.badge)}`}>
                                    {notification.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">{notification.time}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                            {notification.action === 'upgrade' && (
                              <div className="mt-3 flex items-center justify-between">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationAction(notification);
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs rounded-lg font-medium transition-all"
                                >
                                  {notification.badge === 'ENTERPRISE' ? 'Passer à Enterprise' : 'Passer au Pro'}
                                </button>
                                {!notification.read && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                  >
                                    Marquer comme lu
                                  </button>
                                )}
                              </div>
                            )}
                            {!notification.read && !notification.action && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors"
                              >
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Aucune notification</h3>
                    <p className="text-gray-400">Vous êtes à jour !</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
                <button className="text-blue-400 hover:text-blue-300 transition-colors">
                  Voir tout
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 