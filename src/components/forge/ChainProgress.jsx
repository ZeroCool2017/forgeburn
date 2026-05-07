import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG, estimatePayoffDate } from '@/lib/loanCalculations';
import { Link2Off, Link2, Zap, MoreHorizontal, Trash2 } from 'lucide-react';
import { useForgeSound } from '@/hooks/useForgeSound';

// Dot-grid canvas that draws the payoff connection line from current balance → zero
function PayoffCanvas({ progress, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw dot grid
    ctx.fillStyle = 'rgba(140,100,240,0.06)';
    const spacing = 10;
    for (let x = spacing; x < W; x += spacing) {
      for (let y = spacing; y < H; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw the trajectory path: a smooth curve from current balance (left, high) → zero (right, bottom)
    const startX = 4;
    const startY = H - 4 - (progress * (H - 12)); // already-paid portion lifts the start
    const endX = W - 4;
    const endY = H - 4; // zero is always at the bottom-right

    // Remaining balance line (from current position → zero)
    const cp1x = startX + (endX - startX) * 0.35;
    const cp1y = startY;
    const cp2x = startX + (endX - startX) * 0.65;
    const cp2y = endY;

    // Glow under-line (paid portion) — from origin to current
    const originY = H - 4;
    ctx.beginPath();
    ctx.moveTo(4, originY);
    ctx.lineTo(startX, startY);
    ctx.strokeStyle = color + '40';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Main remaining path
    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    grad.addColorStop(0, color + 'cc');
    grad.addColorStop(1, color + '33');
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current balance dot
    ctx.beginPath();
    ctx.arc(startX, startY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Zero target dot (hollow ring)
    ctx.beginPath();
    ctx.arc(endX, endY, 3.5, 0, Math.PI * 2);
    ctx.strokeStyle = color + '88';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Zero label
    ctx.font = '8px monospace';
    ctx.fillStyle = color + '70';
    ctx.fillText('$0', endX - 6, endY - 6);
  }, [progress, color]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={52}
      className="w-full rounded-sm"
      style={{ display: 'block' }}
    />
  );
}

export default function ChainProgress({ loan, totalOriginal, onPay, onDelete, isShattering }) {
  const original = loan.original_balance || loan.current_balance;
  const progress = Math.max(0, Math.min(1, 1 - (loan.current_balance / original)));
  const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
  const links = 20;
  const brokenLinks = Math.floor(progress * links);
  const [menuOpen, setMenuOpen] = useState(false);
  const { playStrike } = useForgeSound();
  const { date: payoffDate } = estimatePayoffDate(loan, 0, 'momentum');
  const formatPayoffDate = (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

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
        <div className="flex items-start gap-2">
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

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Chain options"
              className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-7 z-20 glass border border-border/50 rounded-xl shadow-xl overflow-hidden min-w-[130px]"
                  >
                    <button
                      onClick={() => { setMenuOpen(false); onDelete?.(); }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete chain
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dot-grid canvas — balance → zero connection line */}
      <div className="mb-3 rounded-lg overflow-hidden border border-border/20 bg-background/30">
        <PayoffCanvas progress={progress} color={cat.color} />
      </div>

      {/* Payoff date estimate */}
      <p className="text-xs font-mono text-muted-foreground mb-3 tracking-widest">
        free by {formatPayoffDate(payoffDate)}
      </p>

      {/* Chain link visualization */}
      <div className="flex items-center gap-0.5 mb-3">
        {Array.from({ length: links }).map((_, i) => {
          const isBroken = i < brokenLinks;
          const isNewlyBroken = isShattering && i === brokenLinks - 1;
          return (
            <motion.div
              key={i}
              animate={
                isNewlyBroken
                  ? { scaleY: [1, 0.6, 1.1, 0.4], opacity: [1, 1, 0.6, 0] }
                  : { opacity: isBroken ? 0.2 : 1, scaleY: isBroken ? 0.6 : 1 }
              }
              transition={isNewlyBroken ? { duration: 0.4, times: [0, 0.2, 0.5, 1], ease: [0.34, 1.56, 0.64, 1] } : { duration: 0.15 }}
              className="flex-1 h-1.5 rounded-full relative overflow-hidden"
              style={{
                background: isBroken
                  ? 'hsl(var(--muted))'
                  : `linear-gradient(90deg, ${cat.color}88, ${cat.color})`,
              }}
            >
              {isBroken && (
                <div className="absolute inset-0 opacity-40"
                  style={{
                    background: `repeating-linear-gradient(
                      45deg,
                      ${cat.color}30,
                      ${cat.color}30 1px,
                      transparent 1px,
                      transparent 3px
                    )`,
                  }}
                />
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

        {onPay && (
          <button
            onClick={() => { playStrike(); onPay?.(); }}
            className="flex items-center gap-1 text-xs font-semibold font-mono px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all"
          >
            <Zap className="w-3 h-3" />
            Strike
          </button>
        )}
      </div>
    </motion.div>
  );
}