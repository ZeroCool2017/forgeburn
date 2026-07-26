import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Particle types
function Particles({ type, color }) {
  const count = type === 'shatter' ? 28 : type === 'fire' ? 20 : type === 'spark' ? 16 : 10;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const dist = 80 + Math.random() * 120;
        const size = type === 'shatter' ? 6 + Math.random() * 8 : 4 + Math.random() * 6;
        const delay = Math.random() * 0.2;
        const rad = (angle * Math.PI) / 180;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: tx, y: ty, opacity: 0, scale: 0, rotate: angle * 2 }}
            transition={{ duration: 0.9 + Math.random() * 0.4, delay, ease: [0.2, 0, 0.8, 1] }}
            className="absolute top-1/2 left-1/2 rounded-sm"
            style={{
              width: size,
              height: size * (type === 'shatter' ? 0.4 : 1),
              background: color,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: type === 'shatter' ? '2px' : '50%',
              boxShadow: `0 0 ${size * 2}px ${color}88`,
            }}
          />
        );
      })}
    </div>
  );
}

// Rank badge
function RankBadge({ rank, color }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.15 }}
      className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2"
      style={{
        background: `${color}22`,
        borderColor: color,
        color: color,
        boxShadow: `0 0 20px ${color}55`,
        fontFamily: 'var(--font-mono)',
      }}
    >
      {rank}
    </motion.div>
  );
}

export default function MilestoneOverlay({ milestone, loanName, onDismiss }) {
  // Auto-dismiss after 5s
  useEffect(() => {
    if (!milestone) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [milestone, onDismiss]);

  return (
    <AnimatePresence>
      {milestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ perspective: '800px' }}
        >
          {/* Dim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background pointer-events-auto"
            onClick={onDismiss}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateX: 20, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="relative z-10 pointer-events-auto mx-4"
            style={{ maxWidth: 360 }}
          >
            {/* Dot-grid background texture */}
            <div
              className="absolute inset-0 rounded-2xl opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(${milestone.color} 1px, transparent 1px)`,
                backgroundSize: '14px 14px',
              }}
            />

            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{ boxShadow: `0 0 60px ${milestone.color}44, 0 0 120px ${milestone.color}18` }}
            />

            {/* Particles */}
            <Particles type={milestone.particles} color={milestone.color} />

            {/* Rank badge */}
            <RankBadge rank={milestone.rank} color={milestone.color} />

            {/* Card body */}
            <div
              className="relative rounded-2xl border p-6"
              style={{
                background: 'hsl(0 0% 9%)',
                borderColor: `${milestone.color}40`,
              }}
            >
              {/* Close */}
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Icon + label */}
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                  className="text-4xl"
                >
                  {milestone.icon}
                </motion.span>
                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.2em] mb-0.5"
                    style={{ color: milestone.color, opacity: 0.7 }}
                  >
                    milestone unlocked
                  </p>
                  <h2 className="text-xl font-black text-foreground tracking-tight font-display">
                    {milestone.label}
                  </h2>
                  <p className="text-xs font-mono text-muted-foreground">{loanName} · {milestone.sub}</p>
                </div>
              </div>

              {/* Left callout accent quote */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ borderLeft: `3px solid ${milestone.color}60`, background: `${milestone.color}08`, padding: '12px 14px' }}
              >
                <p className="text-sm font-display italic text-foreground/85 leading-relaxed">
                  "{milestone.quote.text}"
                </p>
                <p className="text-[11px] font-mono text-muted-foreground mt-2">
                  — {milestone.quote.author}
                </p>
              </div>

              {/* Progress pip row */}
              <div className="flex gap-1.5 mt-4">
                {[10, 25, 50, 75, 90, 100].map(pct => {
                  const active = pct <= milestone.pct;
                  return (
                    <motion.div
                      key={pct}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.1 + pct / 400, duration: 0.3 }}
                      className="flex-1 h-1 rounded-full"
                      style={{
                        background: active ? milestone.color : 'hsl(0 0% 15%)',
                        boxShadow: active ? `0 0 6px ${milestone.color}88` : 'none',
                        transformOrigin: 'left',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1">
                {[10, 25, 50, 75, 90, 100].map(pct => (
                  <span key={pct} className="text-[8px] font-mono text-muted-foreground/40">{pct}%</span>
                ))}
              </div>

              {/* Tap to dismiss hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-center text-[10px] font-mono text-muted-foreground/30 mt-4"
              >
                tap anywhere to continue forging
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}