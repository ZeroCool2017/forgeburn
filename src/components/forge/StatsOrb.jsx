import React from 'react';
import { motion } from 'framer-motion';

export default function StatsOrb({ label, value, sublabel, delay = 0, color = 'primary' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-primary/30 transition-all"
    >
      <div 
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: `radial-gradient(circle, hsl(var(--${color})), transparent)` }}
      />
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </motion.div>
  );
}