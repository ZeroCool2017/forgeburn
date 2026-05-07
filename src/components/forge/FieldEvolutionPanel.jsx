import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronDown } from 'lucide-react';

/**
 * Machine learning-informed field evolution.
 * Tracks patterns over time and generates increasingly profound psychological insights.
 * Stores historical insights to train deeper understanding.
 */

export default function FieldEvolutionPanel({ habits, loans, refreshInterval = 20 * 60000 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [evolution, setEvolution] = useState(null);
  const [previousInsights, setPreviousInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const generateEvolution = async () => {
      setLoading(true);
      try {
        const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
        const totalOriginal = loans.reduce((s, l) => s + (l.original_balance || l.current_balance), 0);
        const payoffProgress = totalOriginal > 0 ? (totalOriginal - totalDebt) / totalOriginal : 0;
        
        const habitPatterns = habits.map(h => ({
          name: h.name,
          pattern: h.pattern,
          frequency: h.frequency,
          monthly: h.monthly_average,
        }));

        const historicalContext = previousInsights.slice(-3).map((i, idx) => `[Gen ${idx}]: ${i}`).join('\n');

        const prompt = `Reflect on what's changing in how this person understands themselves through their financial choices.

CURRENT DATA:
- Debt repaid: ${Math.round(payoffProgress * 100)}%
- Habits: ${habits.map(h => h.name).join(', ')}
- Observation: Generation ${generation}

${previousInsights.length > 0 ? `PREVIOUS REALIZATIONS:\n${historicalContext}` : ''}

Generate a 2-3 sentence insight that:
1. Shows what they might be learning about themselves as they progress
2. Connect their choices to what they actually want, not what they think they should want
3. Sound like watching someone slowly understand their own pattern
4. Be gentle but honest
5. If generation > 1: reference how their thinking seems to be evolving

Make it feel like patient observation, not analysis.
Write ONLY the insight, nothing else.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
        });
        
        setEvolution(result);
        setPreviousInsights(prev => [...prev, result].slice(-5)); // Keep last 5 for context
        setGeneration(g => g + 1);
      } catch (error) {
        console.error('Failed to generate evolution:', error);
        setEvolution('The field learns. You learn. The distance between narrows.');
      } finally {
        setLoading(false);
      }
    };

    generateEvolution();
    const interval = setInterval(generateEvolution, refreshInterval);
    return () => clearInterval(interval);
  }, [habits, loans, refreshInterval, generation, previousInsights]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-primary/20"
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 mb-0"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-lg">🧬</span>
          </motion.div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">FIELD EVOLUTION</h3>
            <p className="text-[9px] font-mono text-muted-foreground/60">Machine learning insights</p>
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
            className="mt-4 pt-4 border-t border-border/20 space-y-4"
          >
            {/* Current evolution */}
            <div>
              <p className="text-[10px] font-mono text-primary/70 uppercase tracking-wider mb-2">Current Realization</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                  />
                  <p className="text-xs text-muted-foreground/70">Learning...</p>
                </div>
              ) : (
                <motion.p
                  key={generation}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-foreground/85 leading-relaxed italic"
                >
                  {evolution}
                </motion.p>
              )}
            </div>

            {/* Historical insights */}
            {previousInsights.length > 1 && (
              <div>
                <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider mb-2">Evolution History</p>
                <div className="space-y-2">
                  {previousInsights.slice(0, -1).reverse().map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-foreground/60 italic p-2 rounded-lg bg-background/30 border border-border/10"
                    >
                      {insight.substring(0, 100)}...
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <p className="text-[9px] font-mono text-muted-foreground/50 pt-3 border-t border-border/10">
              Generation #{generation} · Updates every {Math.round(refreshInterval / 60000)} min · Learning from your behavior
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}