'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Shield, CheckCircle, AlertTriangle, Info } from 'lucide-react';
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
  const [step, setStep] = useState('checkout'); // checkout, processing, success, error

  const price = isAnnual ? (plan?.price || 0) * 10 : (plan?.price || 0);
  const originalPrice = isAnnual ? (plan?.price || 0) * 12 : (plan?.price || 0);
  const savings = originalPrice - price;

  const handleCheckout = async () => {
    if (!plan || !plan.id) {
      setError('Plan invalide');
      return;
    }
    
    if (!user?.email) {
      setError('Vous devez être connecté pour effectuer un paiement');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          customerEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${plan.id}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          metadata: {
            userId: user.id,
            planName: plan.name,
            isAnnual: isAnnual,
            userEmail: user.email
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Rediriger vers Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe n\'est pas disponible');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

      setStep('success');

    } catch (err) {
      console.error('Erreur lors du checkout:', err);
      setError(err.message || 'Une erreur est survenue lors du paiement');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseContact = () => {
    const subject = encodeURIComponent('Demande de devis GitShadow Enterprise');
    const body = encodeURIComponent(`
Bonjour,

Je souhaite obtenir un devis pour le plan Enterprise de GitShadow.

Informations :
- Nom : ${user?.name || 'Non renseigné'}
- Email : ${user?.email || 'Non renseigné'}
- Plan souhaité : Enterprise
- Besoins spécifiques : [À préciser]

Cordialement,
${user?.name || 'Utilisateur'}
    `);
    
    window.open(`mailto:contact@gitshadow.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleRetry = () => {
    setError(null);
    setStep('checkout');
  };

  const handleClose = () => {
    if (step === 'success') {
      // Rediriger vers le dashboard après un paiement réussi
      window.location.href = '/dashboard?success=true';
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setStep('checkout');
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
        onClick={handleClose}
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
              {step === 'success' ? 'Paiement réussi !' : 
               step === 'error' ? 'Erreur de paiement' :
               'Finaliser votre abonnement'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bienvenue chez GitShadow !
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Votre abonnement {plan.name} a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités premium.
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Accéder au dashboard
              </button>
            </div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Erreur de paiement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'Une erreur est survenue lors du traitement de votre paiement.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {step === 'processing' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Redirection en cours...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vous allez être redirigé vers la page de paiement sécurisée de Stripe.
              </p>
            </div>
          )}

          {/* Checkout State */}
          {step === 'checkout' && (
            <>
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
                
                {isAnnual && plan.price > 0 && savings > 0 && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Économisez {formatPrice(savings)} par an
                  </div>
                )}
              </div>

              {/* Fonctionnalités incluses */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Fonctionnalités incluses :
                </h4>
                <div className="space-y-2">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      + {plan.features.length - 3} autres fonctionnalités
                    </div>
                  )}
                </div>
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

              {/* Informations importantes */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Important
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Votre abonnement sera renouvelé automatiquement. Vous pouvez l'annuler à tout moment.
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
                        <span>Préparation...</span>
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
                  onClick={handleClose}
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
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 