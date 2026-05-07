import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/loanCalculations';

// Visualize Value-style rotating graphic panels
// Each panel is a bold, minimal data-art visual

function CompoundPanel({ totalDebt, interestSaved, months }) {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    month: i + 1,
    height: Math.min(100, ((i + 1) / 24) * 100 * (1 + (i * 0.02))),
  }));
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Compound · Month by Month</div>
      <div className="flex items-end gap-0.5 h-24 flex-1">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${b.height}%` }}
            transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
            className="flex-1 rounded-sm"
            style={{ background: `hsl(${270 + i * 3}, 70%, ${45 + i * 1.5}%)` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 font-mono">Each month of action compounds the next</p>
    </div>
  );
}

function ZeroPanel({ totalDebt, paidOff }) {
  const progress = totalDebt > 0 ? Math.min(1, paidOff / totalDebt) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Carrying the Zero</div>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(260,15%,16%)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke="hsl(270,80%,65%)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - progress) }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black font-mono text-foreground">{Math.round(progress * 100)}%</span>
          <span className="text-[10px] text-muted-foreground font-mono">to zero</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-mono">{formatCurrency(paidOff)} reclaimed</p>
    </div>
  );
}

function GridPanel({ interestSaved, months }) {
  const dots = 100;
  const filledDots = Math.max(0, Math.min(dots, Math.round((interestSaved / 50000) * dots)));
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Interest Saved · Every Dot = $500</div>
      <div className="grid grid-cols-10 gap-1 flex-1">
        {Array.from({ length: dots }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.008, duration: 0.2 }}
            className="aspect-square rounded-full"
            style={{ background: i < filledDots ? 'hsl(270,80%,65%)' : 'hsl(260,15%,18%)' }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 font-mono">{formatCurrency(interestSaved)} not paid to banks</p>
    </div>
  );
}

function TimePanel({ months }) {
  const weeks = Math.min(months * 4, 200);
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Time Reclaimed · Each Square = 1 Week</div>
      <div className="grid grid-cols-20 gap-0.5 flex-1" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
        {Array.from({ length: weeks }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.005 }}
            className="aspect-square rounded-sm"
            style={{ background: `hsl(${330 - i * 0.6}, 60%, 55%)` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2 font-mono">{months} months of freedom forged</p>
    </div>
  );
}

const PANELS = ['compound', 'zero', 'grid', 'time'];

export default function VisualizeValue({ totalDebt, totalOriginal, interestSaved, months }) {
  const [panelIndex, setPanelIndex] = useState(0);
  const paidOff = (totalOriginal || totalDebt) - totalDebt;

  useEffect(() => {
    const t = setInterval(() => setPanelIndex(p => (p + 1) % PANELS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const panel = PANELS[panelIndex];

  return (
    <div className="glass rounded-2xl p-5 min-h-[220px] relative overflow-hidden">
      {/* Panel dots nav */}
      <div className="absolute top-3 right-3 flex gap-1">
        {PANELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setPanelIndex(i)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === panelIndex ? 'hsl(270,80%,65%)' : 'hsl(260,15%,25%)' }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={panel}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5 }}
          className="h-full"
        >
          {panel === 'compound' && <CompoundPanel totalDebt={totalDebt} interestSaved={interestSaved} months={months} />}
          {panel === 'zero' && <ZeroPanel totalDebt={totalOriginal || totalDebt} paidOff={paidOff} />}
          {panel === 'grid' && <GridPanel interestSaved={interestSaved} months={months} />}
          {panel === 'time' && <TimePanel months={months} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}