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
      {/* Particules flottantes subtiles */}
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full blur-sm"
      />
      <motion.div
        animate={{ 
          y: [0, -3, 0],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-400 rounded-full blur-sm"
      />
    </motion.div>
  );
} 