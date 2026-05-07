import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playHarmonicChord } from '@/lib/musicalInterface';

/**
 * Interactive interest heatmap — beautiful gradient grid.
 * Click cells to trigger lush synth chords based on interest intensity.
 * No popups. Just pure visual + sonic exploration.
 */

const INTEREST_DESCRIPTIONS = [
  "The silent tax of time. Interest accrues whether you notice or not.",
  "Money you'll never see, paying for money you borrowed. The game's design.",
  "Each month, the bank collects their cut. Compound interest is compounding cruelty.",
  "This is the cost of impatience. Or circumstance. Or both.",
  "Interest: the penalty for needing money now instead of later.",
  "The system extracts its due. Slowly. Relentlessly.",
  "You're paying the future to own the present. The interest is the price of that trade.",
  "This month, part of your payment feeds the bank's existence, not your freedom.",
  "Interest calculates itself while you sleep. It never stops working.",
  "The mathematical expression of opportunity cost. What this money could have been.",
  "Each dollar of interest is a choice—theirs. To extract. From you.",
  "Time becomes money, and money becomes more money. The cycle spirals.",
];

export default function InteractiveHeatmap({ schedule, title = 'Interactive Interest Map' }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [descriptionIndex, setDescriptionIndex] = useState(0);

  if (!schedule?.length) return null;

  const months = schedule.slice(0, 12);
  const maxValue = Math.max(...months.map(m => m.totalInterest || 0));
  const minValue = Math.min(...months.map(m => m.totalInterest || 0));

  const handleCellClick = (monthIndex, value) => {
    // Play chord based on interest intensity (0-1)
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    
    // Map to chord types: low = minor/dark, mid = major/balanced, high = complex/rich
    let chordType = 0;
    if (normalized < 0.33) chordType = 0; // Minor
    else if (normalized < 0.66) chordType = 1; // Major
    else chordType = 2; // Augmented/complex
    
    playHarmonicChord(chordType);
    
    // Cycle description
    setDescriptionIndex((prev) => (prev + 1) % INTEREST_DESCRIPTIONS.length);
    
    // Haptic
    if (navigator.vibrate) navigator.vibrate(40);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-5"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
        <motion.p
          key={descriptionIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-foreground/75 italic leading-relaxed mb-3 h-10 flex items-center"
        >
          {INTEREST_DESCRIPTIONS[descriptionIndex]}
        </motion.p>
      </div>

      <div className="space-y-3">
        {/* 12-month grid */}
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, idx) => {
            const value = month.totalInterest || 0;
            const normalized = maxValue > 0 ? (value - minValue) / (maxValue - minValue) : 0;
            
            // Create gradient from cool (low) to warm (high)
            // Low interest: deep purple/blue → High interest: vibrant red/orange
            const hue = 270 - (normalized * 120); // Purple (270°) → Red (0°)
            const saturation = 60 + (normalized * 30); // 60% → 90%
            const lightness = 55 - (normalized * 25); // 55% → 30% (darker when more intense)

            return (
              <motion.button
                key={idx}
                onClick={() => handleCellClick(idx, value)}
                onHoverStart={() => setHoveredCell(idx)}
                onHoverEnd={() => setHoveredCell(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all"
                style={{
                  background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                  border: `1px solid hsl(${hue}, ${saturation}%, ${lightness + 20}%)`,
                }}
              >
                {/* Month label + value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                  <p className="text-[11px] font-mono font-bold text-white/90">
                    M{month.month}
                  </p>
                  <p className="text-[9px] text-white/70 font-semibold">
                    ${(value).toFixed(0)}
                  </p>
                </div>

                {/* Hover glow effect */}
                {hoveredCell === idx && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 70%)`,
                      boxShadow: `0 0 20px hsl(${hue}, ${saturation}%, ${lightness + 30}%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                {/* Click ripple */}
                {hoveredCell === idx && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 border-2 rounded-lg"
                    style={{ borderColor: `hsl(${hue}, 100%, 70%)` }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Gradient legend */}
        <div className="mt-5 flex items-center justify-between text-[10px] text-muted-foreground/70">
          <p className="font-mono text-xs">Low</p>
          <div className="flex-1 mx-3 h-2 rounded-full overflow-hidden"
            style={{
              background: `linear-gradient(90deg, hsl(270, 60%, 55%), hsl(200, 70%, 50%), hsl(150, 60%, 50%), hsl(30, 80%, 50%), hsl(0, 90%, 50%))`
            }}
          />
          <p className="font-mono text-xs">High</p>
        </div>

        {/* Interaction hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
          className="text-[9px] text-muted-foreground/60 italic mt-3 text-center"
        >
          Click any cell. The chords reveal the weight of interest.
        </motion.p>
      </div>
    </motion.div>
  );
}