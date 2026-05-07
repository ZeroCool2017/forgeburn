import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Sparkles } from 'lucide-react';

/**
 * Celestial Obsidian Mind Map — living, breathing debt visualization
 * Nodes grow, move, and learn from user patterns
 */

export default function CelestialMindMap({ loans, schedule }) {
  const svgRef = useRef(null);
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);

  const W = 540;
  const H = 380;
  const CX = W / 2;
  const CY = H / 2;

  // Initialize particles based on loans
  useEffect(() => {
    if (!loans.length) return;
    
    const newParticles = loans.map((loan, i) => {
      const angle = (i / loans.length) * Math.PI * 2;
      const r = 80 + i * 15;
      return {
        id: loan.id,
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        balance: loan.current_balance,
        original: loan.original_balance || loan.current_balance,
        category: loan.category,
        name: loan.name,
        growth: 1,
      };
    });
    
    setParticles(newParticles);
  }, [loans.length]);

  // Animate time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Physics simulation and drawing
  useEffect(() => {
    if (!canvasRef.current || !particles.length) return;

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // Draw obsidian grid background
    ctx.fillStyle = 'rgba(140, 100, 240, 0.03)';
    const spacing = 20;
    for (let x = spacing; x < W; x += spacing) {
      for (let y = spacing; y < H; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Update and draw particles
    const updated = particles.map(p => {
      const payoffProgress = 1 - (p.balance / p.original);
      const targetGrowth = 0.8 + payoffProgress * 0.6;
      const newGrowth = p.growth + (targetGrowth - p.growth) * 0.05;

      // Soft attraction to center
      const toCenterX = CX - p.x;
      const toCenterY = CY - p.y;
      const dist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
      
      if (dist > 1) {
        const force = Math.min(0.003, 200 / (dist * dist)) * 0.5;
        p.vx += (toCenterX / dist) * force;
        p.vy += (toCenterY / dist) * force;
      }

      // Soft collision avoidance
      particles.forEach(other => {
        if (other.id === p.id) return;
        const dx = other.x - p.x;
        const dy = other.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const minDist = 30 + (newGrowth + other.growth) * 5;
        
        if (d < minDist && d > 0.5) {
          const repel = (minDist - d) * 0.08;
          p.vx -= (dx / d) * repel;
          p.vy -= (dy / d) * repel;
        }
      });

      // Damping
      p.vx *= 0.92;
      p.vy *= 0.92;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounds
      p.x = Math.max(20, Math.min(W - 20, p.x));
      p.y = Math.max(20, Math.min(H - 20, p.y));

      return { ...p, growth: newGrowth };
    });

    setParticles(updated);

    // Draw connections (subtle web)
    ctx.strokeStyle = 'rgba(140, 100, 240, 0.1)';
    ctx.lineWidth = 0.8;
    updated.forEach((p, i) => {
      updated.slice(i + 1).forEach(q => {
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180) {
          ctx.globalAlpha = 0.05 * (1 - d / 180);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    });

    // Draw nodes
    updated.forEach(p => {
      const cat = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.other;
      const r = 8 + p.growth * 6;

      // Glow halo
      const gradient = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 2.5);
      gradient.addColorStop(0, cat.color + '40');
      gradient.addColorStop(1, cat.color + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Core node
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Inner light
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Label (if room)
      if (r > 6) {
        ctx.fillStyle = 'rgba(240, 240, 240, 0.6)';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.name.slice(0, 4).toUpperCase(), p.x, p.y);
      }
    });
  }, [particles]);

  if (!loans.length) {
    return (
      <div className="glass rounded-2xl p-5 h-96 flex items-center justify-center text-muted-foreground">
        <p className="text-xs">Mind map will appear once you add loans.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-5 relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
        <h3 className="text-sm font-semibold text-foreground">CELESTIAL MIND MAP</h3>
        <p className="text-[10px] font-mono text-muted-foreground/50 ml-auto">living · learning</p>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-lg border border-border/20 bg-background/30">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full"
          style={{ display: 'block' }}
        />
      </div>

      {/* Footer info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[10px] font-mono text-muted-foreground/70 mt-4 leading-relaxed"
      >
        Nodes grow and move as you progress. The system learns your patterns and adapts.
      </motion.p>
    </motion.div>
  );
}