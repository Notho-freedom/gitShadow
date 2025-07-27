'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';
import AuthModal from './AuthModal';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading, isGuest, logout, createGuestUser } = useAuth();

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

  const handleGuestMode = () => {
    createGuestUser();
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const renderUserSection = () => {
    if (loading) {
      return (
        <div className="hidden lg:flex items-center space-x-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (user) {
      return (
        <div className="hidden lg:flex items-center space-x-4">
          {/* Avatar et menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200"
            >
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-blue-400 transition-colors duration-200"
              />
              <span className="text-sm font-medium">{user.name}</span>
              {isGuest && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Invité
                </span>
              )}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu déroulant utilisateur */}
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email || 'Aucun email'}</p>
                  {isGuest && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Mode invité - {user.repos?.length || 0}/3 dépôts
                    </p>
                  )}
                </div>
                
                <Link href="/dashboard">
                  <span
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    Dashboard
                  </span>
                </Link>
                
                {!isGuest && (
                  <Link href="/pricing">
                    <span
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                    >
                      Gérer l'abonnement
                    </span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200"
                >
                  Se déconnecter
                </button>
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    // Utilisateur non connecté
    return (
      <div className="hidden lg:flex items-center space-x-4">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
        >
          Connexion
        </button>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group overflow-hidden"
        >
          <span className="relative z-10">Commencer</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    );
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <Logo size="md" />
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
              {navItems.map((item) => (
                <div key={item.name}>
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
                </div>
              ))}
            </div>

            {/* Section utilisateur */}
            {renderUserSection()}

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
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-2 border-t border-white/10">
              {navItems.map((item) => (
                <div key={item.name}>
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
                </div>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-white font-medium">{user.name}</p>
                    {isGuest && (
                      <p className="text-yellow-400 text-xs">
                        Mode invité - {user.repos?.length || 0}/3 dépôts
                      </p>
                    )}
                  </div>
                  <Link href="/dashboard">
                    <span
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-left text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                    >
                      Dashboard
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-400 hover:text-red-300 py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    Commencer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onGuestMode={handleGuestMode}
      />
    </>
  );
} 