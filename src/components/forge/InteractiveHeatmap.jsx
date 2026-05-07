import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playElectroplantonTone } from '@/lib/musicalInterface';
import HeatmapNoteModal from './HeatmapNoteModal';

/**
 * Interactive interest heatmap — beautiful gradient grid.
 * Click cells to open note modal + trigger synth chords.
 * Gradient: purple (low) → red (high interest).
 */

export default function InteractiveHeatmap({ schedule, title = 'Interactive Interest Map' }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);

  if (!schedule?.length) return null;

  const months = schedule.slice(0, 12);
  const maxValue = Math.max(...months.map(m => m.totalInterest || 0));
  const minValue = Math.min(...months.map(m => m.totalInterest || 0));

  const handleCellHover = (monthIndex, value) => {
    // Hover triggers a subtle electroplankton shimmer
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    playElectroplantonTone(normalized, 0.5);
  };

  const handleCellClick = (monthIndex, value) => {
    // Open modal for this month
    setSelectedMonth(months[monthIndex].month);
    setSelectedInterest(value);

    // Click plays richer, longer electroplankton tone
    const normalized = (value - minValue) / (maxValue - minValue || 1);
    playElectroplantonTone(normalized, 0.8);
    
    if (navigator.vibrate) navigator.vibrate(40);
  };

  const handleSaveNote = (data) => {
    // In a real app, save to database
    console.log('Note saved:', data);
    setSelectedMonth(null);
    setSelectedInterest(null);
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
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground/70">Click any month to explore and record your financial observations.</p>
      </div>

      <div className="space-y-3">
        {/* 12-month grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
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
                onHoverStart={() => {
                  setHoveredCell(idx);
                  handleCellHover(idx, value);
                }}
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
                  <p className="text-[9px] font-mono font-bold text-white/90">
                    M{month.month}
                  </p>
                  <p className="text-[7px] text-white/70 font-semibold">
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

      </div>

      {/* Note modal */}
      <HeatmapNoteModal
        month={selectedMonth}
        interest={selectedInterest || 0}
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        onSave={handleSaveNote}
      />
    </motion.div>
  );
}