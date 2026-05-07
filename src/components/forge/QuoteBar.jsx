import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActiveQuotes } from '@/lib/quoteStore';
import { Sparkles } from 'lucide-react';

export default function QuoteBar() {
  const [quotes] = useState(() => getAllActiveQuotes());
  const [index, setIndex] = useState(Math.floor(Math.random() * quotes.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % Math.max(1, quotes.length));
    }, 14000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const quote = quotes[index];

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm">
      {/* Left callout accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary/60 via-primary/30 to-transparent rounded-l-xl" />
      <div className="pl-6 pr-5 py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 animate-pulse-glow" />
          <div className="flex-1 min-w-0">
            <p className="obs-label mb-2">note</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45 }}
              >
                <p className="text-sm font-display italic text-foreground/85 leading-relaxed">
                  "{quote.text}"
                </p>
                <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                  — {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}