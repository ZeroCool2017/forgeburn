import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShuffledQuotes } from '@/lib/loanCalculations';
import { Sparkles } from 'lucide-react';

export default function QuoteBar() {
  const [quotes] = useState(() => getShuffledQuotes());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % quotes.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [quotes]);

  const quote = quotes[index];

  return (
    <div className="relative overflow-hidden rounded-xl glass glow-purple px-6 py-4">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      <div className="flex items-start gap-3 relative">
        <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0 animate-pulse-glow" />
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-light text-foreground/80 italic leading-relaxed">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              — {quote.author}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}