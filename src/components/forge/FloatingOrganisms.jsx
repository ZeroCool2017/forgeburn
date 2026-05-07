import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

/**
 * Floating organisms inspired by organic, rhythmic movement patterns.
 * They move in synchronized waves, attract and repel, creating mesmerizing formations.
 * Density increases with debt paydown (gamification touch).
 */

function Organism({ index, progress, totalCount, positions }) {
  const x = useMotionValue(Math.random() * 100);
  const y = useMotionValue(Math.random() * 100);
  const xRef = useRef(x.get());
  const yRef = useRef(y.get());
  
  const seed = index * 1234;
  const baseSize = 6 + Math.random() * 10;
  const breatheDuration = 4 + (seed % 3000) / 1000;
  
  // Create wave-like synchronized motion
  const cycleTime = 8000 + (seed % 4000);
  const phase = (index / totalCount) * Math.PI * 2;

  useEffect(() => {
    let animationFrame;
    let time = 0;

    const animate = () => {
      time += 16; // ~60fps
      
      // Smooth sine wave for x (left-right oscillation)
      let xWave = 50 + Math.sin(time / cycleTime * Math.PI * 2 + phase) * 40;
      
      // Offset y sine for perpendicular motion (creates orbital feel)
      let yWave = 50 + Math.cos((time / cycleTime * Math.PI * 2 + phase) * 0.7) * 35;
      
      // Gentle collision/bounce with nearby organisms
      if (positions.current) {
        positions.current[index] = { x: xWave, y: yWave };
        
        for (let i = 0; i < totalCount; i++) {
          if (i === index || !positions.current[i]) continue;
          
          const other = positions.current[i];
          const dx = other.x - xWave;
          const dy = other.y - yWave;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = 15; // Soft bounce distance
          
          if (dist < minDist && dist > 0) {
            // Gentle repulsion
            const force = (minDist - dist) * 0.15;
            const angle = Math.atan2(dy, dx);
            xWave -= Math.cos(angle) * force;
            yWave -= Math.sin(angle) * force;
          }
        }
      }
      
      // Clamp to viewport
      xWave = Math.max(2, Math.min(98, xWave));
      yWave = Math.max(2, Math.min(98, yWave));
      
      xRef.current = xWave;
      yRef.current = yWave;
      x.set(xWave);
      y.set(yWave);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [x, y, phase, cycleTime, index, totalCount, positions]);

  return (
    <motion.div
      style={{
        x: useTransform(x, (value) => `${value}vw`),
        y: useTransform(y, (value) => `${value}vh`),
      }}
      className="fixed pointer-events-none"
      animate={{
        scale: [1, 1.2, 0.95, 1.15, 1],
        opacity: [0.3, 0.7, 0.35, 0.65, 0.3],
      }}
      transition={{
        duration: breatheDuration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Outer glow envelope */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize * 1.8}px`,
          height: `${baseSize * 1.8}px`,
          background: `radial-gradient(circle, hsl(200, 80%, ${55 + progress * 25}%), transparent 70%)`,
          left: `${-baseSize * 0.4}px`,
          top: `${-baseSize * 0.4}px`,
          filter: 'blur(1px)',
        }}
        animate={{
          scale: [0.9, 1.4, 0.85, 1.3, 0.9],
          opacity: [0.2, 0.5, 0.15, 0.4, 0.2],
        }}
        transition={{
          duration: breatheDuration * 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core orb with inner glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize}px`,
          height: `${baseSize}px`,
          background: `radial-gradient(circle at 35% 35%, hsl(200, 92%, ${62 + progress * 18}%), hsl(200, 78%, ${45 + progress * 25}%))`,
          boxShadow: `0 0 ${baseSize * 2.5}px hsl(200, 88%, ${55 + progress * 20}%), inset 0 0 ${baseSize}px rgba(200, 230, 255, 0.4)`,
        }}
        animate={{
          scale: [1, 1.15, 0.97, 1.12, 1],
        }}
        transition={{
          duration: breatheDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner light reflection */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${baseSize * 0.4}px`,
          height: `${baseSize * 0.4}px`,
          background: 'hsl(200, 100%, 88%)',
          filter: 'blur(1.5px)',
          left: `${baseSize * 0.3}px`,
          top: `${baseSize * 0.25}px`,
        }}
        animate={{
          opacity: [0.2, 0.9, 0.25, 0.75, 0.2],
          scale: [0.85, 1.4, 0.8, 1.3, 0.85],
          x: [0, 1, -0.5, 0.8, 0],
          y: [0, -1, 0.5, -0.8, 0],
        }}
        transition={{
          duration: breatheDuration * 0.75,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.15,
        }}
      />
    </motion.div>
  );
}

export default function FloatingOrganisms({ debtProgress = 0 }) {
  const { mode } = useAmbientSoundContext();
  const positionsRef = useRef({});
  
  // More organisms as debt decreases (gamification: progress = more life)
  const baseOrganismCount = 10 + Math.floor(debtProgress * 0.2); // max ~20+ at 100% progress
  const isVisible = mode !== 'off';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        zIndex: 5, 
        opacity: isVisible ? 0.55 : 0,
        transition: 'opacity 0.6s ease',
        mixBlendMode: 'screen',
      }}
    >
      {isVisible && Array.from({ length: baseOrganismCount }).map((_, i) => (
        <Organism
          key={i}
          index={i}
          progress={debtProgress}
          totalCount={baseOrganismCount}
          positions={positionsRef}
        />
      ))}
    </div>
  );
}