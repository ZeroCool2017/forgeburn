import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency } from '@/lib/loanCalculations';
import { playNoteFromData, playHarmonicChord } from '@/lib/musicalInterface';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  // Play tone on hover (psychoacoustic feedback)
  if (payload[0]?.value) {
    const normalized = Math.max(0, Math.min(1, payload[0].value / 100000));
    playNoteFromData(normalized);
  }

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
  const [hasInteracted, setHasInteracted] = useState(false);

  if (!schedule?.length) return null;

  const handleChartInteraction = () => {
    if (!hasInteracted) {
      playHarmonicChord(0);
      setHasInteracted(true);
    }
  };

  const data = schedule.map((m, i) => ({
    month: m.month,
    balance: Math.round(m.totalBalance),
    minimum: minimumSchedule?.schedule?.[i]?.totalBalance 
      ? Math.round(minimumSchedule.schedule[i].totalBalance)
      : undefined,
  })).filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 60)) === 0 || i === schedule.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'hsl(260, 18%, 8%)',
        border: '1px solid hsl(260, 15%, 20%)',
        backgroundImage: 'radial-gradient(hsl(258, 80%, 68%, 0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top zig-zag accent */}
      <div className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{
          background: 'repeating-linear-gradient(90deg, hsl(270, 80%, 65%) 0px, hsl(270, 80%, 65%) 3px, transparent 3px, transparent 10px)',
        }}
      />

      <div className="relative z-10 mb-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-3 tracking-wide">
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-2.5 h-2.5 rounded-full bg-primary"
          />
          <span>DEBT BURNDOWN</span>
        </h3>
        <p className="text-[9px] font-mono text-muted-foreground/50 tracking-widest">strategy vs minimum</p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 25, bottom: 15, left: 15 }} onClick={handleChartInteraction}>
          <defs>
            <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0.25} />
              <stop offset="60%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="hsl(270, 80%, 65%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0.08} />
              <stop offset="100%" stopColor="hsl(0, 0%, 50%)" stopOpacity={0} />
            </linearGradient>
            <filter id="burnGlow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="hsl(260, 15%, 18%)" vertical={true} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'hsl(260, 8%, 60%)', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(260, 15%, 20%)', strokeWidth: 1 }}
            tickFormatter={(v) => `M${v}`}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(260, 8%, 60%)', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
           {data[0]?.minimum !== undefined && (
             <Area
               type="natural"
               dataKey="minimum"
               name="Min. Only"
               stroke="hsl(260, 8%, 45%)"
               fill="url(#minGrad)"
               strokeWidth={1.5}
               strokeDasharray="5 4"
               dot={false}
               isAnimationActive={true}
               animationDuration={1200}
             />
           )}
           <Area
             type="natural"
             dataKey="balance"
             name="Your Plan"
             stroke="hsl(270, 80%, 65%)"
             fill="url(#burnGrad)"
             strokeWidth={3}
             dot={false}
             isAnimationActive={true}
             animationDuration={1200}
             filter="url(#burnGlow)"
           />
          </AreaChart>
          </ResponsiveContainer>

          {/* Bottom zig-zag accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px opacity-30"
          style={{
          background: 'repeating-linear-gradient(90deg, hsl(270, 80%, 65%) 0px, hsl(270, 80%, 65%) 3px, transparent 3px, transparent 10px)',
          }}
          />

          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mt-4 pt-3 border-t text-[9px] font-mono text-muted-foreground/70 tracking-widest"
          style={{ borderColor: 'hsl(260, 15%, 20%)' }}
          >
          Purple: your strategy · Gray dashed: minimum payments only
          </motion.div>
          </motion.div>
          );
          }