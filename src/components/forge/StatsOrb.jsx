import React from 'react';
import { motion } from 'framer-motion';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone } from '@/lib/orchestraSound';

export default function StatsOrb({ label, value, sublabel, delay = 0, color = 'primary', accent }) {
  const resolvedColor = accent || color;
  const isForge = !!accent;
  const { enabled } = useAmbientSoundContext();
  // Each orb holds a note of a gentle motif; tapping across the row layers harmony
  const toneIndex = Math.round((delay || 0) * 10);

  const handleTap = () => playOrbTone(toneIndex / 7, enabled, 2.2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileTap={{ scale: 0.96 }}
      onClick={handleTap}
      className={`rounded-xl border bg-card/50 p-4 relative overflow-hidden group transition-all cursor-pointer select-none ${
        isForge ? 'border-border/30 hover:border-chart-3/30' : 'border-border/30 hover:border-primary/25'
      }`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-4 right-4 h-px ${isForge ? 'bg-chart-3/30' : 'bg-primary/20'}`} />
      <p className="obs-label mb-2">{label}</p>
      <p
        className="text-2xl font-black font-mono tracking-tight"
        style={isForge ? { color: 'hsl(var(--chart-3))' } : { color: 'hsl(var(--foreground))' }}
      >
        {value}
      </p>
      {sublabel && <p className="text-[11px] text-muted-foreground mt-1 font-mono">{sublabel}</p>}
    </motion.div>
  );
}