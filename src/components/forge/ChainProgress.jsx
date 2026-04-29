import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Link2Off, Link2, Zap } from 'lucide-react';

export default function ChainProgress({ loan, totalOriginal, onPay, isShattering }) {
  const original = loan.original_balance || loan.current_balance;
  const progress = Math.max(0, Math.min(1, 1 - (loan.current_balance / original)));
  const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
  const links = 20;
  const brokenLinks = Math.floor(progress * links);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isShattering ? [1, 1.04, 0.97, 1] : 1,
      }}
      transition={isShattering ? { duration: 0.4, times: [0, 0.3, 0.7, 1] } : {}}
      className="glass rounded-xl p-4 hover:border-primary/30 transition-all group relative overflow-hidden"
    >
      {/* Shatter flash overlay */}
      {isShattering && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
          style={{ background: `radial-gradient(circle at 50% 80%, ${cat.color}55, transparent 70%)` }}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.emoji}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{loan.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{loan.interest_rate}% APR</p>
          </div>
        </div>
        <div className="text-right">
          <motion.p
            key={loan.current_balance}
            initial={isShattering ? { scale: 1.2, color: cat.color } : false}
            animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
            transition={{ duration: 0.4 }}
            className="text-sm font-bold font-mono"
          >
            {formatCurrency(loan.current_balance)}
          </motion.p>
          <p className="text-xs text-muted-foreground">of {formatCurrency(original)}</p>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="flex items-center gap-0.5 mb-3">
        {Array.from({ length: links }).map((_, i) => {
          const isBroken = i < brokenLinks;
          const isNewlyBroken = isShattering && i === brokenLinks - 1;
          return (
            <motion.div
              key={i}
              animate={
                isNewlyBroken
                  ? { scale: [1, 1.6, 0.7, 0.8], opacity: [1, 1, 0.5, 0.3] }
                  : { opacity: isBroken ? 0.3 : 1, scale: isBroken ? 0.8 : 1 }
              }
              transition={isNewlyBroken ? { duration: 0.45, times: [0, 0.25, 0.7, 1] } : {}}
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

        {/* Pay button */}
        {onPay && (
          <button
            onClick={onPay}
            className="flex items-center gap-1 text-xs font-semibold font-mono px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all opacity-0 group-hover:opacity-100"
          >
            <Zap className="w-3 h-3" />
            Strike
          </button>
        )}
      </div>
    </motion.div>
  );
}