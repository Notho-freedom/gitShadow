'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
        'Dépôts illimités (publics + privés)',
        'Générations illimitées',
        'Support prioritaire 24/7',
        'Historique illimité',
        'Export multi-formats (PDF, HTML, Confluence)',
        'Intégrations CI/CD',
        'Collaboration équipe (5 membres)',
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
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-white font-bold text-xl">gitShadow</span>
            </Link>
            
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/auth" className="text-gray-300 hover:text-white transition-colors">
                Connexion
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
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
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10"
          >
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annuel
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    -{savings.yearly}%
                  </span>
                )}
              </button>
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
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/20 to-transparent' 
                    : 'border-white/10'
                } hover:bg-white/10 transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price[billingCycle]}
                    {plan.price[billingCycle] !== 'Sur mesure' && (
                      <span className="text-lg text-gray-400">
                        /{billingCycle === 'monthly' ? 'mois' : 'an'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price[billingCycle] !== 'Sur mesure' && (
                    <div className="text-green-400 text-sm mb-2">
                      Économisez {savings.yearly}% par rapport au mensuel
                    </div>
                  )}
                  <p className="text-gray-300">{plan.description}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Fonctionnalités incluses :</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-gray-300 flex items-start">
                          <span className="text-green-400 mr-2 mt-1">✓</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Limitations :</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, i) => (
                          <li key={i} className="text-gray-400 flex items-start">
                            <span className="text-red-400 mr-2 mt-1">✗</span>
                            <span className="text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Link href={plan.id === 'enterprise' ? '/contact' : '/auth'}>
                    <button className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}>
                      {plan.cta}
                    </button>
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
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
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
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105">
                  Commencer gratuitement
                </button>
              </Link>
              <Link href="/contact">
                <button className="border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/10">
                  Parler à un expert
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
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