import React, { useEffect, useRef, useState } from 'react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

/**
 * Electroplankton-inspired floating organisms on the dashboard.
 * They drift, pulse, and respond to the current sound mode.
 * Density increases with debt paydown (gamification touch).
 */

function Organism({ id, baseFreq, mode }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: Math.random() * 100, y: Math.random() * 100 });
  const [vel, setVel] = useState({ x: (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 0.8 });
  const pulseRef = useRef((Math.random() * 2 + 2)); // 2-4s pulse period

  useEffect(() => {
    const interval = setInterval(() => {
      setPos(p => {
        let nx = p.x + vel.x;
        let ny = p.y + vel.y;
        if (nx < 0 || nx > 100) setVel(v => ({ ...v, x: -v.x }));
        if (ny < 0 || ny > 100) setVel(v => ({ ...v, y: -v.y }));
        nx = Math.max(0, Math.min(100, nx));
        ny = Math.max(0, Math.min(100, ny));
        return { x: nx, y: ny };
      });
    }, 60);
    return () => clearInterval(interval);
  }, [vel]);

  const colorMap = {
    off: 'hsl(260, 15%, 25%)',
    electroplankton: 'hsl(270, 80%, 65%)',
    ender: 'hsl(0, 0%, 60%)',
    deep: 'hsl(150, 60%, 50%)',
  };

  const sizeMap = {
    off: 3,
    electroplankton: 4 + Math.sin(Date.now() / (pulseRef.current * 1000)) * 1.5,
    ender: 2 + Math.cos(Date.now() / 1000) * 0.8,
    deep: 5 + Math.sin(Date.now() / (pulseRef.current * 1500)) * 2,
  };

  const color = colorMap[mode] || colorMap.off;
  const size = sizeMap[mode] || 3;
  const opacity = mode === 'off' ? 0.15 : 0.6;

  return (
    <div
      ref={ref}
      className="absolute rounded-full pointer-events-none transition-opacity duration-200"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: size * 2,
        height: size * 2,
        background: color,
        opacity,
        filter: `blur(${mode === 'ender' ? 0.5 : 1.2}px)`,
        boxShadow: `0 0 ${size * 1.5}px ${color}`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

export default function FloatingOrganisms({ debtProgress = 0 }) {
  const { mode } = useAmbientSoundContext();
  
  // More organisms as debt decreases (gamification: progress = more life)
  const baseOrganismCount = 4 + Math.floor(debtProgress * 0.05); // max ~9 at 100% progress
  const isVisible = mode !== 'off';

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden opacity-50 mix-blend-screen"
      style={{ zIndex: 5, transition: 'opacity 0.6s ease' }}
    >
      {isVisible && Array.from({ length: baseOrganismCount }).map((_, i) => (
        <Organism
          key={i}
          id={i}
          baseFreq={130.8 + i * 50}
          mode={mode}
        />
      ))}
    </div>
  );
}