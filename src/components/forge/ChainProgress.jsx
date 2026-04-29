import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Link2Off, Link2 } from 'lucide-react';

export default function ChainProgress({ loan, totalOriginal }) {
  const original = loan.original_balance || loan.current_balance;
  const progress = Math.max(0, Math.min(1, 1 - (loan.current_balance / original)));
  const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
  const links = 20;
  const brokenLinks = Math.floor(progress * links);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-xl p-4 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{loan.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{loan.interest_rate}% APR</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground font-mono">{formatCurrency(loan.current_balance)}</p>
          <p className="text-xs text-muted-foreground">of {formatCurrency(original)}</p>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="flex items-center gap-0.5 mb-2">
        {Array.from({ length: links }).map((_, i) => {
          const isBroken = i < brokenLinks;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                opacity: isBroken ? 0.3 : 1,
                scale: isBroken ? 0.8 : 1,
              }}
              className="flex-1 h-2 rounded-full relative overflow-hidden"
              style={{
                background: isBroken 
                  ? 'hsl(var(--muted))' 
                  : `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
              }}
            >
              {isBroken && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-primary/20 rotate-45" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {progress > 0 ? (
            <Link2Off className="w-3 h-3 text-primary" />
          ) : (
            <Link2 className="w-3 h-3 text-muted-foreground" />
          )}
          <span className="text-xs font-mono text-muted-foreground">
            {(progress * 100).toFixed(1)}% broken
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          min: {formatCurrency(loan.minimum_payment)}/mo
        </span>
      </div>
    </motion.div>
  );
}