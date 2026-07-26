// Carry the Zero — Compound Curve Widget
import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/loanCalculations';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playFieldTone } from '@/lib/orchestraSound';

/**
 * Systems-thinking widget: shows how current payment pace bends the compounding curve.
 * Three overlaid SVG paths — minimum, current pace, and "what if +$100" — plotted
 * as smooth Bézier curves in a Visualize Value aesthetic.
 */

function buildCurvePath(schedule, maxBalance, width, height) {
  if (!schedule?.length) return '';
  const pts = schedule.map((m, i) => {
    const x = (i / (schedule.length - 1)) * width;
    const y = height - (Math.max(0, m.totalBalance) / maxBalance) * height;
    return [x, y];
  });

  // Smooth Bézier through points
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1][0] + pts[i][0]) / 2;
    d += ` C ${cpx},${pts[i - 1][1]} ${cpx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
  }
  return d;
}

function buildAreaPath(curvePath, width, height) {
  return `${curvePath} L ${width},${height} L 0,${height} Z`;
}

export default function CompoundCurveWidget({ loans, schedule, minimumSchedule }) {
  const W = 420;
  const H = 120;
  const { enabled } = useAmbientSoundContext();
  const lastScrubRef = useRef(0);

  // Build a "nudge" scenario: same loans but +$100 extra — simulated inline
  const nudgeSchedule = useMemo(() => {
    if (!loans?.length) return null;
    let balances = loans.map(l => ({ ...l, balance: l.current_balance }));
    const result = [];
    let month = 0;
    while (balances.some(l => l.balance > 0.01) && month < 600) {
      month++;
      balances.forEach(loan => {
        if (loan.balance <= 0) return;
        const interest = (loan.balance * (loan.interest_rate / 100)) / 12;
        const min = Math.min(loan.minimum_payment + 100 / balances.length, loan.balance + interest);
        loan.balance = Math.max(0, loan.balance + interest - min);
      });
      result.push({ totalBalance: balances.reduce((s, l) => s + Math.max(0, l.balance), 0) });
    }
    return result;
  }, [loans]);

  const maxBalance = useMemo(() => {
    if (!minimumSchedule?.schedule?.length) return 1;
    return minimumSchedule.schedule[0]?.totalBalance || 1;
  }, [minimumSchedule]);

  // Sample to ~80 points for clean rendering
  function sample(sched) {
    if (!sched?.length) return [];
    const step = Math.max(1, Math.floor(sched.length / 80));
    return sched.filter((_, i) => i % step === 0 || i === sched.length - 1);
  }

  const minPts = sample(minimumSchedule?.schedule);
  const curPts = sample(schedule?.schedule);
  const nudgePts = sample(nudgeSchedule);

  const minPath = buildCurvePath(minPts, maxBalance, W, H);
  const curPath = buildCurvePath(curPts, maxBalance, W, H);
  const nudgePath = buildCurvePath(nudgePts, maxBalance, W, H);

  // Key stats
  const minMonths = minimumSchedule?.months ?? 0;
  const curMonths = schedule?.months ?? 0;
  const nudgeMonths = nudgeSchedule?.length ?? 0;
  const minInterest = minimumSchedule?.totalInterest ?? 0;
  const curInterest = schedule?.totalInterest ?? 0;
  const nudgeInterest = useMemo(() => {
    if (!loans?.length) return 0;
    let total = 0;
    let balances = loans.map(l => ({ ...l, balance: l.current_balance }));
    let month = 0;
    while (balances.some(l => l.balance > 0.01) && month < 600) {
      month++;
      balances.forEach(loan => {
        if (loan.balance <= 0) return;
        const interest = (loan.balance * (loan.interest_rate / 100)) / 12;
        total += interest;
        loan.balance = Math.max(0, loan.balance + interest - Math.min(loan.minimum_payment + 100 / balances.length, loan.balance + interest));
      });
    }
    return total;
  }, [loans]);

  if (!loans?.length || !schedule?.schedule?.length) return null;

  return (
    <div className="glass rounded-2xl p-5 overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-0.5">System Feedback Loop</p>
          <h3 className="text-sm font-semibold text-foreground">Payment Pace vs. Compounding Curve</h3>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-1 text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-8 h-px border-t border-dashed" style={{ borderColor: 'hsl(260,15%,35%)' }} />
            <span className="text-[10px] font-mono text-muted-foreground">minimum</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-8 h-0.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">current pace</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <div className="w-8 h-0.5 rounded-full" style={{ background: 'hsl(150,60%,50%)' }} />
            <span className="text-[10px] font-mono text-muted-foreground">+$100/mo</span>
          </div>
        </div>
      </div>

      {/* SVG curve art — scrub left→right to "read" the trajectory as a slow music-box */}
      <div
        className="relative mb-5 overflow-hidden rounded-lg cursor-crosshair"
        style={{ background: 'hsl(260,18%,7%)' }}
        onMouseMove={(e) => {
          const now = performance.now();
          if (now - lastScrubRef.current < 140) return;
          lastScrubRef.current = now;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          playFieldTone(Math.round(Math.max(0, Math.min(1, x)) * 7), enabled, 1.8);
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height: 140 }}>
          <defs>
            <linearGradient id="ccw-cur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270,80%,65%)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="hsl(270,80%,65%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ccw-nudge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(150,60%,50%)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="hsl(150,60%,50%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Minimum — dashed grey area */}
          {minPath && (
            <>
              <path d={buildAreaPath(minPath, W, H)} fill="hsl(260,15%,14%)" opacity="0.5" />
              <path d={minPath} fill="none" stroke="hsl(260,15%,35%)" strokeWidth="1.5" strokeDasharray="5 4" />
            </>
          )}

          {/* Current pace area + line */}
          {curPath && (
            <>
              <motion.path
                d={buildAreaPath(curPath, W, H)}
                fill="url(#ccw-cur)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              <motion.path
                d={curPath}
                fill="none"
                stroke="hsl(270,80%,65%)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              />
            </>
          )}

          {/* Nudge +$100 */}
          {nudgePath && (
            <>
              <motion.path
                d={buildAreaPath(nudgePath, W, H)}
                fill="url(#ccw-nudge)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
              <motion.path
                d={nudgePath}
                fill="none"
                stroke="hsl(150,60%,50%)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              />
            </>
          )}

          {/* Zero line */}
          <line x1="0" y1={H} x2={W} y2={H} stroke="hsl(260,15%,22%)" strokeWidth="1" />
        </svg>

        {/* Y-axis label */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-muted-foreground/50 uppercase">balance</div>
        <div className="absolute bottom-2 right-2 text-[9px] font-mono text-muted-foreground/50 uppercase">time →</div>
      </div>

      {/* Systems-thinking stats — 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Minimum Only</p>
          <p className="text-base font-black font-mono text-muted-foreground">{minMonths}<span className="text-[10px] font-normal ml-0.5">mo</span></p>
          <p className="text-[10px] font-mono text-destructive/70">{formatCurrency(minInterest)} interest</p>
        </div>
        <div className="text-center border-x border-border/30">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Current Pace</p>
          <p className="text-base font-black font-mono text-primary">{curMonths}<span className="text-[10px] font-normal ml-0.5">mo</span></p>
          <p className="text-[10px] font-mono text-muted-foreground">{formatCurrency(curInterest)} interest</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: 'hsl(150,60%,50%)' }}>+$100/mo</p>
          <p className="text-base font-black font-mono" style={{ color: 'hsl(150,60%,50%)' }}>{nudgeMonths}<span className="text-[10px] font-normal ml-0.5">mo</span></p>
          <p className="text-[10px] font-mono text-muted-foreground">{formatCurrency(nudgeInterest)} interest</p>
        </div>
      </div>

      {/* Systems-thinking insight */}
      <div className="mt-4 pt-3 border-t border-border/20">
        <p className="text-[10px] font-mono text-muted-foreground/70 italic leading-relaxed">
          ↺ &nbsp;Compound interest is a feedback loop — each payment reduces the principal that generates next month's interest charge.
          Small increases in pace break the loop faster than linear math suggests.
        </p>
      </div>
    </div>
  );
}