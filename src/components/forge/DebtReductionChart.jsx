import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/loanCalculations';
import { TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone } from '@/lib/orchestraSound';

let lastToneAt = 0;
const CustomTooltip = ({ active, payload, label, max, enabled }) => {
  if (!active || !payload?.length) return null;
  const plan = payload.find(p => p.dataKey === 'balance');
  const min = payload.find(p => p.dataKey === 'minimum');

  // Sonify the hover: higher progress → brighter pitch, gently throttled so it
  // never feels busy. Part of the orchestra, never competing.
  if (plan && enabled) {
    const now = performance.now();
    if (now - lastToneAt > 160) {
      lastToneAt = now;
      const progress = max > 0 ? 1 - (plan.value / max) : 0;
      playOrbTone(Math.max(0, Math.min(1, progress)), enabled, 1.5);
    }
  }

  return (
    <div className="glass rounded-xl px-3 py-2.5 text-xs border border-border/50 shadow-xl">
      <p className="font-mono text-muted-foreground mb-1.5">Month {label}</p>
      {plan && (
        <p className="font-mono font-semibold text-primary">
          Your plan: {formatCurrency(plan.value)}
        </p>
      )}
      {min && (
        <p className="font-mono text-muted-foreground">
          Min. only: {formatCurrency(min.value)}
        </p>
      )}
    </div>
  );
};

const VIEWS = [
  { label: '1Y', months: 12 },
  { label: '3Y', months: 36 },
  { label: '5Y', months: 60 },
  { label: 'All', months: Infinity },
];

export default function DebtReductionChart({ schedule, minimumSchedule, totalDebt }) {
  const [view, setView] = useState('All');
  const { enabled } = useAmbientSoundContext();

  if (!schedule?.schedule?.length) return null;

  const selectedMonths = VIEWS.find(v => v.label === view)?.months ?? Infinity;

  const rawData = schedule.schedule
    .filter(m => m.month <= selectedMonths)
    .filter((_, i, arr) => {
      const step = Math.max(1, Math.floor(arr.length / 80));
      return i % step === 0 || i === arr.length - 1;
    })
    .map(m => ({
      month: m.month,
      balance: Math.round(m.totalBalance),
      minimum: minimumSchedule?.schedule?.[m.month - 1]?.totalBalance
        ? Math.round(minimumSchedule.schedule[m.month - 1].totalBalance)
        : undefined,
    }));

  // Prepend month 0 (starting point)
  const data = [
    { month: 0, balance: totalDebt, minimum: totalDebt },
    ...rawData,
  ];

  const maxVal = totalDebt;
  const finalBalance = data[data.length - 1]?.balance ?? 0;
  const pctReduced = totalDebt > 0 ? ((totalDebt - finalBalance) / totalDebt) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-primary" />
            Debt Reduction
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatCurrency(totalDebt - finalBalance)} eliminated ·{' '}
            <span className="text-primary font-mono font-semibold">
              {pctReduced.toFixed(1)}%
            </span>{' '}
            {view === 'All' ? 'at payoff' : `over ${view}`}
          </p>
        </div>
        {/* View toggle */}
        <div className="flex gap-1 bg-secondary/40 rounded-lg p-0.5">
          {VIEWS.map(v => (
            <button
              key={v.label}
              onClick={() => setView(v.label)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                view === v.label
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(260, 8%, 50%)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(260, 8%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(260, 15%, 14%)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 45%)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v === 0 ? 'Now' : `M${v}`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 45%)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            domain={[0, maxVal * 1.02]}
            width={36}
          />
          <Tooltip content={<CustomTooltip max={totalDebt} enabled={enabled} />} />

          {/* Minimum-only ghost line */}
          <Area
            type="monotone"
            dataKey="minimum"
            name="Min. Only"
            stroke="hsl(260, 8%, 38%)"
            fill="url(#minGrad)"
            strokeWidth={1}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
          />

          {/* Your plan line */}
          <Area
            type="monotone"
            dataKey="balance"
            name="Your Plan"
            stroke="hsl(270, 80%, 65%)"
            fill="url(#debtGrad)"
            strokeWidth={2.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-primary rounded-full" />
          <span className="text-[10px] text-muted-foreground">Your plan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px border-t border-dashed border-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground">Min. payments only</span>
        </div>
      </div>
    </motion.div>
  );
}