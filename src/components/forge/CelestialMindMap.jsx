import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Sparkles } from 'lucide-react';

/**
 * Momentum Field — evolving, responsive system that grows smarter
 * Nodes represent loans, breathing and moving as progress is made
 * As you interact, this field learns and helps you excel in all life areas
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
      const r = 70 + i * 18;
      const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      return {
        id: loan.id,
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        balance: loan.current_balance,
        original: loan.original_balance || loan.current_balance,
        category: loan.category,
        name: loan.name,
        emoji: cat.emoji,
        color: cat.color,
        growth: 0.6,
      };
    });
    
    setParticles(newParticles);
  }, [loans]);

  // Animation loop with requestAnimationFrame for smooth 60fps movement
  useEffect(() => {
    if (!canvasRef.current || !particles.length) return;

    let animationFrameId;
    let currentTime = 0;
    let currentParticles = [...particles];

    const animate = () => {
      currentTime += 16; // ~60fps
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Draw obsidian grid background
      ctx.fillStyle = 'rgba(140, 100, 240, 0.02)';
      const spacing = 24;
      for (let x = spacing; x < W; x += spacing) {
        for (let y = spacing; y < H; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update particles physics
      currentParticles = currentParticles.map(p => {
        const payoffProgress = 1 - (p.balance / p.original);
        const targetGrowth = 0.8 + payoffProgress * 0.6;
        const newGrowth = p.growth + (targetGrowth - p.growth) * 0.05;

        // Soft, smooth attraction to center
        const toCenterX = CX - p.x;
        const toCenterY = CY - p.y;
        const dist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        
        if (dist > 2) {
          const force = Math.min(0.0012, 80 / (dist * 1.3)) * 0.6;
          p.vx += (toCenterX / dist) * force;
          p.vy += (toCenterY / dist) * force;
        }

        // Collision avoidance
        currentParticles.forEach(other => {
          if (other.id === p.id) return;
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const minDist = 35 + (newGrowth + other.growth) * 6;
          
          if (d < minDist && d > 0.5) {
            const repel = Math.pow(minDist - d, 1.5) * 0.05;
            p.vx -= (dx / d) * repel;
            p.vy -= (dy / d) * repel;
          }
        });

        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;

        p.x = Math.max(20, Math.min(W - 20, p.x));
        p.y = Math.max(20, Math.min(H - 20, p.y));

        return { ...p, growth: newGrowth };
      });

      // Draw connections — more visible, neural network style
      currentParticles.forEach((p, i) => {
        currentParticles.slice(i + 1).forEach(q => {
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 220;
          
          if (d < maxDist) {
            // Stronger visibility, gradient effect
            const strength = 1 - (d / maxDist);
            const pColor = parseInt(p.color.slice(1), 16);
            const qColor = parseInt(q.color.slice(1), 16);
            const pR = (pColor >> 16) & 255;
            const pG = (pColor >> 8) & 255;
            const pB = pColor & 255;
            
            ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${0.15 * strength})`;
            ctx.lineWidth = 0.8 + strength * 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes — Obsidian-like neural network
      const globalBreath = 1 + Math.sin(currentTime * 0.008) * 0.18;
      
      currentParticles.forEach(p => {
        const progress = 1 - (p.balance / p.original);
        
        // Size based on growth AND payoff progress (neural growth)
        const payoffSize = 6 + progress * 12;
        const baseSize = 10 + p.growth * 8;
        const r = (baseSize + payoffSize) * globalBreath;

        const rgbColor = parseInt(p.color.slice(1), 16);
        const rVal = (rgbColor >> 16) & 255;
        const gVal = (rgbColor >> 8) & 255;
        const bVal = rgbColor & 255;
        
        // Subtle outer glow
        const glowGrad = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 2.5);
        glowGrad.addColorStop(0, `rgba(${rVal}, ${gVal}, ${bVal}, 0.18)`);
        glowGrad.addColorStop(1, `rgba(${rVal}, ${gVal}, ${bVal}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core node — clean, solid
        ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.95)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Bright border — indicates activity
        const borderAlpha = 0.6 + globalBreath * 0.2;
        ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${borderAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Progress ring — shows learning/payoff
        if (progress > 0.02) {
          const ringRadius = r + 4;
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + progress * 2 * Math.PI;
          ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.75)`;
          ctx.lineWidth = 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringRadius, startAngle, endAngle);
          ctx.stroke();
        }

        // Emoji label
        if (p.emoji) {
          ctx.font = `${Math.round(r * 1.2)}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, p.x, p.y);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [particles]);

  if (!loans.length) {
    return (
      <div className="glass rounded-2xl p-5 h-96 flex items-center justify-center text-muted-foreground">
        <p className="text-xs">Momentum field will manifest once you add loans.</p>
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
      <div className="mb-6">
        <p className="text-xs font-mono text-muted-foreground/50 mb-1 tracking-widest">Evolving Mind Map</p>
        <h3 className="text-sm font-semibold text-foreground mb-3">Momentum Architecture</h3>
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
        Nodes connect and flow. As patterns emerge, the network uncovers new pathways. Nodes grow larger as you pay — the system learns your choices and discovers emerging patterns.
      </motion.p>
    </motion.div>
  );
}