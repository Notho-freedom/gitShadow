'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '29',
      period: 'mois',
      features: [
        'Accès illimité à toutes les fonctionnalités',
        'Analytics avancées',
        'Support prioritaire',
        'Collaboration en équipe',
        'Génération de documentation illimitée',
        'API access'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '99',
      period: 'mois',
      features: [
        'Tout du plan Pro',
        'Support dédié 24/7',
        'SLA garanti',
        'Intégrations personnalisées',
        'Formation de l\'équipe',
        'Déploiement sur site'
      ],
      popular: false
    }
  ];

  const handleCheckout = async () => {
    if (!user) {
      // Rediriger vers l'authentification si l'utilisateur n'est pas connecté
      window.location.href = '/auth';
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
          userEmail: user.email
        }),
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
      alert('Erreur lors du processus de paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Choisissez votre plan</h2>
                  <p className="text-gray-400 mt-1">Débloquez tout le potentiel de gitShadow</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Plans */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                          Plus populaire
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-white">€{plan.price}</span>
                        <span className="text-gray-400 ml-1">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className={`w-full h-1 rounded-full ${
                      selectedPlan === plan.id ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                  </motion.div>
                ))}
              </div>

              {/* Promotional Banner */}
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎉</span>
                  <div>
                    <h4 className="text-white font-semibold">Offre spéciale !</h4>
                    <p className="text-gray-300 text-sm">Économisez 20% sur votre premier mois avec le code <span className="font-mono bg-gray-800 px-2 py-1 rounded">WELCOME20</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  <p>• Paiement sécurisé via Stripe</p>
                  <p>• Annulation à tout moment</p>
                  <p>• Support 24/7 inclus</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Traitement...
                      </>
                    ) : (
                      `Commencer avec ${plans.find(p => p.id === selectedPlan)?.name}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 