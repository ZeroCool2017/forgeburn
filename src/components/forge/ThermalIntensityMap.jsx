import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_CONFIG, formatCurrency } from '@/lib/loanCalculations';
import { useAmbientSound } from '@/hooks/useAmbientSound';

/**
 * ThermalIntensityMap — visualizes loan paydown as forge heat.
 * Brighter glow = closer to zero = hotter in the forge.
 * Each loan is a thermal cell with animated patterns and rhythmic pulses.
 */

function ThermalCell({ loan, index }) {
  const original = loan.original_balance || loan.current_balance;
  const progress = Math.max(0, Math.min(1, 1 - (loan.current_balance / original)));
  
  // Heat intensity: 0 (cold) → 1 (burning hot at zero)
  const heatIntensity = progress;
  
  // Color range: cool blue → warm orange → burning red
  let baseHue = 200 - (heatIntensity * 160); // 200 (blue) → 40 (red)
  let saturation = 40 + (heatIntensity * 50); // 40% → 90%
  let lightness = 50 - (heatIntensity * 15); // 50% → 35% (darker = hotter)
  
  const thermalColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  const glowColor = `hsl(${baseHue}, ${saturation}%, ${lightness + 20}%)`;
  
  const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
  
  // Random but deterministic pattern seed based on loan id
  const seed = loan.id.charCodeAt(0) + index;
  const randomDelay = (seed % 1000) / 1000;
  const randomDuration = 2 + ((seed * 7) % 1000) / 1000;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="relative flex flex-col items-center gap-2.5"
    >
      {/* Outer pulsing rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="absolute rounded-full border"
          style={{ borderColor: glowColor }}
          animate={{
            width: ['56px', '72px', '56px'],
            height: ['56px', '72px', '56px'],
            opacity: [0.6, 0.1, 0.6],
          }}
          transition={{
            duration: randomDuration,
            delay: randomDelay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute rounded-full border-2"
          style={{ borderColor: glowColor }}
          animate={{
            width: ['48px', '88px', '48px'],
            height: ['48px', '88px', '48px'],
            opacity: [0.3, 0.05, 0.3],
          }}
          transition={{
            duration: randomDuration + 0.5,
            delay: randomDelay + 0.2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Main thermal cell */}
      <motion.div
        className="relative w-28 h-28 rounded-xl flex items-center justify-center overflow-hidden border-2 z-10"
        style={{
          background: thermalColor,
          borderColor: glowColor,
          boxShadow: `0 0 ${20 + heatIntensity * 32}px ${glowColor}66, inset 0 0 16px ${glowColor}44`
        }}
        animate={{
          scale: [1, 1.04, 0.98, 1],
        }}
        transition={{
          duration: randomDuration + 0.3,
          delay: randomDelay,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `repeating-linear-gradient(
              ${45 + (seed * 3) % 90}deg,
              transparent,
              transparent 2px,
              ${glowColor}15 2px,
              ${glowColor}15 4px
            )`,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: randomDuration * 2,
            delay: randomDelay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: randomDuration * 0.8,
              delay: randomDelay,
              repeat: Infinity,
            }}
          >
            ⛓️
          </motion.span>
          <motion.span
            className="text-[10px] font-mono font-black text-white uppercase tracking-wide"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{
              duration: randomDuration * 1.2,
              delay: randomDelay + 0.1,
              repeat: Infinity,
            }}
          >
            {heatIntensity < 0.25 ? 'heat' : heatIntensity < 0.5 ? 'forge' : heatIntensity < 0.75 ? 'strike' : 'break'}
          </motion.span>
        </div>
      </motion.div>
      
      {/* Labels */}
      <div className="text-center">
        <p className="text-xs font-mono font-bold text-foreground">{loan.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatCurrency(loan.current_balance)}
        </p>
      </div>
    </motion.div>
  );
}

export default function ThermalIntensityMap({ loans }) {
  if (!loans?.length) return null;
  
  // Sort by heat intensity (closest to zero = hottest)
  const sorted = [...loans].sort((a, b) => {
    const origA = a.original_balance || a.current_balance;
    const origB = b.original_balance || b.current_balance;
    const progressA = 1 - (a.current_balance / origA);
    const progressB = 1 - (b.current_balance / origB);
    return progressB - progressA; // hottest first
  });

  const maxProgress = Math.max(...sorted.map(l => 1 - (l.current_balance / (l.original_balance || l.current_balance))));
  const avgTemp = Math.round((maxProgress / 1) * 100);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5">Thermal Intensity</p>
          <h3 className="text-sm font-semibold text-foreground">Forge Heat Map</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-muted-foreground">avg temp</p>
          <p className="text-lg font-black font-mono" style={{ color: `hsl(${200 - (avgTemp / 100) * 160}, 60%, 50%)` }}>
            {avgTemp}°
          </p>
        </div>
      </div>

      {/* Thermal gradient legend */}
      <div className="mb-4 pb-3 border-b border-border/20">
        <div className="flex items-center justify-between gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => {
            const hue = 200 - (intensity * 160);
            return (
              <div
                key={i}
                className="flex-1 h-2 rounded-full"
                style={{ background: `hsl(${hue}, 70%, 50%)` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground/50 mt-1">
          <span>cold</span>
          <span>heat</span>
        </div>
      </div>

      {/* Thermal cells grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {sorted.map((loan, idx) => (
          <ThermalCell key={loan.id} loan={loan} index={idx} />
        ))}
      </div>

      {/* Systems insight */}
      <div className="mt-4 pt-3 border-t border-border/20">
        <p className="text-[10px] font-mono text-muted-foreground/70 italic">
          🔥 Hotter cells = closer to zero. The forge heats your chains until they break.
        </p>
      </div>
    </div>
  );
}