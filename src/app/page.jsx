'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import LandingPage from '../components/LandingPage';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';

export default function HomePage() {
  const [currentView, setCurrentView] = useState('loading'); // loading, landing, auth, dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('github_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('dashboard');
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        localStorage.removeItem('github_user');
        setCurrentView('landing');
      }
    } else {
      setCurrentView('landing');
    }
  }, []);

  const handleLoadingComplete = () => {
    setCurrentView('landing');
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('github_user');
    setUser(null);
    setCurrentView('landing');
  };

  // Rendu conditionnel basé sur l'état actuel
  switch (currentView) {
    case 'loading':
      return <LoadingScreen onComplete={handleLoadingComplete} />;
    
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    
    case 'auth':
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    
    case 'dashboard':
      return user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoadingScreen onComplete={() => setCurrentView('landing')} />
      );
    
    default:
      return <LoadingScreen onComplete={handleLoadingComplete} />;
  }
}
