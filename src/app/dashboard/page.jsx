'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import Dashboard from '../../components/Dashboard';

export default function DashboardPage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et que le chargement est terminé, rediriger
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    // La déconnexion est gérée par AuthProvider
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // S'assurer que l'utilisateur a un plan défini
  if (!user.plan) {
    const updatedUser = { ...user, plan: 'free' };
    updateUser(updatedUser);
  }

  return <Dashboard />;
} 