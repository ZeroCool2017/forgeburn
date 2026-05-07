import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';

/**
 * Dot-grid canvas that draws loans as nodes connected by lines.
 * Visualizes debt as a structural map rather than a flat list.
 * Inspired by systems thinking and Obsidian node graphs.
 */

export default function DebtStructureMap({ loans, totalOriginal }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loans?.length) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.fillStyle = 'hsl(260, 18%, 7%)';
    ctx.fillRect(0, 0, W, H);

    // Draw dot grid
    ctx.fillStyle = 'rgba(140, 100, 240, 0.04)';
    const dotSpacing = 16;
    for (let x = dotSpacing; x < W; x += dotSpacing) {
      for (let y = dotSpacing; y < H; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Arrange loans in a loose circle around the center
    const centerX = W / 2;
    const centerY = H / 2;
    const radius = Math.min(W, H) * 0.35;

    const nodes = loans.map((loan, i) => {
      const angle = (i / loans.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      const original = loan.original_balance || loan.current_balance;
      const progress = 1 - (loan.current_balance / original);
      return { loan, x, y, cat, progress };
    });

    // Draw connections (lines between nearby loans)
    ctx.strokeStyle = 'rgba(140, 100, 240, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Only connect if within reasonable distance
        if (dist < radius * 1.5) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);

    // Draw nodes
    nodes.forEach(({ x, y, cat, progress, loan }) => {
      const r = 6 + progress * 4; // Size grows with progress

      // Glow background
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      grad.addColorStop(0, cat.color + '40');
      grad.addColorStop(1, cat.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Node circle
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Progress ring
      if (progress > 0) {
        ctx.strokeStyle = cat.color + '88';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
      }

      // Label
      ctx.font = '9px monospace';
      ctx.fillStyle = 'hsl(240, 10%, 88%)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loan.name.slice(0, 3).toUpperCase(), x, y);
    });

    // Title
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'hsl(140, 100%, 240%, 0.6)';
    ctx.textAlign = 'left';
    ctx.fillText('Debt Structure Map', 12, 20);
  }, [loans]);

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
        width={420}
        height={280}
        className="w-full rounded-lg border border-border/20"
        style={{ display: 'block', background: 'hsl(260, 18%, 7%)' }}
      />
      <p className="text-[10px] text-muted-foreground mt-3 italic leading-relaxed">
        Each circle is a loan. Size and glow indicate progress. Lines show structural connections — your debt as a network, not a list.
      </p>
    </motion.div>
  );
}