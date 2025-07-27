'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { formatPrice } from '../lib/pricing';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  plan, 
  user, 
  isAnnual = false 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const price = isAnnual ? plan.price * 10 : plan.price;
  const originalPrice = isAnnual ? plan.price * 12 : plan.price;

  const handleCheckout = async () => {
    if (!user?.email) {
      setError('Vous devez être connecté pour effectuer un paiement');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          customerEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          metadata: {
            userId: user.id,
            planName: plan.name,
            isAnnual: isAnnual
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (err) {
      console.error('Erreur lors du checkout:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseContact = () => {
    // Ouvrir le formulaire de contact pour Enterprise
    window.open('mailto:contact@gitshadow.com?subject=Demande de devis Enterprise', '_blank');
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Finaliser votre abonnement
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plan sélectionné */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isAnnual ? 'Facturation annuelle' : 'Facturation mensuelle'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(price)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  /{isAnnual ? 'an' : 'mois'}
                </div>
              </div>
            </div>
            
            {isAnnual && plan.price > 0 && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                Économisez {formatPrice(originalPrice - price)} par an
              </div>
            )}
          </div>

          {/* Sécurité */}
          <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Paiement sécurisé par Stripe</span>
          </div>

          {/* Garantie */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Garantie satisfait ou remboursé
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Annulez à tout moment dans les 30 premiers jours
                </p>
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {plan.custom ? (
              <button
                onClick={handleEnterpriseContact}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                Contactez-nous pour un devis
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Redirection...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Payer {formatPrice(price)}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Annuler
            </button>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>En continuant, vous acceptez nos conditions d'utilisation</p>
            <p>et notre politique de confidentialité</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 