import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';

const COLORS = ['#818cf8', '#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fb923c', '#94a3b8'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-border/50">
      <p className="font-mono text-foreground">{payload[0].name}</p>
      <p className="font-mono text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function InterestBreakdown({ loans, schedule }) {
  if (!loans?.length || !schedule?.schedule?.length) return null;

  // Calculate total interest per loan
  const interestByLoan = {};
  loans.forEach(l => { interestByLoan[l.id] = 0; });
  
  schedule.schedule.forEach(month => {
    month.loans.forEach(l => {
      if (interestByLoan[l.id] !== undefined) {
        interestByLoan[l.id] += l.interest;
      }
    });
  });

  const data = loans.map((loan, i) => ({
    name: loan.name,
    value: Math.round(interestByLoan[loan.id] || 0),
    color: COLORS[i % COLORS.length],
  })).filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse-glow" />
        Interest Breakdown
      </h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground truncate max-w-[100px]">{d.name}</span>
              </div>
              <span className="font-mono text-foreground">{formatCurrency(d.value)}</span>
            </div>
          ))}
          <div className="border-t border-border/50 pt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Total Interest</span>
            <span className="font-mono text-primary font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}