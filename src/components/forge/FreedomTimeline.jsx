import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playFieldTone } from '@/lib/orchestraSound';

let ftLastToneAt = 0;
function FreedomTooltip({ active, payload, label, enabled }) {
  if (!active || !payload?.length) return null;
  const bal = payload.find(p => p.dataKey === 'balance');
  const prog = payload.find(p => p.dataKey === 'progress');

  if (enabled && prog) {
    const now = performance.now();
    if (now - ftLastToneAt > 200) {
      ftLastToneAt = now;
      playFieldTone(Math.round(Math.max(0, Math.min(1, prog.value / 100)) * 7), enabled, 1.7);
    }
  }

  return (
    <div style={{
      background: 'hsl(260, 18%, 10%)',
      border: '1px solid hsl(258, 80%, 68%, 0.3)',
      borderRadius: '6px',
      boxShadow: '0 0 12px hsl(258, 80%, 68%, 0.2)',
      padding: '6px 10px',
      fontFamily: 'monospace',
      fontSize: '11px',
      color: 'hsl(240, 10%, 88%)',
    }}>
      <div style={{ marginBottom: 4 }}>{label}</div>
      {bal && <div style={{ color: 'hsl(270, 80%, 65%)' }}>Balance: ${(bal.value / 1000).toFixed(1)}k</div>}
      {prog && <div style={{ color: 'hsl(100, 70%, 50%)' }}>Progress: {prog.value.toFixed(1)}%</div>}
    </div>
  );
}

export default function FreedomTimeline({ schedule, months }) {
  const { enabled } = useAmbientSoundContext();
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
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'hsl(260, 18%, 8%)',
        border: '1px solid hsl(260, 15%, 20%)',
        backgroundImage: 'radial-gradient(hsl(258, 80%, 68%, 0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Zig-zag accent top */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{
          background: 'repeating-linear-gradient(90deg, hsl(258, 80%, 68%) 0px, hsl(258, 80%, 68%) 2px, transparent 2px, transparent 8px)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: 'hsl(180, 60%, 55%)' }}
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Freedom Projection</h3>
            <p className="text-[10px] font-mono text-muted-foreground/60 tracking-widest">debt → zero</p>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-right px-4 py-2 rounded-lg"
          style={{ 
            background: 'hsl(180, 60%, 55%, 0.08)',
            border: '1px solid hsl(180, 60%, 55%, 0.2)'
          }}
        >
          <p className="text-[10px] font-mono text-muted-foreground/70">FREEDOM DATE</p>
          <motion.p
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-base font-black font-mono"
            style={{ color: 'hsl(180, 60%, 55%)' }}
          >
            {payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </motion.p>
        </motion.div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={timelineData} margin={{ top: 15, right: 30, bottom: 15, left: 10 }}>
          <defs>
            <linearGradient id="timelineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(270, 80%, 65%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(180, 60%, 55%)" stopOpacity={1} />
            </linearGradient>
            <filter id="timelineGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="hsl(260, 15%, 18%)" vertical={true} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 60%)', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(260, 15%, 20%)', strokeWidth: 1 }}
            interval={Math.max(0, Math.floor(timelineData.length / 8))}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 60%)', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 9, fill: 'hsl(260, 8%, 60%)', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip content={<FreedomTooltip enabled={enabled} />} />
          <Line
            yAxisId="left"
            type="natural"
            dataKey="balance"
            stroke="url(#timelineGrad)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            animationDuration={1400}
            filter="url(#timelineGlow)"
          />
          <Line
            yAxisId="right"
            type="natural"
            dataKey="progress"
            stroke="hsl(100, 70%, 50%)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
            isAnimationActive={true}
            animationDuration={1400}
            animationDelay={150}
            opacity={0.75}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Zig-zag accent bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px opacity-30"
        style={{
          background: 'repeating-linear-gradient(90deg, hsl(258, 80%, 68%) 0px, hsl(258, 80%, 68%) 2px, transparent 2px, transparent 8px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-5 pt-4 border-t"
        style={{ borderColor: 'hsl(260, 15%, 20%)' }}
      >
        <p className="text-[10px] font-mono text-muted-foreground/70 leading-relaxed tracking-wide">
          <span className="text-chart-4">↓ BALANCE</span> · <span className="text-green-500">↑ PROGRESS</span> · Freedom marker at month {months}
        </p>
      </motion.div>
    </motion.div>
  );
}