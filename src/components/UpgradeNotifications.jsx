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
      icon: '📊'
    },
    {
      id: 'collaboration',
      title: '👥 Collaboration d\'équipe',
      message: 'Collaborez efficacement avec votre équipe !',
      delay: 60000, // 1 minute
      icon: '👥'
    },
    {
      id: 'documentation',
      title: '📚 Documentation automatique',
      message: 'Générez une documentation professionnelle automatiquement !',
      delay: 90000, // 1.5 minutes
      icon: '📚'
    },
    {
      id: 'promo',
      title: '🎉 Offre spéciale -20% !',
      message: 'Économisez 20% sur votre premier mois avec WELCOME20 !',
      delay: 120000, // 2 minutes
      icon: '🎉'
    },
    {
      id: 'features',
      title: '✨ Fonctionnalités avancées',
      message: 'Débloquez toutes les fonctionnalités premium !',
      delay: 150000, // 2.5 minutes
      icon: '✨'
    }
  ];

  useEffect(() => {
    if (!user || user.plan !== 'free') return;

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

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleUpgrade = (notificationId) => {
    onUpgrade();
    removeNotification(notificationId);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3">
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
                <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                <p className="text-xs text-blue-100 mb-3">{notification.message}</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpgrade(notification.id)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg font-medium transition-all"
                  >
                    Passer au Pro
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