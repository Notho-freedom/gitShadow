'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Users, Shield, Globe } from 'lucide-react';
import { formatPrice } from '@/lib/pricing';

const icons = {
  free: <Zap className="w-5 h-5" />,
  pro: <Star className="w-5 h-5" />,
  team: <Users className="w-5 h-5" />,
  enterprise: <Shield className="w-5 h-5" />
};

export default function PricingCard({ plan, isAnnual = false, onSelect, isSelected = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const price = isAnnual ? plan.price * 10 : plan.price;
  const originalPrice = isAnnual ? plan.price * 12 : plan.price;

  return (
    <motion.div
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
        plan.popular
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Badge populaire */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Le plus populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className={`p-3 rounded-full ${
            plan.popular 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {icons[plan.id]}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {plan.description}
        </p>

        {/* Prix */}
        <div className="mb-6">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {formatPrice(price)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              /{isAnnual ? 'an' : 'mois'}
            </span>
          </div>
          
          {isAnnual && plan.price > 0 && (
            <div className="flex items-center justify-center mt-2">
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}/an
              </span>
              <span className="ml-2 text-sm text-green-600 font-semibold">
                Économisez 20%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fonctionnalités */}
      <div className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {feature}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Limitations */}
      {plan.limitations.length > 0 && (
        <div className="space-y-2 mb-8">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Limitations
          </h4>
          {plan.limitations.map((limitation, index) => (
            <div key={index} className="flex items-start">
              <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {limitation}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Bouton d'action */}
      <motion.button
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
          plan.popular
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            : plan.price === 0
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
        }`}
        onClick={() => onSelect(plan)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
      </motion.button>

      {/* Plan Enterprise personnalisé */}
      {plan.custom && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Contactez-nous pour un devis personnalisé
        </p>
      )}
    </motion.div>
  );
} 