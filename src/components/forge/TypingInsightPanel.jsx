import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';

/**
 * Grounded psychological insight about spending patterns.
 * Types out once on load and stays there.
 */

export default function TypingInsightPanel({ habits, loans }) {
  const [displayedText, setDisplayedText] = useState('');
  const [fullInsight, setFullInsight] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Generate insight once on mount
  useEffect(() => {
    const generateInsight = async () => {
      setIsTyping(true);
      setDisplayedText('');
      
      try {
        const habitSummary = habits.map(h => `• ${h.name}: $${h.monthly_average}/mo (${h.pattern})`).join('\n');
        const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
        const payoffProgress = loans.length ? 1 - (totalDebt / loans.reduce((s, l) => s + (l.original_balance || l.current_balance), 0)) : 0;

        const prompt = `Reflect on what these spending patterns reveal about how this person relates to themselves, their time, and what they value most.

HABITS:
${habitSummary}

Debt repaid: ${Math.round(payoffProgress * 100)}%

Write 2-3 sentences that:
- Identify what this person seems to be seeking or protecting through these choices
- Show the logic behind their spending (not judgment, understanding)
- Sound like quiet realization, something they already sensed but never put into words
- Be thoughtful and true

Write ONLY the insight, nothing else.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
        });
        
        setFullInsight(result);
      } catch (error) {
        console.error('Failed to generate insight:', error);
        setFullInsight('Your spending patterns reveal what you need. Understanding why is the first step.');
      }
    };

    if (habits.length > 0) {
      generateInsight();
    }
  }, []);

  // Typing animation (slow)
  useEffect(() => {
    if (!fullInsight) return;

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < fullInsight.length) {
        setDisplayedText(fullInsight.substring(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 80); // Contemplative pace

    return () => clearInterval(typeInterval);
  }, [fullInsight]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5 border border-accent/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-accent" />
        </motion.div>
        <h3 className="text-sm font-semibold text-foreground">YOUR PATTERNS</h3>
        {isTyping && (
          <motion.span
            animate={{ opacity: [0.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-1.5 h-4 bg-accent rounded-sm ml-auto"
          />
        )}
      </div>

      <p className="text-sm text-foreground/85 leading-relaxed min-h-12">
        {displayedText}
        {isTyping && <span className="animate-pulse">▌</span>}
      </p>
    </motion.div>
  );
}