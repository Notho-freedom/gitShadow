'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function AboutPage() {
  const team = [
    {
      name: 'Alexandre Dubois',
      role: 'CEO & Fondateur',
      avatar: '👨‍💼',
      bio: 'Expert en IA et développement, passionné par l\'automatisation de la documentation'
    },
    {
      name: 'Marie Chen',
      role: 'CTO',
      avatar: '👩‍💻',
      bio: 'Architecte logiciel avec 10+ ans d\'expérience dans les plateformes cloud'
    },
    {
      name: 'Thomas Laurent',
      role: 'Lead Developer',
      avatar: '👨‍🔬',
      bio: 'Spécialiste React/Next.js et intégration d\'APIs complexes'
    },
    {
      name: 'Sophie Martin',
      role: 'UX/UI Designer',
      avatar: '👩‍🎨',
      bio: 'Designer expérimentée, créatrice d\'interfaces intuitives et modernes'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Développeurs actifs' },
    { number: '50K+', label: 'Documentations générées' },
    { number: '99%', label: 'Satisfaction client' },
    { number: '24/7', label: 'Support disponible' }
  ];

  const technologies = [
    { name: 'Next.js', icon: '⚛️', description: 'Framework React moderne' },
    { name: 'React', icon: '⚡', description: 'Interface utilisateur réactive' },
    { name: 'Tailwind CSS', icon: '🎨', description: 'Styling utilitaire moderne' },
    { name: 'GitHub API', icon: '🔗', description: 'Intégration native GitHub' },
    { name: 'OpenAI', icon: '🤖', description: 'IA pour la génération de contenu' },
    { name: 'Framer Motion', icon: '✨', description: 'Animations fluides' }
  ];

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
              À Propos de
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                gitShadow
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Nous révolutionnons la façon dont les développeurs créent et maintiennent 
              leur documentation grâce à l'intelligence artificielle
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Notre Mission</h2>
              <p className="text-lg text-gray-300 mb-6">
                Chez gitShadow, nous croyons que la documentation ne devrait jamais être 
                un fardeau pour les développeurs. Notre mission est d'automatiser et 
                d'améliorer le processus de création de documentation grâce à l'IA.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                Nous voulons que chaque projet, qu'il soit open source ou privé, 
                puisse bénéficier d'une documentation claire, complète et toujours à jour.
              </p>
              <div className="flex space-x-4">
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Commencer maintenant
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-600 hover:border-white text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white/10"
                >
                  En savoir plus
                </motion.button>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Pourquoi gitShadow ?</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Gain de temps considérable</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Documentation toujours à jour</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Qualité professionnelle</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span className="text-gray-300">Intégration GitHub native</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Nos Chiffres</h2>
            <p className="text-xl text-gray-300">
              Des résultats qui parlent d'eux-mêmes
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">{stat.number}</div>
                <div className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Notre Équipe</h2>
            <p className="text-xl text-gray-300">
              Des experts passionnés par l'innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 text-center group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{member.avatar}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{member.name}</h3>
                <p className="text-blue-400 mb-3 group-hover:text-blue-300 transition-colors">{member.role}</p>
                <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Technologies</h2>
            <p className="text-xl text-gray-300">
              Stack moderne et performante
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 }
                }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{tech.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{tech.name}</h3>
                <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à Rejoindre l'Aventure ?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Commencez dès aujourd'hui à créer une documentation exceptionnelle
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
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-white/10"
                >
                  Retour à l'accueil
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
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 