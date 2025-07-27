'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromotionPopup({ user, onUpgrade, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPromo, setCurrentPromo] = useState(null);

  const promotions = [
    {
      id: 'welcome',
      title: '🎉 Bienvenue sur gitShadow !',
      subtitle: 'Offre de lancement',
      message: 'Économisez 20% sur votre premier mois avec le code WELCOME20',
      discount: '20%',
      code: 'WELCOME20',
      color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
      badgeColor: 'from-yellow-500 to-orange-500',
      icon: '🎉',
      badge: 'PROMO',
      type: 'promo'
    },
    {
      id: 'pro',
      title: '🚀 Passez au niveau supérieur',
      subtitle: 'Plan Pro',
      message: 'Débloquez toutes les fonctionnalités avancées et boostez votre productivité',
      discount: '15%',
      code: 'PRO15',
      color: 'from-blue-500/20 to-purple-500/20 border-blue-500/30',
      badgeColor: 'from-blue-600 to-purple-600',
      icon: '🚀',
      badge: 'PRO',
      type: 'upgrade'
    },
    {
      id: 'enterprise',
      title: '💎 Solutions Enterprise',
      subtitle: 'Pour les équipes',
      message: 'Collaboration avancée, analytics détaillés et support prioritaire',
      discount: '25%',
      code: 'TEAM25',
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
      badgeColor: 'from-indigo-600 to-purple-600',
      icon: '💎',
      badge: 'ENTERPRISE',
      type: 'feature'
    },
    {
      id: 'performance',
      title: '⚡ Performance Boost',
      subtitle: 'Optimisez votre workflow',
      message: 'Accélérez votre développement avec nos outils avancés',
      discount: '30%',
      code: 'BOOST30',
      color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      badgeColor: 'from-green-600 to-emerald-600',
      icon: '⚡',
      badge: 'BOOST',
      type: 'feature'
    },
    {
      id: 'security',
      title: '🔒 Sécurité renforcée',
      subtitle: 'Protection avancée',
      message: 'Bénéficiez de fonctionnalités de sécurité de niveau entreprise',
      discount: '18%',
      code: 'SECURE18',
      color: 'from-red-500/20 to-pink-500/20 border-red-500/30',
      badgeColor: 'from-red-600 to-pink-600',
      icon: '🔒',
      badge: 'SECURITY',
      type: 'feature'
    }
  ];

  useEffect(() => {
    if (!user || user.plan !== 'free') return;

    const showPromotion = () => {
      const randomPromo = promotions[Math.floor(Math.random() * promotions.length)];
      setCurrentPromo(randomPromo);
      setIsVisible(true);
    };

    // Afficher une promotion après 2-5 minutes
    const timer = setTimeout(() => {
      showPromotion();
    }, 120000 + Math.random() * 180000); // Entre 2 et 5 minutes

    return () => clearTimeout(timer);
  }, [user]);

  const handleUpgrade = () => {
    onUpgrade();
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || !currentPromo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700/50"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Icon and Badge */}
            <div className="relative inline-block mb-6">
              <div className="text-6xl mb-3">{currentPromo.icon}</div>
              <span className={`absolute -top-2 -right-2 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${currentPromo.badgeColor} text-white shadow-lg`}>
                {currentPromo.badge}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">{currentPromo.title}</h2>
            <p className="text-gray-400 mb-4">{currentPromo.subtitle}</p>

            {/* Message */}
            <p className="text-gray-300 mb-6 leading-relaxed">{currentPromo.message}</p>

            {/* Discount Card */}
            <div className={`bg-gradient-to-r ${currentPromo.color} rounded-xl p-6 mb-6 border`}>
              <div className="text-4xl font-bold text-white mb-2">{currentPromo.discount}</div>
              <div className="text-white/90 text-sm font-medium">de réduction</div>
            </div>

            {/* Code */}
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-600/50">
              <div className="text-xs text-gray-400 mb-2 font-medium">Code promo :</div>
              <div className="text-lg font-mono font-bold text-white bg-gray-800/50 rounded-lg p-2">
                {currentPromo.code}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgrade}
                className={`flex-1 bg-gradient-to-r ${currentPromo.badgeColor} hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                Utiliser l'offre
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium py-3 px-6 rounded-xl transition-colors border border-gray-600/50"
              >
                Plus tard
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6">
              Offre limitée • Valable pour les nouveaux abonnements
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}