'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromotionPopup({ user, onUpgrade, onClose, triggerType = 'auto', targetPlan = null }) {
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
      color: 'from-yellow-500 to-orange-500',
      icon: '🎉',
      badge: 'PROMO',
      targetPlan: 'pro'
    },
    {
      id: 'pro',
      title: '🚀 Passez au niveau supérieur',
      subtitle: 'Plan Pro',
      message: 'Débloquez toutes les fonctionnalités avancées et boostez votre productivité',
      discount: '15%',
      code: 'PRO15',
      color: 'from-blue-600 to-purple-600',
      icon: '🚀',
      badge: 'PRO',
      targetPlan: 'pro'
    },
    {
      id: 'enterprise',
      title: '💎 Solutions Enterprise',
      subtitle: 'Pour les équipes',
      message: 'Collaboration avancée, analytics détaillés et support prioritaire',
      discount: '25%',
      code: 'TEAM25',
      color: 'from-indigo-600 to-purple-600',
      icon: '💎',
      badge: 'ENTERPRISE',
      targetPlan: 'enterprise'
    },
    {
      id: 'performance',
      title: '⚡ Performance Boost',
      subtitle: 'Optimisez votre workflow',
      message: 'Accélérez votre développement avec nos outils avancés',
      discount: '30%',
      code: 'BOOST30',
      color: 'from-green-600 to-emerald-600',
      icon: '⚡',
      badge: 'BOOST',
      targetPlan: 'pro'
    },
    {
      id: 'security',
      title: '🔒 Sécurité renforcée',
      subtitle: 'Protection avancée',
      message: 'Bénéficiez de fonctionnalités de sécurité de niveau entreprise',
      discount: '18%',
      code: 'SECURE18',
      color: 'from-red-600 to-pink-600',
      icon: '🔒',
      badge: 'SECURITY',
      targetPlan: 'enterprise'
    },
    {
      id: 'upgrade_pro',
      title: '🚀 Upgrade vers Pro',
      subtitle: 'Débloquez le potentiel',
      message: 'Passez au plan Pro et accédez à toutes les fonctionnalités avancées',
      discount: '20%',
      code: 'UPGRADE20',
      color: 'from-blue-600 to-purple-600',
      icon: '🚀',
      badge: 'UPGRADE',
      targetPlan: 'pro'
    },
    {
      id: 'upgrade_enterprise',
      title: '💎 Upgrade vers Enterprise',
      subtitle: 'Pour les équipes',
      message: 'Débloquez la collaboration avancée et les analytics détaillés',
      discount: '25%',
      code: 'ENTERPRISE25',
      color: 'from-indigo-600 to-purple-600',
      icon: '💎',
      badge: 'ENTERPRISE',
      targetPlan: 'enterprise'
    }
  ];

  useEffect(() => {
    if (!user) return;

    const showPromotion = () => {
      let selectedPromo;
      
      if (triggerType === 'manual' && targetPlan) {
        // Si c'est un déclenchement manuel avec un plan cible spécifique
        const planPromos = promotions.filter(p => p.targetPlan === targetPlan);
        selectedPromo = planPromos[Math.floor(Math.random() * planPromos.length)];
      } else if (triggerType === 'auto') {
        // Affichage automatique pour les utilisateurs gratuits
        if (user.plan !== 'free') return;
        const randomPromo = promotions.filter(p => p.targetPlan === 'pro');
        selectedPromo = randomPromo[Math.floor(Math.random() * randomPromo.length)];
      }
      
      if (selectedPromo) {
        setCurrentPromo(selectedPromo);
        setIsVisible(true);
      }
    };

    if (triggerType === 'manual' && targetPlan) {
      // Affichage immédiat pour les déclenchements manuels
      showPromotion();
    } else if (triggerType === 'auto' && user.plan === 'free') {
      // Afficher une promotion après 2-5 minutes pour les utilisateurs gratuits
      const timer = setTimeout(() => {
        showPromotion();
      }, 120000 + Math.random() * 180000); // Entre 2 et 5 minutes

      return () => clearTimeout(timer);
    }
  }, [user, triggerType, targetPlan]);

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
          className="relative bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700/50"
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
            <div className="relative inline-block mb-4">
              <div className="text-6xl mb-2">{currentPromo.icon}</div>
              <span className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${currentPromo.color} text-white`}>
                {currentPromo.badge}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">{currentPromo.title}</h2>
            <p className="text-gray-400 mb-4">{currentPromo.subtitle}</p>

            {/* Message */}
            <p className="text-gray-300 mb-6">{currentPromo.message}</p>

            {/* Discount */}
            <div className={`bg-gradient-to-r ${currentPromo.color} rounded-xl p-4 mb-6`}>
              <div className="text-3xl font-bold text-white mb-1">{currentPromo.discount}</div>
              <div className="text-white/80 text-sm">de réduction</div>
            </div>

            {/* Code */}
            <div className="bg-gray-700/50 rounded-lg p-3 mb-6">
              <div className="text-xs text-gray-400 mb-1">Code promo :</div>
              <div className="text-lg font-mono font-bold text-white">{currentPromo.code}</div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUpgrade}
                className={`flex-1 bg-gradient-to-r ${currentPromo.color} hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200`}
              >
                Utiliser l'offre
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Plus tard
              </button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-4">
              Offre limitée • Valable pour les nouveaux abonnements
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}