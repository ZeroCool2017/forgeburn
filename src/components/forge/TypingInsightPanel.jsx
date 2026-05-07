import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';

/**
 * Real-time typing insights about spending habits.
 * Updates every interval with evolving realizations about your money psychology.
 */

export default function TypingInsightPanel({ habits, loans, refreshInterval = 8 * 60000 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [fullInsight, setFullInsight] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generation, setGeneration] = useState(0);

  // Generate new insight
  useEffect(() => {
    const generateNewInsight = async () => {
      setIsTyping(true);
      setDisplayedText('');
      
      try {
        const habitSummary = habits.map(h => `• ${h.emoji} ${h.name}: $${h.monthly_average}/mo (${h.pattern})`).join('\n');
        const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
        const payoffProgress = loans.length ? 1 - (totalDebt / loans.reduce((s, l) => s + (l.original_balance || l.current_balance), 0)) : 0;

        const prompt = `You are a psychological observer of human spending behavior. Generate a SHORT (1-2 sentences), PROFOUND insight about what this person's spending patterns reveal about their deeper relationship with money, security, pleasure, or identity.

HABITS:
${habitSummary}

Progress paid off: ${Math.round(payoffProgress * 100)}%
Insight generation #${generation + 1}

Make each insight:
- Feel like a realization they're having mid-thought
- Connect a specific habit to a psychological/emotional truth
- Sound like you're reading their subconscious
- Be progressively deeper as generation increases (early: surface psychology, later: existential truths)
- Include irony or gentle paradox
- Be 1-2 sentences max

Write ONLY the insight, nothing else.`;

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
        });
        
        setFullInsight(result);
      } catch (error) {
        console.error('Failed to generate insight:', error);
        setFullInsight('Every purchase is a conversation with your future self.');
      }
    };

    generateNewInsight();
    const interval = setInterval(generateNewInsight, refreshInterval);
    return () => clearInterval(interval);
  }, [habits, loans, generation, refreshInterval]);

  // Typing animation
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
        setGeneration(g => g + 1);
      }
    }, 25); // Typing speed

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

      <p className="text-[9px] font-mono text-muted-foreground/50 mt-4 pt-3 border-t border-border/20">
        Updates every {Math.round(refreshInterval / 60000)} min · Generation #{generation}
      </p>
    </motion.div>
  );
}