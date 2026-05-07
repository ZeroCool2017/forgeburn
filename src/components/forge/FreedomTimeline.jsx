import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FreedomTimeline({ schedule, months }) {
  // Build a timeline from now to payoff with milestone markers
  const today = new Date();
  const payoffDate = new Date(today.getFullYear(), today.getMonth() + months, 1);
  
  // Create month-by-month projection
  const timelineData = useMemo(() => {
    const data = [];
    const monthsToShow = Math.min(months + 2, 120);
    
    for (let i = 0; i <= monthsToShow; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const scheduleMonth = schedule[i] || schedule[schedule.length - 1];
      const balance = scheduleMonth?.totalBalance || 0;
      const progress = 100 - ((balance / (schedule[0]?.totalBalance || 1)) * 100);
      
      data.push({
        month: i,
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        balance: Math.max(0, balance),
        progress: Math.min(100, progress),
        isFinal: i === Math.min(months, monthsToShow),
      });
    }
    return data;
  }, [schedule, months, today]);

  if (!schedule?.length || !timelineData?.length) return null;

  const payoffMonth = Math.min(months, 120);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-chart-4"
          />
          <h3 className="text-sm font-semibold text-foreground">Debt-Free Projection</h3>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-right"
        >
          <p className="text-xs font-mono text-muted-foreground">freedom date</p>
          <p className="text-lg font-black font-mono text-chart-4">
            {payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </motion.div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={timelineData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(270, 80%, 65%)" />
              <stop offset="100%" stopColor="hsl(180, 60%, 55%)" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 16%)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 55%)' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(260, 15%, 16%)' }}
            interval={Math.max(0, Math.floor(timelineData.length / 8))}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 55%)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 55%)' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(260, 18%, 12%)',
              border: '1px solid hsl(260, 15%, 25%)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(240, 10%, 88%)' }}
            formatter={(value, name) => [
              name === 'balance' ? `$${(value / 1000).toFixed(1)}k` : `${value.toFixed(1)}%`,
              name === 'balance' ? 'Balance' : 'Progress'
            ]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="balance"
            stroke="url(#timelineGrad)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="progress"
            stroke="hsl(100, 70%, 50%)"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
            isAnimationActive={true}
            animationDuration={1200}
            animationDelay={100}
          />
        </LineChart>
      </ResponsiveContainer>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 pt-3 border-t border-border/20"
      >
        <p className="text-[10px] font-mono text-muted-foreground italic leading-relaxed">
          Timeline shows your debt balance declining to zero. Green line tracks progress percentage. At current pace, freedom arrives in {months} months.
        </p>
      </motion.div>
    </motion.div>
  );
}