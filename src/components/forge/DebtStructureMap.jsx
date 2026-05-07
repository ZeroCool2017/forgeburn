import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';

/**
 * Obsidian-inspired node graph visualization of debt structure.
 * Loans are nodes connected by edges, animated with orbital movement.
 */

export default function DebtStructureMap({ loans, totalOriginal }) {
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimTime(t => t + 0.016); // ~60fps
    }, 16);
    return () => clearInterval(interval);
  }, []);

  if (!loans?.length) {
    return (
      <div className="glass rounded-2xl p-5 h-80 flex items-center justify-center text-muted-foreground">
        <p className="text-xs">Add loans to see the structural map.</p>
      </div>
    );
  }

  const W = 540;
  const H = 320;
  const centerX = W / 2;
  const centerY = H / 2;
  const radius = Math.min(W, H) * 0.35;

  // Calculate node positions
  const nodes = loans.map((loan, i) => {
    const angle = (i / loans.length) * Math.PI * 2 + animTime * 0.3;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
    const original = loan.original_balance || loan.current_balance;
    const progress = 1 - (loan.current_balance / original);
    return { loan, x, y, cat, progress, index: i };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-5 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Structural View</p>
      </div>

      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded-lg border border-border/20"
        style={{ background: 'hsl(260, 18%, 7%)' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dot grid background */}
        {Array.from({ length: (W / 16) * (H / 16) }).map((_, i) => {
          const x = (i % (W / 16)) * 16 + 16;
          const y = Math.floor(i / (W / 16)) * 16 + 16;
          return (
            <circle key={`dot-${i}`} cx={x} cy={y} r="0.6" fill="rgba(140, 100, 240, 0.04)" />
          );
        })}

        {/* Connections */}
        {nodes.map((node, i) => {
          const connected = [];
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - node.x;
            const dy = nodes[j].y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius * 1.5) {
              connected.push(
                <line
                  key={`edge-${i}-${j}`}
                  x1={node.x}
                  y1={node.y}
                  x2={nodes[j].x}
                  y2={nodes[j].y}
                  stroke="rgba(140, 100, 240, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4,6"
                />
              );
            }
          }
          return connected;
        })}

        {/* Nodes */}
        {nodes.map(({ x, y, cat, progress, loan }) => {
          const r = 6 + progress * 4;
          return (
            <motion.g
              key={`node-${loan.id}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: Math.random() * 0.3 }}
            >
              {/* Glow halo */}
              <circle
                cx={x}
                cy={y}
                r={r * 2}
                fill={cat.color}
                opacity="0.15"
                filter="url(#glow)"
              />

              {/* Main node */}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={cat.color}
                opacity="0.9"
              />

              {/* Progress ring */}
              {progress > 0 && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 2}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="1.5"
                  strokeDasharray={`${Math.PI * 2 * (r + 2) * progress} ${Math.PI * 2 * (r + 2)}`}
                  opacity="0.6"
                />
              )}

              {/* Label */}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dy="0.35em"
                fontSize="9"
                fontFamily="monospace"
                fill="hsl(240, 10%, 88%)"
              >
                {loan.name.slice(0, 3).toUpperCase()}
              </text>
            </motion.g>
          );
        })}

        {/* Center dot */}
        <circle cx={centerX} cy={centerY} r="2" fill="hsl(270, 80%, 65%)" opacity="0.4" />
      </svg>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed"
      >
        Nodes orbit based on structure. Size and ring reflect progress. Connections show relationships.
      </motion.p>
    </motion.div>
  );

  if (!loans?.length) {
    return (
      <div className="glass rounded-2xl p-5 h-64 flex items-center justify-center text-muted-foreground">
        <p className="text-xs">Add loans to see the structural map.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-5 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Systems View</p>
      </div>
      <canvas
        ref={canvasRef}
        width={540}
        height={320}
        className="w-full rounded-lg border border-border/20"
        style={{ display: 'block', background: 'hsl(260, 18%, 7%)' }}
      />
      <p className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed">
        Each circle is a loan. Size and glow indicate progress. Lines show structural connections — your debt as a network, not a list.
      </p>
    </motion.div>
  );
}