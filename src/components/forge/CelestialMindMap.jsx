import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Sparkles } from 'lucide-react';

/**
 * Momentum Field — evolving, responsive system that grows smarter
 * Nodes represent loans (large) and spending habits (small)
 * Connections show how spending influences debt growth
 */

export default function CelestialMindMap({ loans, schedule }) {
  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
  });
  const svgRef = useRef(null);
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);

  const W = 540;
  const H = 380;
  const CX = W / 2;
  const CY = H / 2;

  // Initialize particles based on loans + habits
  useEffect(() => {
    if (!loans.length) return;
    
    const loanParticles = loans.map((loan, i) => {
      const angle = (i / loans.length) * Math.PI * 2;
      const r = 70 + i * 18;
      const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      return {
        id: `loan-${loan.id}`,
        type: 'loan',
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
        baseRadius: 10,
      };
    });

    // Habit particles orbit in a second ring
    const habitParticles = habits.map((habit, i) => {
      const angle = (i / Math.max(1, habits.length)) * Math.PI * 2 + Math.PI / 4;
      const r = 130;
      return {
        id: `habit-${habit.id}`,
        type: 'habit',
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        growth: 0.3,
        baseRadius: 5,
        monthly: habit.monthly_average,
      };
    });
    
    setParticles([...loanParticles, ...habitParticles]);
  }, [loans, habits]);

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

      // Draw connections — glowing neural pathways
      currentParticles.forEach((p, i) => {
        currentParticles.slice(i + 1).forEach(q => {
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          // Loans connect to each other; habits connect to loans
          const isHabitToLoan = (p.type === 'habit' && q.type === 'loan') || (p.type === 'loan' && q.type === 'habit');
          const isLoanToLoan = p.type === 'loan' && q.type === 'loan';

          let maxDist = 0;
          if (isLoanToLoan) maxDist = 220;
          else if (isHabitToLoan) maxDist = 160;

          if (d < maxDist && maxDist > 0) {
            const strength = 1 - (d / maxDist);
            const pColor = parseInt(p.color.slice(1), 16);
            const qColor = parseInt(q.color.slice(1), 16);
            const pR = (pColor >> 16) & 255;
            const pG = (pColor >> 8) & 255;
            const pB = pColor & 255;
            const qR = (qColor >> 16) & 255;
            const qG = (qColor >> 8) & 255;
            const qB = qColor & 255;

            const pulse = 0.6 + Math.sin(currentTime * 0.005) * 0.4;

            // Main connection with gradient
            const gradient = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            gradient.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, ${0.2 * strength * pulse})`);
            gradient.addColorStop(0.5, `rgba(${(pR + qR) / 2}, ${(pG + qG) / 2}, ${(pB + qB) / 2}, ${0.25 * strength * pulse})`);
            gradient.addColorStop(1, `rgba(${qR}, ${qG}, ${qB}, ${0.2 * strength * pulse})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = isHabitToLoan ? 0.6 + strength * 0.8 : 0.8 + strength * 1.5;
            ctx.lineCap = 'round';
            ctx.setLineDash(isHabitToLoan ? [4, 4] : []);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Glow halo
            ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${0.08 * strength * pulse})`;
            ctx.lineWidth = isHabitToLoan ? 2 : 3 + strength * 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();

            // Flowing particles
            const t = (currentTime * 0.001) % 1;
            const flowX = p.x + (q.x - p.x) * t;
            const flowY = p.y + (q.y - p.y) * t;
            const flowGlow = Math.sin(currentTime * 0.008) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(${(pR + qR) / 2}, ${(pG + qG) / 2}, ${(pB + qB) / 2}, ${0.6 * flowGlow})`;
            ctx.beginPath();
            ctx.arc(flowX, flowY, isHabitToLoan ? 0.8 : 1.2 + strength * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });

      // Draw nodes — Obsidian-like neural network (minimal, breathing)
      const globalBreath = 1 + Math.sin(currentTime * 0.006) * 0.12;

      currentParticles.forEach(p => {
        let r;

        if (p.type === 'loan') {
          const progress = 1 - (p.balance / p.original);
          const payoffSize = 5 + progress * 10;
          const baseSize = 8 + p.growth * 6;
          r = (baseSize + payoffSize) * globalBreath;
        } else {
          r = (p.baseRadius + p.growth * 3) * (1 + Math.sin(currentTime * 0.01) * 0.1);
        }

        const rgbColor = parseInt(p.color.slice(1), 16);
        const rVal = (rgbColor >> 16) & 255;
        const gVal = (rgbColor >> 8) & 255;
        const bVal = rgbColor & 255;

        // Soft, ethereal outer glow (life-like breathing)
        const glowGrad = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, r * 3);
        glowGrad.addColorStop(0, `rgba(${rVal}, ${gVal}, ${bVal}, 0.25)`);
        glowGrad.addColorStop(0.5, `rgba(${rVal}, ${gVal}, ${bVal}, 0.08)`);
        glowGrad.addColorStop(1, `rgba(${rVal}, ${gVal}, ${bVal}, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core node — minimal, soft
        ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle shimmer border
        const shimmer = 0.3 + Math.sin(currentTime * 0.015 + p.id.charCodeAt(0)) * 0.2;
        ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${shimmer * 0.4})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Progress ring — subtle (loans only)
        if (p.type === 'loan') {
          const progress = 1 - (p.balance / p.original);
          if (progress > 0.02) {
            const ringRadius = r + 3.5;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + progress * 2 * Math.PI;
            ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.5)`;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(p.x, p.y, ringRadius, startAngle, endAngle);
            ctx.stroke();
          }
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
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Living Mind Map</h3>
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
        Living mind map. Nodes breathe as your debt shifts. Larger nodes are your chains; smaller are your patterns. Lines show influence. Watch them evolve.
      </motion.p>
    </motion.div>
  );
}