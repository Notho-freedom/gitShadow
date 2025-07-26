'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '../../components/Logo';
import Navbar from '../../components/Navbar';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or yearly

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: { monthly: '0€', yearly: '0€' },
      description: 'Parfait pour découvrir gitShadow',
      features: [
        '5 dépôts publics',
        '10 générations de doc/mois',
        'Support communautaire',
        'Historique 7 jours',
        'Export Markdown',
        'Interface de base'
      ],
      limitations: [
        'Pas de dépôts privés',
        'Pas d\'accès API',
        'Pas de collaboration',
        'Pas de templates personnalisés'
      ],
      cta: 'Commencer gratuitement',
      popular: false,
      color: 'gray'
    },
    {
      id: 'pro',
      name: 'Professionnel',
      price: { monthly: '29€', yearly: '290€' },
      description: 'Pour les développeurs sérieux',
      features: [
        'Dépôts illimités',
        'Générations illimitées',
        'Support prioritaire',
        'Export multi-formats',
        'Intégrations CI/CD',
        'Collaboration équipe',
        'Templates personnalisés',
        'Analytics avancées',
        'API access',
        'Webhooks',
        'SSO (SAML)'
      ],
      limitations: [],
      cta: 'Essai gratuit 14 jours',
      popular: true,
      color: 'blue'
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: { monthly: 'Sur mesure', yearly: 'Sur mesure' },
      description: 'Solutions sur mesure pour grandes équipes',
      features: [
        'Tout du plan Pro',
        'Membres illimités',
        'Déploiement on-premise',
        'SSO et sécurité avancée',
        'SLA garantie 99.9%',
        'Formation dédiée',
        'Intégrations personnalisées',
        'Audit et conformité',
        'Support dédié',
        'White-label',
        'API personnalisée',
        'Migration assistée'
      ],
      limitations: [],
      cta: 'Contactez-nous',
      popular: false,
      color: 'purple'
    }
  ];

  const savings = {
    monthly: 0,
    yearly: 20 // 20% de réduction pour l'annuel
  };

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
                onClick={() => setBillingCycle('monthly')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mensuel
              </motion.button>
              <motion.button
                onClick={() => setBillingCycle('yearly')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annuel
                {billingCycle === 'yearly' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    -{savings.yearly}%
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/20 to-transparent shadow-2xl' 
                    : 'border-white/10'
                } hover:bg-white/10 transition-all duration-300`}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      Populaire
                    </span>
                  </motion.div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">{plan.price[billingCycle]}</div>
                  {billingCycle === 'yearly' && plan.price[billingCycle] !== 'Sur mesure' && (
                    <div className="text-green-400 text-sm mb-2">
                      Économisez {savings.yearly}% par rapport au mensuel
                    </div>
                  )}
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="text-gray-300 flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.limitations.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {plan.limitations.map((limitation, i) => (
                        <li key={i} className="text-gray-400 flex items-center">
                          <span className="text-red-400 mr-2">✗</span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href={plan.id === 'enterprise' ? '/contact' : '/auth'}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
} 