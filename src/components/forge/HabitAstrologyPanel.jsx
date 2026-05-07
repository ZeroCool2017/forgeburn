import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown } from 'lucide-react';
import { analyzeHabitVsChart, ELEMENT_TRAITS, habitToAstrologyMetaphor } from '@/lib/habitAstrology';

/**
 * Shows how spending habits align/misalign with birth chart.
 * Educational, subtle—mostly helps users see their own patterns reflected.
 */

export default function HabitAstrologyPanel({ birthData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
  });

  if (!birthData || !habits.length) return null;

  const analysis = analyzeHabitVsChart(habits, birthData);
  if (!analysis) return null;

  const chartElemTrait = ELEMENT_TRAITS[analysis.chartElement];
  const habitElemTrait = ELEMENT_TRAITS[analysis.habitElement];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="glass rounded-2xl p-5"
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 mb-0"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-accent animate-pulse-glow" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">HABIT ASTROLOGY</h3>
            <p className="text-[10px] font-mono text-muted-foreground/60">How your chart explains your spending</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 pt-4 border-t border-border/20"
          >
            {/* Element alignment */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-accent/70 uppercase tracking-wider">Element Alignment</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 border border-border/20 bg-background/30">
                  <p className="text-[9px] font-mono text-muted-foreground/70 mb-1">Your Chart</p>
                  <p className="text-sm font-semibold text-foreground mb-1">{chartElemTrait.label}</p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight">{chartElemTrait.traits}</p>
                </div>
                <div className="rounded-lg p-3 border border-border/20 bg-background/30">
                  <p className="text-[9px] font-mono text-muted-foreground/70 mb-1">Your Habits</p>
                  <p className="text-sm font-semibold text-foreground mb-1">{habitElemTrait.label}</p>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight">{habitElemTrait.traits}</p>
                </div>
              </div>

              {/* Alignment status */}
              <div className={`rounded-lg p-3 border ${analysis.isAligned ? 'border-green-500/30 bg-green-500/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                <p className="text-[10px] font-mono text-muted-foreground/70 mb-1">ALIGNMENT</p>
                <p className={`text-sm font-medium ${analysis.isAligned ? 'text-green-500' : 'text-blue-400'}`}>
                  {analysis.isAligned ? 'Harmonious' : 'Educational'}
                </p>
              </div>
            </div>

            {/* Main insight */}
            <div className="rounded-lg p-3 bg-accent/8 border border-accent/20">
              <p className="text-xs text-foreground/85 leading-relaxed italic">
                {analysis.insight}
              </p>
            </div>

            {/* Habit metaphors */}
            {habits.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">What Each Habit Teaches</p>
                <div className="space-y-1.5">
                  {habits.map(habit => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-2 rounded-lg bg-background/50 border border-border/10"
                    >
                      <span className="text-sm mt-0.5">{habit.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-muted-foreground/70">{habit.name}</p>
                        <p className="text-[10px] text-foreground/70 italic mt-0.5">
                          {habitToAstrologyMetaphor(habit.pattern)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing note */}
            <div className="text-[9px] text-muted-foreground/60 italic border-t border-border/10 pt-3">
              Astrology isn't prediction—it's a language for understanding yourself. Your chart explains why you spend the way you do.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}