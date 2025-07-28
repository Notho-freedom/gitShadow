'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResizableLayout({ 
  children, 
  defaultSizes = [280, 1], // [sidebar, main] en pixels ou ratios
  minSizes = [200, 400], // tailles minimales
  maxSizes = [500, null], // tailles maximales (null = illimité)
  direction = 'horizontal', // 'horizontal' ou 'vertical'
  className = ''
}) {
  const [sizes, setSizes] = useState(defaultSizes);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSizes, setStartSizes] = useState([0, 0]);
  const containerRef = useRef(null);

  const isHorizontal = direction === 'horizontal';

  // Calculer les tailles en pourcentages ou pixels
  const getSizeStyle = (size, index) => {
    if (typeof size === 'number') {
      return isHorizontal ? { width: `${size}px` } : { height: `${size}px` };
    }
    return isHorizontal ? { width: `${size}%` } : { height: `${size}%` };
  };

  // Gestion du redimensionnement
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSizes([...sizes]);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sizes]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;

    const delta = isHorizontal 
      ? e.clientX - startPos.x 
      : e.clientY - startPos.y;

    const containerSize = isHorizontal 
      ? containerRef.current?.offsetWidth 
      : containerRef.current?.offsetHeight;

    if (!containerSize) return;

    const newSizes = [...startSizes];
    const totalSize = newSizes.reduce((sum, size) => sum + (typeof size === 'number' ? size : containerSize * size / 100), 0);
    
    // Calculer la nouvelle taille du premier élément
    let newFirstSize = newSizes[0] + delta;
    
    // Appliquer les contraintes minimales et maximales
    if (minSizes[0] && newFirstSize < minSizes[0]) {
      newFirstSize = minSizes[0];
    }
    if (maxSizes[0] && newFirstSize > maxSizes[0]) {
      newFirstSize = maxSizes[0];
    }

    // Calculer la taille du deuxième élément
    let newSecondSize = totalSize - newFirstSize;
    if (minSizes[1] && newSecondSize < minSizes[1]) {
      newSecondSize = minSizes[1];
      newFirstSize = totalSize - newSecondSize;
    }
    if (maxSizes[1] && newSecondSize > maxSizes[1]) {
      newSecondSize = maxSizes[1];
      newFirstSize = totalSize - newSecondSize;
    }

    newSizes[0] = newFirstSize;
    newSizes[1] = newSecondSize;

    setSizes(newSizes);
  }, [isResizing, startPos, startSizes, minSizes, maxSizes, isHorizontal]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  // Nettoyage des event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Gestion du touch pour mobile
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsResizing(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setStartSizes([...sizes]);
  }, [sizes]);

  const handleTouchMove = useCallback((e) => {
    if (!isResizing) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const delta = isHorizontal 
      ? touch.clientX - startPos.x 
      : touch.clientY - startPos.y;

    const containerSize = isHorizontal 
      ? containerRef.current?.offsetWidth 
      : containerRef.current?.offsetHeight;

    if (!containerSize) return;

    const newSizes = [...startSizes];
    const totalSize = newSizes.reduce((sum, size) => sum + (typeof size === 'number' ? size : containerSize * size / 100), 0);
    
    let newFirstSize = newSizes[0] + delta;
    
    if (minSizes[0] && newFirstSize < minSizes[0]) {
      newFirstSize = minSizes[0];
    }
    if (maxSizes[0] && newFirstSize > maxSizes[0]) {
      newFirstSize = maxSizes[0];
    }

    let newSecondSize = totalSize - newFirstSize;
    if (minSizes[1] && newSecondSize < minSizes[1]) {
      newSecondSize = minSizes[1];
      newFirstSize = totalSize - newSecondSize;
    }
    if (maxSizes[1] && newSecondSize > maxSizes[1]) {
      newSecondSize = maxSizes[1];
      newFirstSize = totalSize - newSecondSize;
    }

    newSizes[0] = newFirstSize;
    newSizes[1] = newSecondSize;

    setSizes(newSizes);
  }, [isResizing, startPos, startSizes, minSizes, maxSizes, isHorizontal]);

  const handleTouchEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ 
        cursor: isResizing ? (isHorizontal ? 'col-resize' : 'row-resize') : 'default',
        userSelect: isResizing ? 'none' : 'auto'
      }}
    >
      {/* Premier élément */}
      <motion.div
        style={getSizeStyle(sizes[0], 0)}
        className="flex-shrink-0 overflow-hidden"
        animate={{ 
          [isHorizontal ? 'width' : 'height']: getSizeStyle(sizes[0], 0)[isHorizontal ? 'width' : 'height']
        }}
        transition={{ duration: isResizing ? 0 : 0.2 }}
      >
        {children[0]}
      </motion.div>

      {/* Séparateur redimensionnable */}
      <motion.div
        className={`relative flex-shrink-0 ${
          isHorizontal 
            ? 'w-1 cursor-col-resize hover:w-2' 
            : 'h-1 cursor-row-resize hover:h-2'
        } bg-gray-600 hover:bg-blue-500 transition-all duration-200 group`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        whileHover={{ 
          scale: isHorizontal ? [1, 1.2] : [1, 1.2],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Indicateur de redimensionnement */}
        <div className={`absolute inset-0 flex items-center justify-center ${
          isHorizontal ? 'flex-col' : 'flex-row'
        }`}>
          <div className="w-1 h-4 bg-gray-400 group-hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="w-1 h-4 bg-gray-400 group-hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1" />
        </div>

        {/* Overlay de redimensionnement */}
        <AnimatePresence>
          {isResizing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-blue-500/20 z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Deuxième élément */}
      <motion.div
        style={getSizeStyle(sizes[1], 1)}
        className="flex-1 overflow-hidden"
        animate={{ 
          [isHorizontal ? 'width' : 'height']: getSizeStyle(sizes[1], 1)[isHorizontal ? 'width' : 'height']
        }}
        transition={{ duration: isResizing ? 0 : 0.2 }}
      >
        {children[1]}
      </motion.div>
    </div>
  );
} 