'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentSuccessModal({ isOpen, onClose, plan, isTest = false }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-fermer après 10 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 p-6"
        >
          <div className="text-center">
            {/* Icône de succès */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {isTest ? 'Test de paiement réussi !' : 'Paiement réussi !'}
            </h2>

            {/* Message */}
            <p className="text-gray-300 mb-6">
              {isTest ? (
                <>
                  Votre test de paiement pour le plan <strong>{plan}</strong> a été simulé avec succès.
                  <br />
                  <span className="text-sm text-gray-400">
                    En mode production, vous seriez maintenant redirigé vers Stripe.
                  </span>
                </>
              ) : (
                <>
                  Votre abonnement au plan <strong>{plan}</strong> a été activé avec succès !
                  <br />
                  <span className="text-sm text-gray-400">
                    Vous avez maintenant accès à toutes les fonctionnalités premium.
                  </span>
                </>
              )}
            </p>

            {/* Détails du plan */}
            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-white mb-2">Plan activé : {plan}</h3>
              <div className="text-sm text-gray-300 space-y-1">
                {plan === 'pro' && (
                  <>
                    <div>✓ Dépôts illimités</div>
                    <div>✓ Documentation avancée</div>
                    <div>✓ Analytics détaillées</div>
                    <div>✓ Support prioritaire</div>
                  </>
                )}
                {plan === 'enterprise' && (
                  <>
                    <div>✓ Toutes les fonctionnalités Pro</div>
                    <div>✓ Utilisateurs illimités</div>
                    <div>✓ Support 24/7</div>
                    <div>✓ SLA garanti</div>
                  </>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {showDetails ? 'Masquer' : 'Voir'} les détails
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Continuer
              </button>
            </div>

            {/* Détails supplémentaires */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-700/20 rounded-lg text-left"
              >
                <h4 className="font-semibold text-white mb-2">Informations techniques :</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>• Mode : {isTest ? 'Test' : 'Production'}</div>
                  <div>• Timestamp : {new Date().toLocaleString()}</div>
                  <div>• Session ID : {isTest ? 'test_' + Date.now() : 'stripe_session'}</div>
                  {isTest && (
                    <div>• Note : Ceci est une simulation pour le développement</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 