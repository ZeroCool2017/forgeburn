import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Sparkles, Loader2 } from 'lucide-react';

/**
 * Deep philosophical insights about habit-debt relationships.
 * Generates AI reflections on what patterns reveal about values and choices.
 */

export default function MindMapInsights({ loans, habits, onClose }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsight();
  }, [loans, habits]);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
      const totalHabitSpending = habits.reduce((s, h) => s + (h.monthly_average || 0), 0);
      
      const habitsList = habits.map(h => `${h.emoji} ${h.name} ($${h.monthly_average}/mo, ${h.pattern})`).join('\n');
      const loansList = loans.map(l => `⛓️ ${l.name} ($${l.current_balance})`).join('\n');

      const prompt = `You are a contemplative financial philosopher analyzing a person's debt and spending patterns. Generate a SHORT but DEEPLY INSIGHTFUL reflection on what these patterns reveal about their values, psychology, and what they're learning through this debt payoff journey.

THEIR DEBT LANDSCAPE:
${loansList}

THEIR SPENDING PATTERNS:
${habitsList}

Write a single profound paragraph (3-4 sentences) that:
1. Reveals something true about the psychological/spiritual meaning of their spending choices
2. Shows how their habits and debt are CONNECTED (not separate)
3. Offers a gentle philosophical reframe that validates their struggle while deepening understanding
4. Speaks to what they're learning about themselves through this process

Be poetic, wise, and genuinely helpful. Sound like you're reading their financial psychology with compassion.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
      });
      
      setInsight(result);
    } catch (error) {
      console.error('Failed to generate insight:', error);
      setInsight('Your patterns hold wisdom. Each choice reveals what you truly value. Debt is simply deferred self-knowledge.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 glass rounded-2xl p-5 border border-primary/30 z-40"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
            <h3 className="text-sm font-semibold text-foreground">FIELD INSIGHT</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
            />
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-foreground/85 leading-relaxed italic"
          >
            {insight}
          </motion.p>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[9px] font-mono text-muted-foreground/60 mt-4 pt-3 border-t border-border/20"
        >
          The field learns from your patterns. You learn from the field. This is the feedback loop of growth.
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}