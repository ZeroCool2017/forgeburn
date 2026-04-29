import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/loanCalculations';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-border/50">
      <p className="font-mono text-muted-foreground mb-1">Month {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function PaymentTimeline({ schedule }) {
  if (!schedule?.schedule?.length) return null;

  const data = schedule.schedule
    .filter((_, i) => i % Math.max(1, Math.floor(schedule.schedule.length / 30)) === 0 || i === schedule.schedule.length - 1)
    .map(m => ({
      month: m.month,
      principal: Math.round(m.totalPaid - m.totalInterest),
      interest: Math.round(m.totalInterest),
    }));

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-chart-2 animate-pulse-glow" />
        Payment Split
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 16%)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'hsl(260, 8%, 55%)' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(260, 15%, 16%)' }}
            tickFormatter={(v) => `M${v}`}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(260, 8%, 55%)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="principal" name="Principal" stackId="a" fill="hsl(270, 80%, 65%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="interest" name="Interest" stackId="a" fill="hsl(330, 70%, 60%)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}