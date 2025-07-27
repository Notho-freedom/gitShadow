'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Vérifier l'utilisateur GitHub
      const githubUser = localStorage.getItem('github_user');
      if (githubUser) {
        const userData = JSON.parse(githubUser);
        setUser(userData);
        setIsGuest(false);
        setLoading(false);
        return;
      }

      // Vérifier l'utilisateur invité
      const guestUser = localStorage.getItem('guest_user');
      if (guestUser) {
        const guestData = JSON.parse(guestUser);
        setUser(guestData);
        setIsGuest(true);
        setLoading(false);
        return;
      }

      // Aucun utilisateur connecté
      setUser(null);
      setIsGuest(false);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      setUser(null);
      setIsGuest(false);
      setLoading(false);
    }
  };

  const login = (userData, isGuestUser = false) => {
    if (isGuestUser) {
      localStorage.setItem('guest_user', JSON.stringify(userData));
      setIsGuest(true);
    } else {
      localStorage.setItem('github_user', JSON.stringify(userData));
      setIsGuest(false);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('github_user');
    localStorage.removeItem('guest_user');
    setUser(null);
    setIsGuest(false);
  };

  const updateUser = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    if (isGuest) {
      localStorage.setItem('guest_user', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('github_user', JSON.stringify(updatedUser));
    }
    setUser(updatedUser);
  };

  const createGuestUser = () => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      login: 'invité',
      name: 'Utilisateur Invité',
      email: null,
      avatar_url: '/guest-avatar.png',
      plan: 'free',
      isGuest: true,
      repos: [],
      maxRepos: 3,
      createdAt: new Date().toISOString()
    };
    
    login(guestUser, true);
    return guestUser;
  };

  const value = {
    user,
    loading,
    isGuest,
    login,
    logout,
    updateUser,
    createGuestUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
} 