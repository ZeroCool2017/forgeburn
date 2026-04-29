import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

export default function BurndownChart({ schedule, minimumSchedule }) {
  if (!schedule?.length) return null;

  const data = schedule.map((m, i) => ({
    month: m.month,
    balance: Math.round(m.totalBalance),
    minimum: minimumSchedule?.schedule?.[i]?.totalBalance 
      ? Math.round(minimumSchedule.schedule[i].totalBalance)
      : undefined,
  })).filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 60)) === 0 || i === schedule.length - 1);

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        Debt Burndown
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0.1} />
              <stop offset="100%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          {data[0]?.minimum !== undefined && (
            <Area
              type="monotone"
              dataKey="minimum"
              name="Min. Only"
              stroke="hsl(260, 8%, 40%)"
              fill="url(#minGrad)"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            name="Your Plan"
            stroke="hsl(270, 80%, 65%)"
            fill="url(#burnGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}