import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/localDB';
import { playElectroplantonTone } from '@/lib/musicalInterface';
import HeatmapNoteModal from './HeatmapNoteModal';

export default function InteractiveHeatmap({ schedule, title = 'Interactive Interest Map', habitImpact = 0 }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [selectedNote, setSelectedNote] = useState('');
  const [notes, setNotes] = useState({});

  // Load saved notes on mount
  useEffect(() => {
    db.notes.toArray().then(all => {
      const byMonth = {};
      all.forEach(n => { byMonth[n.month] = n; });
      setNotes(byMonth);
    });
  }, []);

  const refreshNotes = useCallback(async () => {
    const all = await db.notes.toArray();
    const byMonth = {};
    all.forEach(n => { byMonth[n.month] = n; });
    setNotes(byMonth);
  }, []);

  const handleSaveNote = useCallback(async (data) => {
    const monthKey = `M${data.month}`;
    await db.notes.put({
      month: monthKey,
      note: data.note,
      interest: data.interest,
      created_at: new Date().toISOString(),
    });
    await refreshNotes();
    setSelectedMonth(null);
    setSelectedInterest(null);
    setSelectedNote('');
  }, [refreshNotes]);

  const handleDeleteNote = useCallback(async (month) => {
    const monthKey = `M${month}`;
    await db.notes.where('month').equals(monthKey).delete();
    await refreshNotes();
    setSelectedMonth(null);
    setSelectedInterest(null);
    setSelectedNote('');
  }, [refreshNotes]);

  if (!schedule?.length) return null;

  const showHabitNote = habitImpact > 0;
  const months = schedule.slice(0, 12);
  const maxValue = Math.max(...months.map(m => m.totalInterest || 0));
  const minValue = Math.min(...months.map(m => m.totalInterest || 0));

  const handleCellClick = (monthIndex, value) => {
    const monthLabel = `M${monthIndex + 1}`;
    const existing = notes[monthLabel];
    setSelectedMonth(monthIndex + 1);
    setSelectedInterest(value);
    setSelectedNote(existing ? existing.note : '');

    const normalized = (value - minValue) / (maxValue - minValue || 1);
    playElectroplantonTone(normalized, 0.8);
    if (navigator.vibrate) navigator.vibrate(40);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-3"
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
        <p className="text-[10px] text-muted-foreground/70">Click any month to explore and record your financial observations.</p>
        {showHabitNote && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-primary/80 mt-2 border-l border-primary/40 pl-2"
          >
            Your spending habits are reducing available budget — manage them to free up extra payoff power.
          </motion.p>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-1">
          {months.map((month, idx) => {
            const value = month.totalInterest || 0;
            const normalized = maxValue > 0 ? (value - minValue) / (maxValue - minValue) : 0;
            const hue = 270 - (normalized * 120);
            const saturation = 60 + (normalized * 30);
            const lightness = 55 - (normalized * 25);
            const hasNote = notes[`M${idx + 1}`];

            return (
              <motion.button
                key={idx}
                onClick={() => handleCellClick(idx, value)}
                onHoverStart={() => {
                  setHoveredCell(idx);
                  const n = (value - minValue) / (maxValue - minValue || 1);
                  playElectroplantonTone(n, 0.5);
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
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 bg-black/15 group-hover:bg-black/30 transition-colors">
                  <p className="text-[11px] font-mono font-bold text-white drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.85)]">M{month.month}</p>
                  <p className="text-[9px] font-mono font-bold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">${value.toFixed(0)}</p>
                </div>

                {/* Note indicator dot */}
                {hasNote && (
                  <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
                )}

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

        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground/70">
          <p className="font-mono text-xs text-indigo-400">Low Drag</p>
          <div className="flex-1 mx-2 h-1.5 rounded-full overflow-hidden"
            style={{
              background: `linear-gradient(90deg, hsl(270, 60%, 55%), hsl(200, 70%, 50%), hsl(150, 60%, 50%), hsl(30, 80%, 50%), hsl(0, 90%, 50%))`
            }}
          />
          <p className="font-mono text-xs text-rose-500">High Interest</p>
        </div>

        {/* Clear Explanation Legend */}
        <div className="mt-4 border-t border-border/10 pt-3 text-[11px] leading-relaxed text-muted-foreground/80 space-y-1.5">
          <p>
            This grid maps the <span className="font-medium text-foreground">thermal decay of interest</span> across your next 12 months.
          </p>
          <p>
            <span className="text-rose-400 font-medium">Warm, intense squares</span> show months of heavy interest drag where your money pays for time, not freedom. <span className="text-indigo-400 font-medium">Cooler, deep purple squares</span> show the interest cooling down as your monthly contributions successfully break the principal balances.
          </p>
          <p className="text-[10px] italic text-muted-foreground/60">
            Hover or tap any square to hear the frequency of interest and record observations about that phase of your journey.
          </p>
        </div>
      </div>

      <HeatmapNoteModal
        month={selectedMonth}
        interest={selectedInterest || 0}
        existingNote={selectedNote}
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </motion.div>
  );
}
