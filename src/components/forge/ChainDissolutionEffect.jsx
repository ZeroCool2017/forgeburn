import React from 'react';
import { motion } from 'framer-motion';

/**
 * Chain dissolution effect — weighty, permanent visual of breaking constraints.
 * Particles dissolve (fade + shrink) rather than explode, emphasizing transformation.
 * Used when a payment breaks a chain link.
 */

function ChainParticle({ color, delay, startX, startY, duration = 0.8 }) {
  const angle = Math.random() * 360;
  const dist = 60 + Math.random() * 140;
  const tx = Math.cos((angle * Math.PI) / 180) * dist;
  const ty = Math.sin((angle * Math.PI) / 180) * dist;
  
  // Slow, weighted falling motion
  const verticalDrift = 40 + Math.random() * 80;

  return (
    <motion.div
      initial={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
      }}
      animate={{
        opacity: 0,
        x: tx,
        y: ty + verticalDrift,
        scale: 0,
        rotate: Math.random() * 720,
      }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Custom easing for weighted fall
      }}
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: '3px',
        height: '12px',
        background: color,
        boxShadow: `0 0 8px ${color}88`,
        borderRadius: '1px',
      }}
    />
  );
}

function RippleWave({ color, startX, startY }) {
  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 0 }}
      animate={{ opacity: 0, scale: 2.8 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{
        left: startX - 35,
        top: startY - 35,
        width: 70,
        height: 70,
        border: `2px solid ${color}`,
        boxShadow: `0 0 24px ${color}66`,
      }}
    />
  );
}

function PermanenceGlow({ color, startX, startY }) {
  return (
    <motion.div
      initial={{ opacity: 0.4, scale: 0 }}
      animate={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{
        left: startX - 45,
        top: startY - 45,
        width: 90,
        height: 90,
        background: `radial-gradient(circle, ${color}44, transparent 70%)`,
      }}
    />
  );
}

export default function ChainDissolutionEffect({ trigger, color = '#a78bfa', origin }) {
  if (!trigger) return null;

  const cx = origin?.x ?? window.innerWidth / 2;
  const cy = origin?.y ?? window.innerHeight / 2;

  // More particles for heavier effect
  const particles = Array.from({ length: 36 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Permanence glow — lingers longer, emphasizes weight */}
      <PermanenceGlow color={color} startX={cx} startY={cy} />

      {/* Ripple wave */}
      <RippleWave color={color} startX={cx} startY={cy} />

      {/* Dissolving chain particles — slow, weighted descent */}
      {particles.map((_, i) => (
        <ChainParticle
          key={`particle-${i}`}
          color={color}
          delay={Math.random() * 0.12}
          startX={cx}
          startY={cy}
          duration={0.85 + Math.random() * 0.35}
        />
      ))}

      {/* Inner core flash (softer than shatter) */}
      <motion.div
        initial={{ opacity: 0.5, scale: 0 }}
        animate={{ opacity: 0, scale: 1.8 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx - 25,
          top: cy - 25,
          width: 50,
          height: 50,
          background: `radial-gradient(circle, ${color}99, transparent 60%)`,
        }}
      />
    </div>
  );
}