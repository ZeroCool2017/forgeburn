import React from 'react';
import { motion } from 'framer-motion';

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// A single flying shard
function Shard({ color, delay, startX, startY }) {
  const angle = randomBetween(0, 360);
  const dist = randomBetween(80, 260);
  const tx = Math.cos((angle * Math.PI) / 180) * dist;
  const ty = Math.sin((angle * Math.PI) / 180) * dist;
  const rotate = randomBetween(-720, 720);
  const size = randomBetween(4, 14);
  const aspect = randomBetween(1, 4);

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
      animate={{ opacity: 0, x: tx, y: ty, rotate, scale: 0.2 }}
      transition={{ duration: randomBetween(0.6, 1.1), delay, ease: 'easeOut' }}
      className="absolute rounded-sm pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: size * aspect,
        height: size,
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  );
}

// Spark dot
function Spark({ color, delay, startX, startY }) {
  const angle = randomBetween(0, 360);
  const dist = randomBetween(40, 180);
  const tx = Math.cos((angle * Math.PI) / 180) * dist;
  const ty = Math.sin((angle * Math.PI) / 180) * dist;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
      transition={{ duration: randomBetween(0.4, 0.8), delay, ease: 'easeOut' }}
      className="absolute rounded-full pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: randomBetween(2, 5),
        height: randomBetween(2, 5),
        background: color,
        boxShadow: `0 0 4px ${color}`,
      }}
    />
  );
}

export default function ChainShatterOverlay({ trigger, color = '#a78bfa', origin }) {
  if (!trigger) return null;

  const cx = origin?.x ?? window.innerWidth / 2;
  const cy = origin?.y ?? window.innerHeight / 2;

  const shards = Array.from({ length: 28 });
  const sparks = Array.from({ length: 20 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {shards.map((_, i) => (
        <Shard
          key={`shard-${i}`}
          color={color}
          delay={randomBetween(0, 0.15)}
          startX={cx}
          startY={cy}
        />
      ))}
      {sparks.map((_, i) => (
        <Spark
          key={`spark-${i}`}
          color={i % 2 === 0 ? color : '#ffffff'}
          delay={randomBetween(0, 0.1)}
          startX={cx}
          startY={cy}
        />
      ))}
      {/* Flash ring */}
      <motion.div
        initial={{ opacity: 0.8, scale: 0 }}
        animate={{ opacity: 0, scale: 3 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute rounded-full border-2 pointer-events-none"
        style={{
          left: cx - 40,
          top: cy - 40,
          width: 80,
          height: 80,
          borderColor: color,
          boxShadow: `0 0 20px ${color}`,
        }}
      />
      {/* Inner flash */}
      <motion.div
        initial={{ opacity: 0.6, scale: 0 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: cx - 30,
          top: cy - 30,
          width: 60,
          height: 60,
          background: `radial-gradient(circle, ${color}88, transparent)`,
        }}
      />
    </div>
  );
}