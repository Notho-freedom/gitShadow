'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradeNotifications({ user, onUpgrade }) {
  const [notifications, setNotifications] = useState([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  const upgradeMessages = [
    {
      id: 'analytics',
      title: '📊 Analytics Premium',
      message: 'Découvrez des insights détaillés sur vos projets !',
      delay: 30000, // 30 secondes
      icon: '📊',
      badge: 'PREMIUM'
    },
    {
      id: 'collaboration',
      title: '👥 Collaboration d\'équipe',
      message: 'Collaborez efficacement avec votre équipe !',
      delay: 60000, // 1 minute
      icon: '👥',
      badge: 'PRO'
    },
    {
      id: 'documentation',
      title: '📚 Documentation automatique',
      message: 'Générez une documentation professionnelle automatiquement !',
      delay: 90000, // 1.5 minutes
      icon: '📚',
      badge: 'PRO'
    },
    {
      id: 'promo',
      title: '🎉 Offre spéciale -20% !',
      message: 'Économisez 20% sur votre premier mois avec WELCOME20 !',
      delay: 120000, // 2 minutes
      icon: '🎉',
      badge: 'PROMO'
    },
    {
      id: 'features',
      title: '✨ Fonctionnalités avancées',
      message: 'Débloquez toutes les fonctionnalités premium !',
      delay: 150000, // 2.5 minutes
      icon: '✨',
      badge: 'PREMIUM'
    },
    {
      id: 'performance',
      title: '⚡ Performance Boost',
      message: 'Accélérez votre workflow avec les outils avancés !',
      delay: 180000, // 3 minutes
      icon: '⚡',
      badge: 'BOOST'
    },
    {
      id: 'security',
      title: '🔒 Sécurité renforcée',
      message: 'Bénéficiez de fonctionnalités de sécurité avancées !',
      delay: 210000, // 3.5 minutes
      icon: '🔒',
      badge: 'SECURITY'
    },
    {
      id: 'enterprise',
      title: '💎 Passez à Enterprise',
      message: 'Solutions avancées pour les grandes équipes !',
      delay: 240000, // 4 minutes
      icon: '💎',
      badge: 'ENTERPRISE'
    }
  ];

  useEffect(() => {
    if (!user || !user.plan || user.plan !== 'free') return;

    const showRandomNotification = () => {
      const now = Date.now();
      const timeSinceLastNotification = now - lastNotificationTime;
      
      // Attendre au moins 2 minutes entre les notifications
      if (timeSinceLastNotification < 120000) return;

      const randomMessage = upgradeMessages[Math.floor(Math.random() * upgradeMessages.length)];
      
      const newNotification = {
        ...randomMessage,
        timestamp: now,
        id: `${randomMessage.id}_${now}`
      };

      setNotifications(prev => [...prev, newNotification]);
      setLastNotificationTime(now);
    };

    // Afficher une première notification après 30 secondes
    const initialTimer = setTimeout(() => {
      showRandomNotification();
    }, 30000);

    // Afficher des notifications aléatoires toutes les 2-5 minutes
    const intervalTimer = setInterval(() => {
      showRandomNotification();
    }, 120000 + Math.random() * 180000); // Entre 2 et 5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [user, lastNotificationTime]);

  const getBadgeColor = (badge) => {
    const colors = {
      'PRO': 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      'PROMO': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'PREMIUM': 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      'BOOST': 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
      'SECURITY': 'bg-gradient-to-r from-red-600 to-pink-600 text-white',
      'ENTERPRISE': 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
    };
    return colors[badge] || 'bg-gray-600 text-white';
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleUpgrade = (notificationId) => {
    onUpgrade();
    removeNotification(notificationId);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 shadow-2xl border border-blue-500/30 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{notification.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  {notification.badge && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getBadgeColor(notification.badge)}`}>
                      {notification.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-100 mb-3">{notification.message}</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpgrade(notification.id)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg font-medium transition-all"
                  >
                    {notification.badge === 'ENTERPRISE' ? 'Passer à Enterprise' : 'Passer au Pro'}
                  </button>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all"
                  >
                    Plus tard
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white/70 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 