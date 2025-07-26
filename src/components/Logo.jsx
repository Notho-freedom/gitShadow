'use client';

import { motion } from 'framer-motion';

export default function Logo({ size = 'md', className = '', animate = true }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  };

  const LogoContent = () => (
    <div className={`bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-2xl border border-white/20 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center justify-center">
        <span className="text-white font-bold tracking-wider">
          <span className="text-sm">g</span>
          <span className="text-lg -mt-1">S</span>
        </span>
      </div>
    </div>
  );

  if (!animate) {
    return <LogoContent />;
  }

  return (
    <motion.div
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className="relative"
    >
      <LogoContent />
    </motion.div>
  );
} 