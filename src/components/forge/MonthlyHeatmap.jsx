import React from 'react';
import { formatCurrency } from '@/lib/loanCalculations';

export default function MonthlyHeatmap({ schedule }) {
  if (!schedule?.schedule?.length) return null;

  const months = schedule.schedule.slice(0, 48);
  const maxInterest = Math.max(...months.map(m => m.totalInterest));

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-chart-5 animate-pulse-glow" />
        Interest Heatmap
      </h3>
      <p className="text-xs text-muted-foreground mb-3">Monthly interest cost — darker = more interest burned</p>
      <div className="grid grid-cols-12 gap-1">
        {months.map((m, i) => {
          const intensity = maxInterest > 0 ? m.totalInterest / maxInterest : 0;
          return (
            <div
              key={i}
              className="aspect-square rounded-sm cursor-pointer group relative"
              style={{
                background: `rgba(139, 92, 246, ${0.1 + intensity * 0.7})`,
              }}
              title={`Month ${m.month}: ${formatCurrency(m.totalInterest)} interest`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                <div className="glass rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap border border-border/50">
                  M{m.month}: {formatCurrency(m.totalInterest)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground font-mono">
        <span>Less interest</span>
        <div className="flex gap-0.5">
          {[0.1, 0.25, 0.4, 0.55, 0.7].map((o, i) => (
            <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(139, 92, 246, ${o})` }} />
          ))}
        </div>
        <span>More interest</span>
      </div>
    </div>
  );
}