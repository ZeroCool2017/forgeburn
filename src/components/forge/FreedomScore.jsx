import React from 'react';
import { motion } from 'framer-motion';

export default function FreedomScore({ loans }) {
  if (!loans?.length) return null;

  const totalOriginal = loans.reduce((s, l) => s + (l.original_balance || l.current_balance), 0);
  const totalCurrent = loans.reduce((s, l) => s + l.current_balance, 0);
  const score = Math.round(((totalOriginal - totalCurrent) / totalOriginal) * 100);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  const getGrade = (s) => {
    if (s >= 90) return { grade: 'S', label: 'Legendary', color: '#fbbf24' };
    if (s >= 75) return { grade: 'A', label: 'Excellent', color: '#a78bfa' };
    if (s >= 50) return { grade: 'B', label: 'Strong', color: '#38bdf8' };
    if (s >= 25) return { grade: 'C', label: 'Building', color: '#34d399' };
    return { grade: 'D', label: 'Starting', color: '#f472b6' };
  };

  const { grade, label, color } = getGrade(score);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 30%, ${color}, transparent 70%)` }}
      />
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Freedom Score
      </h3>
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(260, 15%, 16%)" strokeWidth="6" />
          <motion.circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-3xl font-black font-mono"
            style={{ color }}
          >
            {grade}
          </motion.span>
          <span className="text-lg font-bold font-mono text-foreground">{score}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  );
}