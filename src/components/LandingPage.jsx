'use client';

import { useState } from 'react';
import Logo from './Logo';

export default function LandingPage({ onGetStarted }) {
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour découvrir gitShadow',
      features: [
        '5 dépôts publics',
        '10 générations de doc/mois',
        'Support communautaire',
        'Historique 7 jours',
        'Export Markdown'
      ],
      limitations: [
        'Pas de dépôts privés',
        'Pas d\'API access',
        'Pas de collaboration'
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professionnel',
      price: '29€',
      period: '/mois',
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
        'Analytics avancées'
      ],
      limitations: [],
      cta: 'Essai gratuit 14 jours',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: 'Sur mesure',
      period: '',
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
        'Support dédié'
      ],
      limitations: [],
      cta: 'Contactez-nous',
      popular: false
    }
  ];

  const features = [
    {
      title: 'Documentation IA Intelligente',
      description: 'Génération automatique de documentation complète avec analyse contextuelle du code',
      icon: '🤖'
    },
    {
      title: 'Intégration GitHub Native',
      description: 'Accès direct à vos dépôts publics et privés avec synchronisation en temps réel',
      icon: '🔗'
    },
    {
      title: 'Historique des Commits',
      description: 'Naviguez dans l\'historique complet et générez la doc pour chaque version',
      icon: '📚'
    },
    {
      title: 'Interface VSCode-like',
      description: 'Environnement familier avec explorateur de fichiers et éditeur intégré',
      icon: '💻'
    },
    {
      title: 'Export Multi-formats',
      description: 'Exportez en Markdown, PDF, HTML ou directement vers Confluence',
      icon: '📄'
    },
    {
      title: 'Collaboration Équipe',
      description: 'Partagez et collaborez sur la documentation avec votre équipe',
      icon: '👥'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" animate={false} />
            <span className="text-2xl font-bold">gitShadow</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</a>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Se connecter
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Documentation IA
            <br />
            pour Développeurs
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Transformez votre code en documentation professionnelle avec l'intelligence artificielle. 
            Connectez vos dépôts GitHub et générez une documentation complète en quelques clics.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-2xl"
            >
              Commencer gratuitement
            </button>
            <button className="px-8 py-4 border border-gray-600 rounded-xl hover:border-gray-500 transition-colors font-semibold text-lg">
              Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Fonctionnalités Avancées</h2>
          <p className="text-xl text-gray-400">Tout ce dont vous avez besoin pour une documentation parfaite</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Plans Tarifaires</h2>
          <p className="text-xl text-gray-400">Choisissez le plan qui correspond à vos besoins</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-2xl p-8 hover:border-gray-600 transition-all duration-200 ${
                plan.popular ? 'border-blue-500 scale-105' : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-400 mr-3">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-red-400 mr-3">✗</span>
                    <span className="text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Prêt à transformer votre documentation ?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Rejoignez des milliers de développeurs qui utilisent gitShadow pour créer une documentation exceptionnelle.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-2xl"
          >
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" animate={false} />
              <span className="text-lg font-semibold">gitShadow</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 gitShadow. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
