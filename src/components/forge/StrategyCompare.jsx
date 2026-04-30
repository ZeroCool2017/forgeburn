import React from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { STRATEGIES, calculatePayoffSchedule, formatCurrency } from '@/lib/loanCalculations';
import { motion } from 'framer-motion';

export default function StrategyCompare({ loans, extraBudget, activeStrategy, onStrategyChange }) {
  if (!loans?.length) return null;

  const results = STRATEGIES.map(s => {
    const result = calculatePayoffSchedule(loans, extraBudget, s.id);
    return { ...s, ...result };
  });

  const maxMonths = Math.max(...results.map(r => r.months));
  const maxInterest = Math.max(...results.map(r => r.totalInterest));

  const radarData = [
    { metric: 'Speed', ...Object.fromEntries(results.map(r => [r.id, Math.round((1 - r.months / (maxMonths || 1)) * 100)])) },
    { metric: 'Savings', ...Object.fromEntries(results.map(r => [r.id, Math.round((1 - r.totalInterest / (maxInterest || 1)) * 100)])) },
    { metric: 'Momentum', ...Object.fromEntries(results.map(r => [r.id, r.id === 'momentum' ? 90 : r.id === 'snowball' ? 80 : r.id === 'blitz' ? 70 : 50])) },
    { metric: 'Cash Flow', ...Object.fromEntries(results.map(r => [r.id, r.id === 'blitz' ? 90 : r.id === 'avalanche' ? 70 : 60])) },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-chart-4 animate-pulse-glow" />
        Strategy Arena
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {results.map((s, i) => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStrategyChange(s.id)}
            className={`rounded-xl p-3 text-left transition-all border ${
              activeStrategy === s.id
                ? 'border-primary/50 bg-primary/10 glow-purple'
                : 'border-border/30 bg-secondary/30 hover:border-border/60'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{s.icon}</span>
              <span className="text-xs font-semibold text-foreground">{s.name}</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              {s.months} mo · {formatCurrency(s.totalInterest)} int.
            </div>
          </motion.button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
          <PolarGrid stroke="hsl(260, 15%, 20%)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 10, fill: 'hsl(260, 8%, 55%)' }}
          />
          {results.map((s, i) => (
            <Radar
              key={s.id}
              dataKey={s.id}
              stroke={['hsl(270, 80%, 65%)', 'hsl(200, 80%, 55%)', 'hsl(330, 70%, 60%)', 'hsl(45, 90%, 60%)'][i]}
              fill={['hsl(270, 80%, 65%)', 'hsl(200, 80%, 55%)', 'hsl(330, 70%, 60%)', 'hsl(45, 90%, 60%)'][i]}
              fillOpacity={activeStrategy === s.id ? 0.2 : 0.03}
              strokeWidth={activeStrategy === s.id ? 2 : 0.5}
              strokeOpacity={activeStrategy === s.id ? 1 : 0.3}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground text-center mt-2 italic">
        {STRATEGIES.find(s => s.id === activeStrategy)?.description}
      </p>
    </div>
  );
}