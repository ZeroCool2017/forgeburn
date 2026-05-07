import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActiveQuotes } from '@/lib/quoteStore';
import { Sparkles, Zap } from 'lucide-react';

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
  const isRetro = quote?.author?.match(/(Radiohead|Pavement|Built to Spill|Sonic Youth|Daria|Clueless|Reality Bites|Winona|Moneyball|Future|Cardi|Megan|Dolly|Kacey|Jay-Z|Grime|80s|90s|arcade|Tetris|chess|video game)/i);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card/40 backdrop-blur-sm"
      style={{ borderColor: isRetro ? 'hsl(45, 90%, 60%, 0.3)' : 'hsl(270, 80%, 68%, 0.2)' }}>
      {/* Left callout accent bar — glows with heat */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ 
          background: isRetro 
            ? 'linear-gradient(to bottom, hsl(45, 90%, 60%, 0.8), hsl(45, 90%, 60%, 0.2), transparent)' 
            : 'linear-gradient(to bottom, hsl(270, 80%, 68%, 0.6), hsl(270, 80%, 68%, 0.2), transparent)' 
        }} />
      <div className="pl-6 pr-5 py-4">
        <div className="flex items-start gap-3">
          {isRetro ? (
            <Zap className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 animate-pulse-glow" />
          )}
          <div className="flex-1 min-w-0">
            <p className="obs-label mb-2">{isRetro ? '⚡ retro signal' : 'note'}</p>
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