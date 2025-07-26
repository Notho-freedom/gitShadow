'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Accueil', href: '/', scrollTo: 'hero' },
    { name: 'Fonctionnalités', href: '/', scrollTo: 'features' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'À propos', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo 3D */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ 
                rotateY: 180,
                scale: 1.1,
                transition: { duration: 0.6, ease: "easeInOut" }
              }}
              className="relative"
            >
              {/* Logo Container avec effet 3D */}
              <div className="relative w-12 h-12 transform-style-preserve-3d">
                {/* Face avant */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-2xl border border-white/20 flex items-center justify-center group-hover:shadow-blue-500/50 transition-all duration-500">
                  <span className="text-white font-bold text-xl tracking-wider">GS</span>
                </div>
                
                {/* Face arrière (visible au hover) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-600 to-blue-600 rounded-xl shadow-2xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-white font-bold text-xl tracking-wider">SH</span>
                </div>
                
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Particules flottantes */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full blur-sm"
              />
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full blur-sm"
              />
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl tracking-wider group-hover:text-blue-400 transition-colors duration-300">
                gitShadow
              </span>
              <span className="text-blue-400 text-xs font-medium tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                AI DOCS
              </span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.href === '/' ? (
                  <button
                    onClick={() => scrollToSection(item.scrollTo)}
                    className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                  </button>
                ) : (
                  <Link href={item.href}>
                    <span className="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group cursor-pointer">
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Boutons CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Connexion
              </motion.button>
            </Link>
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
              >
                <span className="relative z-10">Commencer</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </Link>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 border-t border-white/10">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.href === '/' ? (
                  <button
                    onClick={() => {
                      scrollToSection(item.scrollTo);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <span 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    >
                      {item.name}
                    </span>
                  </Link>
                )}
              </motion.div>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link href="/auth">
                <span 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-left text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                >
                  Connexion
                </span>
              </Link>
              <Link href="/auth">
                <span 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Commencer
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
} 