import React, { useEffect, useRef } from 'react';
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
  const velocityRef = useRef({ x: 0, y: 0 });
  
  const seed = index * 1234;
  const baseSize = 4 + Math.random() * 7; // Smaller, more delicate
  const breatheDuration = 3 + (seed % 2000) / 1000;
  const organismType = index % 3; // 3 distinct electroplankton forms
  
  // Transform hooks (must be at component level, not inside nested function)
  const xTransformed = useTransform(x, (value) => `${value}vw`);
  const yTransformed = useTransform(y, (value) => `${value}vh`);
  
  // Organic, flowing motion — multiple overlapping cycles
  const slowCycle = 12000 + (seed % 8000);   // Slow drift
  const midCycle = 4000 + (seed % 3000);     // Medium flow
  const fastCycle = 1500 + (seed % 1500);    // Quick flutter
  const phase = (index / totalCount) * Math.PI * 2;

  useEffect(() => {
    let animationFrame;
    let time = 0;

    const animate = () => {
      time += 16; // ~60fps
      
      // Multi-layer motion: slow drift + medium flow + fast flutter = organic movement
      const slowX = Math.sin(time / slowCycle * Math.PI * 2 + phase) * 35;
      const slowY = Math.cos(time / slowCycle * Math.PI * 2 + phase + 0.5) * 30;
      
      const midX = Math.sin(time / midCycle * Math.PI * 2 + phase * 1.3) * 20;
      const midY = Math.cos(time / midCycle * Math.PI * 2 + phase * 0.7) * 18;
      
      const fastX = Math.sin(time / fastCycle * Math.PI * 2 + phase * 2) * 8;
      const fastY = Math.cos(time / fastCycle * Math.PI * 2 + phase * 1.5) * 6;
      
      // Combine into smooth, fluid position
      let xWave = 50 + slowX + midX + fastX;
      let yWave = 50 + slowY + midY + fastY;
      
      // Soft attraction toward center (prevents escape)
      const toCenterX = 50 - xWave;
      const toCenterY = 50 - yWave;
      const distToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
      if (distToCenter > 48) {
        xWave += toCenterX * 0.08;
        yWave += toCenterY * 0.08;
      }
      
      // Smooth collision avoidance — elastic feel
      if (positions.current) {
        positions.current[index] = { x: xWave, y: yWave };
        
        for (let i = 0; i < totalCount; i++) {
          if (i === index || !positions.current[i]) continue;
          
          const other = positions.current[i];
          const dx = other.x - xWave;
          const dy = other.y - yWave;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = 18;
          
          if (dist < minDist && dist > 0.5) {
            // Smooth elastic repulsion
            const force = (minDist - dist) * 0.25;
            const angle = Math.atan2(dy, dx);
            xWave -= Math.cos(angle) * force;
            yWave -= Math.sin(angle) * force;
          }
        }
      }
      
      // Soft bounds (creatures prefer inner area)
      xWave = Math.max(5, Math.min(95, xWave));
      yWave = Math.max(5, Math.min(95, yWave));
      
      xRef.current = xWave;
      yRef.current = yWave;
      x.set(xWave);
      y.set(yWave);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [x, y, phase, slowCycle, midCycle, fastCycle, index, totalCount, positions]);

  // Render different electroplankton forms
  const renderOrganism = () => {
    if (organismType === 0) {
      // Form A: Jellyfish-like with trailing tentacles
      return (
        <motion.div
          style={{
            x: xTransformed,
            y: yTransformed,
          }}
          className="fixed pointer-events-none"
          animate={{
            scale: [1, 1.1, 0.98, 1.08, 1],
            opacity: [0.4, 0.8, 0.5, 0.75, 0.4],
          }}
          transition={{
            duration: breatheDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Trailing tentacle particles */}
          {Array.from({ length: 3 }).map((_, t) => (
            <motion.div
              key={`tentacle-${t}`}
              className="absolute rounded-full"
              style={{
                width: `${baseSize * 0.5}px`,
                height: `${baseSize * 0.5}px`,
                background: `radial-gradient(circle, hsl(195, 100%, 65%), transparent)`,
                left: `${baseSize * 0.2}px`,
                filter: 'blur(0.5px)',
              }}
              animate={{
                y: [0, baseSize * (2 + t), 0],
                x: [0, (t - 1) * baseSize * 0.6, 0],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: breatheDuration * 1.1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: t * 0.15,
              }}
            />
          ))}
          
          {/* Core bell */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              background: `radial-gradient(circle at 40% 30%, hsl(195, 100%, 68%), hsl(195, 90%, 48%))`,
              boxShadow: `0 0 ${baseSize * 2}px hsl(195, 100%, 60%), inset -1px -1px ${baseSize * 0.5}px rgba(100, 200, 255, 0.3)`,
            }}
            animate={{ scale: [1, 1.12, 0.95, 1.1, 1] }}
            transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      );
    } else if (organismType === 1) {
       // Form B: Spiraling ribbon/helix
      return (
        <motion.div
          style={{
            x: xTransformed,
            y: yTransformed,
          }}
          className="fixed pointer-events-none"
          animate={{
            rotate: [0, 360],
            opacity: [0.35, 0.75, 0.4],
          }}
          transition={{
            rotate: { duration: breatheDuration * 2, repeat: Infinity, ease: 'linear' },
            opacity: { duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {/* Spiral ribbon segments */}
          {Array.from({ length: 4 }).map((_, seg) => (
            <motion.div
              key={`spiral-${seg}`}
              className="absolute rounded-full"
              style={{
                width: `${baseSize * 1.2}px`,
                height: `${baseSize * 0.4}px`,
                background: `linear-gradient(90deg, hsl(200, 90%, 60%), hsl(195, 100%, 70%))`,
                left: `${-baseSize * 0.6}px`,
                top: `${-baseSize * 0.2}px`,
                borderRadius: '50%',
                filter: 'blur(0.8px)',
                opacity: 0.6,
              }}
              animate={{ scale: [1, 1.3, 0.8, 1.2, 1] }}
              transition={{
                duration: breatheDuration * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: seg * 0.2,
              }}
            />
          ))}
          
          {/* Core node */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              background: `radial-gradient(circle, hsl(200, 100%, 68%), hsl(200, 85%, 45%))`,
              boxShadow: `0 0 ${baseSize * 2.2}px hsl(200, 100%, 62%)`,
            }}
            animate={{ scale: [1, 1.08, 0.97, 1.06, 1] }}
            transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      );
    } else {
       // Form C: Pulsing membrane with radiating spikes
      return (
        <motion.div
          style={{
            x: xTransformed,
            y: yTransformed,
          }}
          className="fixed pointer-events-none"
          animate={{
            scale: [1, 1.15, 0.9, 1.12, 1],
            opacity: [0.3, 0.7, 0.35, 0.65, 0.3],
          }}
          transition={{
            duration: breatheDuration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Radiating spikes */}
          {Array.from({ length: 6 }).map((_, spike) => {
            const angle = (spike / 6) * Math.PI * 2;
            const spikeX = Math.cos(angle) * baseSize * 0.7;
            const spikeY = Math.sin(angle) * baseSize * 0.7;
            return (
              <motion.div
                key={`spike-${spike}`}
                className="absolute rounded-full"
                style={{
                  width: `${baseSize * 0.3}px`,
                  height: `${baseSize * 0.3}px`,
                  background: `radial-gradient(circle, hsl(205, 100%, 70%), transparent)`,
                  left: `${spikeX}px`,
                  top: `${spikeY}px`,
                  filter: 'blur(0.5px)',
                }}
                animate={{
                  scale: [1, 1.6, 0.7, 1.4, 1],
                  opacity: [0.4, 0.8, 0.2, 0.6, 0.4],
                }}
                transition={{
                  duration: breatheDuration * 0.9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: spike * 0.1,
                }}
              />
            );
          })}
          
          {/* Membrane core */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: `${baseSize}px`,
              height: `${baseSize}px`,
              background: `radial-gradient(circle at 35% 35%, hsl(205, 95%, 65%), hsl(205, 85%, 42%))`,
              boxShadow: `0 0 ${baseSize * 2.3}px hsl(205, 95%, 58%), inset 0 0 ${baseSize * 0.6}px rgba(150, 220, 255, 0.35)`,
            }}
            animate={{ scale: [1, 1.1, 0.98, 1.09, 1] }}
            transition={{ duration: breatheDuration, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      );
    }
  };

  return renderOrganism();
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