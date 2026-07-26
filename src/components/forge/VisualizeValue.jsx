import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playDataBloom, playFieldBass } from '@/lib/orchestraSound';

// Obsidian / Notion editorial style — each panel is a clean, typographic data story

function CompoundPanel({ totalDebt, interestSaved, months }) {
  const bars = Array.from({ length: 24 }, (_, i) => ({
    month: i + 1,
    height: Math.min(100, ((i + 1) / 24) * 100 * (1 + i * 0.018)),
  }));
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">The Curve</p>
          <p className="text-xl font-black text-foreground leading-none">Compound Momentum</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-muted-foreground">month {months}</p>
          <p className="text-sm font-bold font-mono text-primary">freedom</p>
        </div>
      </div>
      <div className="flex items-end gap-0.5 h-20 mb-3">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${b.height}%` }}
            transition={{ delay: i * 0.025, duration: 0.35, ease: 'easeOut' }}
            className="flex-1 rounded-sm"
            style={{ background: `hsl(${265 + i * 4}, ${60 + i * 0.8}%, ${42 + i * 1.2}%)` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-mono leading-relaxed border-t border-border/30 pt-3">
        Each extra dollar you pay today removes interest from every month that follows. The curve bends toward you.
      </p>
    </div>
  );
}

function ZeroPanel({ totalDebt, paidOff }) {
  const progress = totalDebt > 0 ? Math.min(1, paidOff / totalDebt) : 0;
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">The Distance</p>
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(260,15%,14%)" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="hsl(270,80%,65%)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ * (1 - progress) }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-mono text-foreground">{Math.round(progress * 100)}</span>
            <span className="text-[9px] text-muted-foreground font-mono tracking-widest">%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-black text-foreground leading-none mb-1">{formatCurrency(paidOff)}</p>
          <p className="text-xs text-muted-foreground font-mono mb-3">reclaimed from debt</p>
          <div className="w-full h-px bg-border/30 mb-3" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every dollar here is a dollar that no longer earns interest against you.
          </p>
        </div>
      </div>
    </div>
  );
}

function GridPanel({ interestSaved }) {
  const dotValue = Math.max(100, Math.round(interestSaved / 100) * 10 || 500);
  const dots = 100;
  const filledDots = interestSaved > 0
    ? Math.max(1, Math.min(dots, Math.round((interestSaved / (dotValue * dots)) * dots)))
    : 0;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">Interest Saved</p>
          <p className="text-xl font-black text-foreground leading-none">{formatCurrency(interestSaved)}</p>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground text-right">
          each dot<br />{formatCurrency(dotValue)}
        </p>
      </div>
      <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {Array.from({ length: dots }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.006, duration: 0.18 }}
            className="aspect-square rounded-full"
            style={{
              background: i < filledDots
                ? `hsl(${270 - i * 0.8}, 75%, 62%)`
                : 'hsl(260,12%,16%)'
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-mono border-t border-border/30 pt-2">
        Money not paid to banks is money that stays in your story.
      </p>
    </div>
  );
}

function TimePanel({ months }) {
  const cols = 13;
  const weeks = Math.min(months * 4, cols * 16);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">Time Reclaimed</p>
           <p className="text-xl font-black text-foreground leading-none">{months} months to freedom</p>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground text-right">
          each square<br />1 week
        </p>
      </div>
      <div className="grid gap-0.5 flex-1 mb-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: weeks }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.004 }}
            className="aspect-square rounded-sm"
            style={{ background: `hsl(${200 + i * 0.5}, 65%, ${48 + (i % 5) * 2}%)` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-mono border-t border-border/30 pt-2">
        Months of your life no longer owed to anyone.
      </p>
    </div>
  );
}

function StoryPanel({ totalDebt, interestSaved, months }) {
  const lines = [
    { label: 'Total to reclaim', value: formatCurrency(totalDebt), sub: 'the full weight' },
    { label: 'Interest you avoid', value: interestSaved > 0 ? formatCurrency(interestSaved) : '—', sub: 'by acting now' },
    { label: 'Months to freedom', value: `${months}`, sub: 'on current plan' },
    { label: 'System leverage', value: interestSaved > 0 ? `${Math.round((interestSaved / Math.max(1, totalDebt)) * 100)}%` : '—', sub: 'interest eliminated' },
  ];
  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">Systems View</p>
      <div className="flex-1 flex flex-col justify-center gap-4">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className="flex items-baseline justify-between border-b border-border/20 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{l.label}</p>
              <p className="text-[10px] font-mono text-muted-foreground/50 italic">{l.sub}</p>
            </div>
            <p className="text-2xl font-black font-mono text-foreground">{l.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Debt Story panel — each loan linked to a narrative sentence
function DebtStoryPanel({ loans }) {
  if (!loans?.length) return null;
  const sorted = [...loans].sort((a, b) => b.current_balance - a.current_balance);
  const totalMonthlyInterest = loans.reduce((s, l) => s + (l.current_balance * l.interest_rate / 100) / 12, 0);

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">Your Debt Story</p>
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {sorted.slice(0, 4).map((loan, i) => {
          const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
          const original = loan.original_balance || loan.current_balance;
          const pct = Math.round((1 - loan.current_balance / original) * 100);
          const monthlyInterest = (loan.current_balance * loan.interest_rate / 100) / 12;
          return (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-2.5"
            >
              <span className="text-base shrink-0 mt-0.5">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-mono font-semibold text-foreground truncate">{loan.name}</p>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{pct}% done</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-border/30 rounded-full mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: cat.color }}
                  />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {formatCurrency(monthlyInterest)}/mo in interest · {formatCurrency(loan.current_balance)} left
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="border-t border-border/20 pt-2 mt-2">
        <p className="text-[10px] font-mono text-muted-foreground">
          Combined interest drain: <span className="text-destructive font-semibold">{formatCurrency(totalMonthlyInterest)}/mo</span>
        </p>
      </div>
    </div>
  );
}

const PANELS = ['story', 'debtstory', 'zero', 'compound', 'grid', 'time'];

// Dense panels get more dwell time so readers can finish; simple ones move sooner
const PANEL_DURATIONS = {
  story: 14000,
  debtstory: 14000,
  zero: 9000,
  compound: 9000,
  grid: 8000,
  time: 8000,
};

export default function VisualizeValue({ totalDebt, totalOriginal, interestSaved, months, loans }) {
  const [panelIndex, setPanelIndex] = useState(0);
  const paidOff = (totalOriginal || totalDebt) - totalDebt;
  const { enabled } = useAmbientSoundContext();

  // Each panel reveal exhales a slow therapeutic chord — deep, layered, never loops.
  // A little Endel-style bass pulses under every story beat; deeper on the
  // contemplative narrative panels (the Tetris-Effect heartbeat of the dashboard).
  useEffect(() => {
    const panel = PANELS[panelIndex];
    playDataBloom(panelIndex / Math.max(1, PANELS.length - 1), enabled);
    playFieldBass(enabled, panel === 'story' || panel === 'debtstory' ? 0.6 : 0.3);
  }, [panelIndex, enabled]);

  useEffect(() => {
    const dur = PANEL_DURATIONS[PANELS[panelIndex]] || 10000;
    const t = setTimeout(() => {
      setPanelIndex(p => (p + 1) % PANELS.length);
    }, dur);
    return () => clearTimeout(t);
  }, [panelIndex]);

  const panel = PANELS[panelIndex];

  return (
    <div className="glass rounded-2xl p-5 min-h-[220px] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{ backgroundImage: 'radial-gradient(hsl(270,80%,65%) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

      {/* Nav dots */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
        {PANELS.map((_, i) => (
          <button
            key={i}
            onClick={() => setPanelIndex(i)}
            className="rounded-full transition-all"
            style={{
              width: i === panelIndex ? '16px' : '6px',
              height: '6px',
              background: i === panelIndex ? 'hsl(270,80%,65%)' : 'hsl(260,15%,22%)',
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          key={panel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="h-full relative z-10"
        >
          {panel === 'story'    && <StoryPanel totalDebt={totalDebt} interestSaved={interestSaved} months={months} />}
          {panel === 'compound' && <CompoundPanel totalDebt={totalDebt} interestSaved={interestSaved} months={months} />}
          {panel === 'zero'     && <ZeroPanel totalDebt={totalOriginal || totalDebt} paidOff={paidOff} />}
          {panel === 'grid'     && <GridPanel interestSaved={interestSaved} months={months} />}
          {panel === 'time'     && <TimePanel months={months} />}
          {panel === 'debtstory' && <DebtStoryPanel loans={loans} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}