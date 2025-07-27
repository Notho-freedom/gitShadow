'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';

export default function CheckoutModal({ isOpen, onClose, selectedPlan = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState(selectedPlan || 'pro');
  const { user } = useAuth();

  // Mettre à jour le plan sélectionné quand selectedPlan change
  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
  }, [selectedPlan]);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '19',
      period: 'mois',
      features: [
        'Documentation illimitée',
        'Analytics avancées',
        'Collaboration en équipe',
        'Support prioritaire',
        'Export PDF/Word',
        'Historique complet'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '199',
      period: 'mois',
      features: [
        'Tout du plan Pro',
        'API personnalisée',
        'Intégrations avancées',
        'Support dédié 24/7',
        'SLA garanti',
        'Formation sur mesure'
      ],
      popular: false
    }
  ];

  const handleCheckout = async (planId) => {
    setIsLoading(true);
    setError('');

    try {
      // Si l'utilisateur n'est pas connecté, rediriger vers l'authentification
      if (!user) {
        const currentUrl = window.location.href;
        window.location.href = `/auth?returnUrl=${encodeURIComponent(currentUrl)}&plan=${planId}`;
        return;
      }

      // Vérifier que l'utilisateur a un email (nécessaire pour Stripe)
      if (!user.email) {
        // Pour les utilisateurs invités, rediriger vers l'authentification
        if (user.isGuest) {
          const currentUrl = window.location.href;
          window.location.href = `/auth?returnUrl=${encodeURIComponent(currentUrl)}&plan=${planId}`;
          return;
        }
        throw new Error('Email utilisateur requis pour le paiement');
      }

      // Créer la session de paiement
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          customerEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?payment=success&plan=${planId}`,
          cancelUrl: `${window.location.origin}/dashboard?payment=cancelled`,
          metadata: {
            userId: user.id || user.login,
            userLogin: user.login,
            planId
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const { sessionUrl, isTest } = await response.json();
      
      if (isTest) {
        // Mode de test - afficher un message informatif
        alert(`Mode de test activé !\n\nPlan sélectionné : ${planId.toUpperCase()}\nPrix : €${plans.find(p => p.id === planId)?.price}\n\nEn production, vous seriez redirigé vers Stripe pour le paiement.`);
        
        // Simuler la redirection vers la page de succès
        window.location.href = sessionUrl;
      } else {
        // Mode production - rediriger vers Stripe Checkout
        window.location.href = sessionUrl;
      }

    } catch (err) {
      console.error('Erreur de paiement:', err);
      setError(err.message || 'Erreur lors du processus de paiement');
      setIsLoading(false);
    }
  };

  const selectedPlanData = selectedPlan ? plans.find(p => p.id === selectedPlan) : null;

  if (!isOpen) return null;

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
          className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Choisissez votre plan</h2>
            <p className="text-gray-300">Débloquez toutes les fonctionnalités de gitShadow</p>
            
            {/* Mode de test notice */}
            {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  🧪 <strong>Mode de test activé</strong> - Stripe n'est pas configuré. 
                  Le processus de paiement sera simulé.
                </p>
              </div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-600/50 hover:border-gray-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      POPULAIRE
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold text-white">€{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Redirection...</span>
                    </div>
                  ) : (
                    `Choisir ${plan.name}`
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center text-gray-400 text-sm">
            <p>Paiement sécurisé par Stripe • Annulation à tout moment • Support 24/7</p>
            <p className="mt-2">
              Questions ?{' '}
              <a href="mailto:contact@gitshadow.com" className="text-blue-400 hover:text-blue-300 underline">
                contact@gitshadow.com
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 