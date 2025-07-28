'use client';

import { useState, useEffect } from 'react';

// Désactiver le pré-rendu statique
export const dynamic = 'force-dynamic';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '../../components/Logo';
import Navbar from '../../components/Navbar';
import PricingCard from '../../components/PricingCard';
import CheckoutModal from '../../components/CheckoutModal';
import { useAuth } from '../../components/AuthProvider';
// Import des plans déplacé dans useEffect pour éviter le pré-rendu

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [plans, setPlans] = useState([]);
  
  // Utiliser l'AuthProvider au lieu de localStorage
  const { user, isAuthenticated, loading } = useAuth();

  // Charger les plans
  useEffect(() => {
    const loadData = async () => {
      try {
        // Import dynamique des plans
        const { pricingPlans, annualPlans } = await import('../../lib/pricing');
        const currentPlans = isAnnual ? (annualPlans || []) : (pricingPlans || []);
        setPlans(currentPlans);
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
        setPlans([]);
      }
    };

    loadData();
  }, [isAnnual]);

  const handlePlanSelect = (plan) => {
    if (!plan) return;
    
    setSelectedPlan(plan);
    
    // Si l'utilisateur n'est pas connecté, afficher la modale de connexion
    if (!isAuthenticated) {
      // Rediriger vers la page d'accueil avec une modale de connexion
      window.location.href = '/?showAuth=true';
      return;
    }
    
    if (!plan.price || plan.price === 0) {
      // Plan gratuit - rediriger vers le dashboard
      window.location.href = '/dashboard';
    } else if (plan.custom) {
      // Plan Enterprise - ouvrir le formulaire de contact
      window.open('mailto:contact@gitshadow.com?subject=Demande de devis Enterprise', '_blank');
    } else {
      // Plan payant - ouvrir le modal de paiement
      setShowCheckout(true);
    }
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navbar fixe */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Plans
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tarifaires
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </motion.div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 shadow-xl"
          >
            <div className="flex">
              <motion.button
                onClick={() => setIsAnnual(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  !isAnnual
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mensuel
              </motion.button>
              <motion.button
                onClick={() => setIsAnnual(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative ${
                  isAnnual
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annuel
                {isAnnual && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    -20%
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans && plans.length > 0 ? plans.map((plan, index) => (
              plan && plan.id ? (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <PricingCard
                    plan={plan}
                    isAnnual={isAnnual}
                    onSelect={handlePlanSelect}
                    isSelected={selectedPlan?.id === plan.id}
                  />
                </motion.div>
              ) : null
            )) : (
              <div className="col-span-full text-center text-gray-400">
                Chargement des plans...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Questions Fréquentes</h2>
            <p className="text-xl text-gray-300">
              Tout ce que vous devez savoir sur nos tarifs
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Puis-je changer de plan à tout moment ?',
                answer: 'Oui, vous pouvez passer d\'un plan à l\'autre à tout moment. Les changements sont appliqués immédiatement.'
              },
              {
                question: 'Y a-t-il des frais cachés ?',
                answer: 'Non, nos tarifs sont transparents. Le prix affiché est le prix que vous payez, sans frais cachés.'
              },
              {
                question: 'Que se passe-t-il après l\'essai gratuit ?',
                answer: 'Après les 14 jours d\'essai, vous pouvez choisir de continuer avec le plan Pro ou revenir au plan gratuit.'
              },
              {
                question: 'Puis-je annuler mon abonnement ?',
                answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.'
              },
              {
                question: 'Quels moyens de paiement acceptez-vous ?',
                answer: 'Nous acceptons toutes les cartes de crédit et de débit principales via notre partenaire de paiement sécurisé Stripe.'
              },
              {
                question: 'Comment fonctionne la garantie satisfait ou remboursé ?',
                answer: 'Si vous n\'êtes pas satisfait de notre service dans les 30 premiers jours, nous vous remboursons intégralement, sans questions.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{faq.question}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à Commencer ?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Rejoignez des milliers de développeurs qui utilisent déjà gitShadow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
                >
                  Commencer gratuitement
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/10"
                >
                  Parler à un expert
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" animate={false} />
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 gitShadow. Tous droits réservés.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Modal de paiement */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={handleCheckoutClose}
        plan={selectedPlan}
        user={user}
        isAnnual={isAnnual}
      />
    </div>
  );
} 