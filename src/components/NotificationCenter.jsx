'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationCenter({ isOpen, onClose, user }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Bienvenue sur gitShadow',
      message: 'Votre compte a été configuré avec succès',
      timestamp: new Date(),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Documentation générée',
      message: 'La documentation pour le fichier README.md a été générée',
      timestamp: new Date(Date.now() - 300000),
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version de gitShadow est disponible',
      timestamp: new Date(Date.now() - 600000),
      read: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
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

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    return notif.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-4 top-20 w-96 max-h-[80vh] bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔔</span>
                  <div>
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <p className="text-gray-400 text-sm">
                      {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Tout marquer
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    ✕
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700/50">
              {[
                { id: 'all', label: 'Toutes', count: notifications.length },
                { id: 'unread', label: 'Non lues', count: unreadCount },
                { id: 'info', label: 'Info', count: notifications.filter(n => n.type === 'info').length },
                { id: 'success', label: 'Succès', count: notifications.filter(n => n.type === 'success').length },
                { id: 'warning', label: 'Avertissements', count: notifications.filter(n => n.type === 'warning').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="p-2 space-y-2">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-3 rounded-lg border transition-all duration-200 ${
                        notification.read 
                          ? 'opacity-60' 
                          : 'opacity-100'
                      } ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-white font-medium text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                              >
                                ✕
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => markAsRead(notification.id)}
                              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Marquer comme lue
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">🔔</div>
                  <p className="text-gray-400 text-sm">
                    {activeTab === 'all' 
                      ? 'Aucune notification'
                      : activeTab === 'unread'
                      ? 'Aucune notification non lue'
                      : `Aucune notification de type ${activeTab}`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Tout supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 