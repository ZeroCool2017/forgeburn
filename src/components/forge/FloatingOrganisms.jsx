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
  
  // Synchronized movement pattern: unison → divergence
  const phase = (index % 4) * 0.25; // Creates groups that move together

  useEffect(() => {
    const interval = setInterval(() => {
      // Move to new position with phase offset for synchronized then divergent behavior
      x.set(Math.random() * 100);
      y.set(Math.random() * 100 + (Math.sin(phase * Math.PI * 2) * 20)); // Phase-based drift
    }, 4000 + (phase * 2000)); // Staggered timing based on phase

    return () => clearInterval(interval);
  }, [x, y, phase]);

  const baseSize = 8 + Math.random() * 12;
  const seed = index * 1234;
  const breatheDuration = 5 + (seed % 2000) / 1000;

  return (
    <motion.div
      style={{
        x: useTransform(x, (value) => `${value}vw`),
        y: useTransform(y, (value) => `${value}vh`),
      }}
      transition={{ duration: 6 + Math.random() * 4, ease: 'easeInOut' }}
      className="fixed pointer-events-none"
      animate={{
        scale: [1, 1.15, 0.95, 1.08, 1],
        opacity: [0.35, 0.65, 0.4, 0.6, 0.35],
      }}
      transition={{
        duration: breatheDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer morphing halo */}
      <motion.div
        className="absolute inset-0 rounded-full blur-sm"
        style={{
          width: `${baseSize * 2}px`,
          height: `${baseSize * 2}px`,
          background: `radial-gradient(circle, hsl(200, 85%, ${50 + progress * 30}%), transparent)`,
          left: `${-baseSize * 0.5}px`,
          top: `${-baseSize * 0.5}px`,
        }}
        animate={{
          scale: [0.8, 1.3, 0.9, 1.2, 0.8],
          opacity: [0.15, 0.4, 0.1, 0.3, 0.15],
        }}
        transition={{
          duration: breatheDuration + 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core breathing orb */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          background: `radial-gradient(circle at 30% 30%, hsl(200, 95%, ${65 + progress * 20}%), hsl(200, 75%, ${48 + progress * 22}%))`,
          boxShadow: `0 0 ${baseSize * 3}px hsl(200, 90%, ${58 + progress * 22}%), inset 0 0 ${baseSize * 0.8}px hsl(200, 100%, 80%)`,
          filter: 'blur(0.5px)',
        }}
        animate={{
          scale: [1, 1.12, 0.98, 1.1, 1],
        }}
        transition={{
          duration: breatheDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Gentle shimmer that moves */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize * 0.35}px`,
          height: `${baseSize * 0.35}px`,
          background: `hsl(200, 100%, 90%)`,
          filter: 'blur(1.5px)',
          left: `${baseSize * 0.25}px`,
          top: `${baseSize * 0.2}px`,
        }}
        animate={{
          opacity: [0.15, 0.8, 0.2, 0.7, 0.15],
          scale: [0.9, 1.3, 0.85, 1.2, 0.9],
          x: [0, 1.5, -1, 1, 0],
          y: [0, -1.5, 1, -1, 0],
        }}
        transition={{
          duration: breatheDuration * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
    </motion.div>
  );
}

export default function FloatingOrganisms({ debtProgress = 0 }) {
  const { mode } = useAmbientSoundContext();
  
  // More organisms as debt decreases (gamification: progress = more life)
  const baseOrganismCount = 8 + Math.floor(debtProgress * 0.15); // max ~20+ at 100% progress
  const isVisible = mode !== 'off';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        zIndex: 5, 
        opacity: isVisible ? 0.5 : 0,
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