'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentSuccessModal({ isOpen, onClose, data }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000); // Auto-close after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const { plan, isTest } = data;
  const planDetails = {
    pro: {
      name: 'Pro',
      price: '€19/mois',
      features: [
        'Documentation illimitée',
        'Analytics avancées',
        'Collaboration en équipe',
        'Support prioritaire',
        'Export PDF/Word',
        'Historique complet'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '€199/mois',
      features: [
        'Tout du plan Pro',
        'API personnalisée',
        'Intégrations avancées',
        'Support dédié 24/7',
        'SLA garanti',
        'Formation sur mesure'
      ]
    }
  };

  const currentPlan = planDetails[plan];

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
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-2xl w-full"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {isTest ? 'Test de paiement réussi !' : 'Paiement réussi !'}
            </h2>
            
            <p className="text-gray-300 mb-6">
              {isTest 
                ? 'Le processus de paiement a été simulé avec succès.'
                : 'Votre abonnement a été activé avec succès.'
              }
            </p>

            {/* Plan Info */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Plan {currentPlan?.name} activé
              </h3>
              <p className="text-blue-400 font-medium mb-4">{currentPlan?.price}</p>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <h4 className="text-white font-medium text-sm">Fonctionnalités incluses :</h4>
                  <ul className="text-left space-y-1">
                    {currentPlan?.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300 text-sm">
                        <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
              </button>
            </div>

            {/* Test Mode Notice */}
            {isTest && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-400 text-lg">🧪</span>
                  <h4 className="text-yellow-400 font-medium">Mode de test</h4>
                </div>
                <p className="text-yellow-300 text-sm">
                  Ceci est une simulation. En production, vous seriez redirigé vers Stripe 
                  pour effectuer un vrai paiement et votre abonnement serait activé.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Continuer
              </button>
            </div>

            {/* Auto-close notice */}
            <p className="text-gray-500 text-xs mt-4">
              Cette fenêtre se fermera automatiquement dans 10 secondes
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 