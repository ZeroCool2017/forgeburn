import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playHarmonicNote, playMusicalCascade } from '@/lib/musicalInterface';

/**
 * Interactive heatmap — click cells to play harmonious notes
 * Visual feedback + musical feedback creates an immersive exploration
 */

export default function InteractiveHeatmap({ schedule, title = 'Interactive Heatmap' }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [clickedCell, setClickedCell] = useState(null);

  if (!schedule?.length) return null;

  // Build 12-month grid (4 rows × 3 cols)
  const months = schedule.slice(0, 12);
  const maxValue = Math.max(...months.map(m => m.totalInterest || 0));

  const handleCellClick = (monthIndex, value) => {
    setClickedCell(monthIndex);
    // Play note based on normalized value (0-1)
    const normalized = value / (maxValue || 1);
    const noteIndex = Math.floor(normalized * 7); // 8 pentatonic notes
    playHarmonicNote(noteIndex, 0.6);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">Click cells to explore the rhythm of your interest costs</p>
      </div>

      <div className="space-y-2">
        {/* Grid of months */}
        <div className="grid grid-cols-3 gap-1.5">
          {months.map((month, idx) => {
            const value = month.totalInterest || 0;
            const normalized = value / (maxValue || 1);
            const intensity = Math.max(0.1, normalized);

            return (
              <motion.button
                key={idx}
                onClick={() => handleCellClick(idx, value)}
                onHoverStart={() => setHoveredCell(idx)}
                onHoverEnd={() => setHoveredCell(null)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all"
                style={{
                  background: `hsl(270, 80%, ${85 - intensity * 60}%)`,
                  border: clickedCell === idx ? '2px solid hsl(180, 60%, 55%)' : '1px solid hsl(260, 15%, 25%)',
                }}
              >
                {/* Cell content */}
                <div className="flex flex-col items-center justify-center h-full gap-1 p-1">
                  <p className="text-[10px] font-mono text-foreground/70 font-semibold">
                    M{month.month}
                  </p>
                  <p className="text-[9px] text-foreground/60">
                    ${(value / 100).toFixed(0)}
                  </p>
                </div>

                {/* Hover glow */}
                {hoveredCell === idx && (
                  <motion.div
                    layoutId="glow"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: 'radial-gradient(circle, hsl(180, 60%, 55%, 0.3), transparent 70%)',
                      boxShadow: '0 0 12px hsl(180, 60%, 55%, 0.4)',
                    }}
                  />
                )}

                {/* Click indicator */}
                {clickedCell === idx && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 rounded-lg border-2 border-current"
                    style={{ borderColor: 'hsl(180, 60%, 55%)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground/70">
          <p>Low interest</p>
          <div className="flex gap-1">
            {[0, 0.3, 0.6, 1].map(val => (
              <div
                key={val}
                className="w-4 h-4 rounded"
                style={{ background: `hsl(270, 80%, ${85 - val * 60}%)` }}
              />
            ))}
          </div>
          <p>High interest</p>
        </div>
      </div>

      {/* Interaction hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="text-[9px] text-muted-foreground/50 italic mt-3 text-center"
      >
        Each cell sings. Listen to the melody of your interest costs.
      </motion.p>
    </motion.div>
  );
}