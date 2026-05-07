import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap } from 'lucide-react';

const PATTERN_INSIGHTS = {
  presence_over_things: {
    title: "Presence Over Things",
    theme: "Moments matter more than possessions.",
    messages: [
      "You're investing in experiences that shape who you become.",
      "Real wealth is measured in moments, not merchandise.",
      "Each choice here is a step toward intentional living."
    ]
  },
  energy_investment: {
    title: "Energy Investment",
    theme: "You fuel the things that matter.",
    messages: [
      "This is where your momentum comes from.",
      "Smart energy allocation builds lasting wealth.",
      "Every investment here compounds into freedom."
    ]
  },
  nourishment: {
    title: "Nourishment",
    theme: "Feeding what grows.",
    messages: [
      "You're caring for the foundation of everything.",
      "This pattern shows self-respect in action.",
      "Nourishing yourself is the first step to breaking chains."
    ]
  },
  momentum_building: {
    title: "Momentum Building",
    theme: "Small actions, big results.",
    messages: [
      "This is how momentum compounds.",
      "You're stacking wins toward freedom.",
      "Consistency here creates unstoppable force."
    ]
  },
  growth_exploration: {
    title: "Growth & Exploration",
    theme: "Expanding your world.",
    messages: [
      "You're investing in becoming more.",
      "Learning compounds across all areas of life.",
      "This pattern unlocks possibilities."
    ]
  },
  wellbeing_ritual: {
    title: "Wellbeing Ritual",
    theme: "Care as resistance.",
    messages: [
      "Taking care of yourself is radical freedom.",
      "This habit strengthens your resolve to escape debt.",
      "Wellness fuels the journey to zero."
    ]
  },
  learning_expansion: {
    title: "Learning & Expansion",
    theme: "Growing your capacity.",
    messages: [
      "Knowledge is the ultimate compound asset.",
      "You're investing in your future self.",
      "This habit multiplies every other advantage."
    ]
  }
};

export default function HabitInsightModal({ habit, open, onClose }) {
  const patternData = PATTERN_INSIGHTS[habit?.pattern] || PATTERN_INSIGHTS.momentum_building;
  
  return (
    <AnimatePresence>
      {open && habit && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              className="glass rounded-3xl p-8 max-w-md w-full border border-border/40 shadow-2xl relative overflow-hidden"
            >
              {/* Animated background glow */}
              <div
                className="absolute inset-0 opacity-20 blur-xl pointer-events-none"
                style={{ background: habit.color + '40' }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/60 transition-all z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Header with emoji and pattern */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 text-center"
                >
                  <div className="text-5xl mb-3">{habit.emoji}</div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{patternData.title}</h2>
                  <p className="text-sm font-mono text-muted-foreground">{patternData.theme}</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-3 mb-6"
                >
                  <div className="bg-secondary/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Flow</p>
                    <p className="text-lg font-bold text-primary">${habit.monthly_average.toFixed(0)}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Pattern</p>
                    <p className="text-lg font-bold text-accent capitalize">{habit.frequency}</p>
                  </div>
                </motion.div>

                {/* Insight Message */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/8"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {habit.insight_message || patternData.messages[0]}
                    </p>
                  </div>
                </motion.div>

                {/* Pattern Wisdom */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2 mb-6"
                >
                  {patternData.messages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>{msg}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Action */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={onClose}
                  className="w-full px-4 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/30 transition-all"
                >
                  Understood
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}