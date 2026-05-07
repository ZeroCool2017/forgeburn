import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

/**
 * Electroplankton-inspired floating organisms on the dashboard.
 * They drift, morph into beautiful shapes, and respond to the current sound mode.
 * Density increases with debt paydown (gamification touch).
 */

function Organism({ index, progress }) {
  const x = useMotionValue(Math.random() * 100);
  const y = useMotionValue(Math.random() * 100);

  useEffect(() => {
    const interval = setInterval(() => {
      x.set(Math.random() * 100);
      y.set(Math.random() * 100);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [x, y]);

  const baseSize = 6 + Math.random() * 10;
  const seed = index * 1234;

  return (
    <motion.div
      style={{
        x: useTransform(x, (value) => `${value}vw`),
        y: useTransform(y, (value) => `${value}vh`),
      }}
      transition={{ duration: 4 + Math.random() * 3, ease: 'easeInOut' }}
      className="fixed pointer-events-none"
      animate={{
        scale: [1, 1.4, 0.9, 1.2, 1],
        opacity: [0.4, 0.8, 0.5, 0.7, 0.4],
      }}
      transition={{
        duration: 4 + (seed % 1000) / 1000,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer morphing ring */}
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{
          width: `${baseSize * 1.5}px`,
          height: `${baseSize * 1.5}px`,
          borderColor: `hsl(200, 80%, ${55 + progress * 25}%)`,
          borderWidth: '1px',
          left: `${-baseSize * 0.75}px`,
          top: `${-baseSize * 0.75}px`,
        }}
        animate={{
          scale: [1, 1.3, 0.8, 1.1, 1],
          opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
          borderRadius: ['50%', '40%', '60%', '45%', '50%'],
        }}
        transition={{
          duration: 4.5 + (seed % 1000) / 1000,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      />

      {/* Core orb */}
      <motion.div
        className="absolute rounded-full blur-lg"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          background: `radial-gradient(circle, hsl(200, 90%, ${60 + progress * 25}%), hsl(200, 70%, ${45 + progress * 20}%))`,
          boxShadow: `0 0 ${baseSize * 2.5}px hsl(200, 85%, ${55 + progress * 20}%), inset 0 0 ${baseSize}px hsl(200, 100%, 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 0.95, 1.1, 1],
          x: [0, 2, -2, 1, 0],
          y: [0, -2, 2, -1, 0],
        }}
        transition={{
          duration: 4 + (seed % 1000) / 1000,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner shimmer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize * 0.4}px`,
          height: `${baseSize * 0.4}px`,
          background: `hsl(200, 100%, 85%)`,
          filter: 'blur(2px)',
          left: `${baseSize * 0.3}px`,
          top: `${baseSize * 0.3}px`,
        }}
        animate={{
          opacity: [0.2, 1, 0.3, 0.8, 0.2],
          scale: [0.8, 1.2, 0.9, 1.1, 0.8],
        }}
        transition={{
          duration: 3 + (seed % 1000) / 1000,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      />
    </motion.div>
  );
}

export default function FloatingOrganisms({ debtProgress = 0 }) {
  const { mode } = useAmbientSoundContext();
  
  // More organisms as debt decreases (gamification: progress = more life)
  const baseOrganismCount = 4 + Math.floor(debtProgress * 0.05); // max ~9 at 100% progress
  const isVisible = mode !== 'off';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        zIndex: 5, 
        opacity: isVisible ? 0.6 : 0,
        transition: 'opacity 0.6s ease',
        mixBlendMode: 'screen',
      }}
    >
      {isVisible && Array.from({ length: baseOrganismCount }).map((_, i) => (
        <Organism
          key={i}
          index={i}
          progress={debtProgress}
        />
      ))}
    </div>
  );
}