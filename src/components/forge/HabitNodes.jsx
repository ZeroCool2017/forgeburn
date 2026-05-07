import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import HabitInsightModal from './HabitInsightModal';

/**
 * Renders clickable habit nodes that integrate with the Momentum Field.
 * Shows spending patterns and insights as interactive nodes.
 */

export default function HabitNodes({ disabled = false }) {
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
    enabled: !disabled,
  });

  if (!habits.length || disabled) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {habits.map(habit => (
          <motion.button
            key={habit.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedHabit(habit);
              setModalOpen(true);
            }}
            className="relative group rounded-lg p-3 border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-all"
            style={{ borderColor: habit.color + '40', backgroundColor: habit.color + '08' }}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{habit.emoji}</span>
              <p className="text-xs font-semibold text-foreground text-center line-clamp-2">
                {habit.name}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground/70">
                ${habit.monthly_average.toFixed(0)}/mo
              </p>
            </div>

            {/* Hover glow effect */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity blur-md pointer-events-none"
              style={{ background: habit.color + '20' }}
            />
          </motion.button>
        ))}
      </div>

      <HabitInsightModal
        habit={selectedHabit}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}