'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Initialisation de gitShadow...",
    "Chargement des modules...",
    "Configuration de l'interface...",
    "Prêt à démarrer!"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 800);

    return () => clearInterval(stepTimer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Logo et titre */}
      <div className="text-center mb-12">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">gS</span>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">gitShadow</h1>
        <p className="text-gray-400 text-lg">Documentation IA pour développeurs</p>
      </div>

      {/* Barre de progression */}
      <div className="w-80 mb-8">
        <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0%</span>
          <span>{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Étape actuelle */}
      <div className="text-center">
        <p className="text-gray-300 text-lg mb-4">{steps[currentStep]}</p>
        <div className="flex space-x-1 justify-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-8 text-gray-500 text-sm">
        Version 2.0.0 - Édition Professionnelle
      </div>
    </div>
  );
}
