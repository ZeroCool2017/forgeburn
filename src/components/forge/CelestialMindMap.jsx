import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { Sparkles } from 'lucide-react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playFieldTone, playFieldBass, playNodeResonance } from '@/lib/orchestraSound';

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
  const positionsRef = useRef([]);
  const grabbedRef = useRef(null);
  const trailRef = useRef([]);
  const dotElRef = useRef(null);
  const pointerTargetRef = useRef({ x: -100, y: -100, active: false });
  const pointerDotRef = useRef({ x: -100, y: -100, opacity: 0 });
  const { enabled } = useAmbientSoundContext();

  const W = 540;
  const H = 380;
  const CX = W / 2;
  const CY = H / 2;
  const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  // Initialize particles based on loans + habits
  useEffect(() => {
    if (!loans.length) return;
    
    const loanParticles = loans.map((loan, i) => {
      // Dense center clustering
      const angle = (i / loans.length) * Math.PI * 2;
      const r = 20 + i * 8 + Math.random() * 15;
      const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      return {
        id: `loan-${loan.id}`,
        type: 'loan',
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        balance: loan.current_balance,
        original: loan.original_balance || loan.current_balance,
        category: loan.category,
        name: loan.name,
        emoji: cat.emoji,
        color: cat.color,
        growth: 0.5 + Math.random() * 0.5,
        baseRadius: 6 + Math.random() * 6,
      };
    });

    // Habit particles — sparse outer ring
    const habitParticles = habits.map((habit, i) => {
      const angle = (i / Math.max(1, habits.length)) * Math.PI * 2 + Math.random() * 0.5;
      const r = 90 + Math.random() * 80; // Wider spread
      return {
        id: `habit-${habit.id}`,
        type: 'habit',
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        name: habit.name,
        emoji: habit.emoji,
        color: habit.color,
        growth: 0.2 + Math.random() * 0.3,
        baseRadius: 2 + Math.random() * 4,
        monthly: habit.monthly_average,
      };
    });
    
    // Add more micro-nodes for density (visual complexity)
    const microNodes = loans.flatMap((loan, idx) => 
      Array.from({ length: 3 + Math.floor(Math.random() * 3) }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const r = 30 + Math.random() * 50;
        const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
        return {
          id: `micro-${loan.id}-${i}`,
          type: 'micro',
          x: CX + r * Math.cos(angle),
          y: CY + r * Math.sin(angle),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          color: cat.color,
          growth: 0.1 + Math.random() * 0.2,
          baseRadius: 1 + Math.random() * 2.5,
        };
      })
    );
    
    setParticles([...loanParticles, ...habitParticles, ...microNodes]);
  }, [loans, habits]);

  // Animation loop with requestAnimationFrame for smooth 60fps movement
  useEffect(() => {
    if (!canvasRef.current || !particles.length) return;

    // Set canvas resolution for crisp rendering
    const canvas = canvasRef.current;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    let animationFrameId;
    let currentTime = 0;
    let currentParticles = [...particles];

    const animate = () => {
      currentTime += 16; // ~60fps
      const ctx = canvasRef.current.getContext('2d');
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
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
        // Grabbed node follows the stylus exactly; its physics is suspended
        if (grabbedRef.current && p.id === grabbedRef.current.id) {
          p.x = grabbedRef.current.targetX;
          p.y = grabbedRef.current.targetY;
          p.vx = 0;
          p.vy = 0;
          return { ...p };
        }
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

        // Keep nodes fully inside canvas using their actual radius
        const maxR = p.type === 'loan' ? 28 : p.type === 'habit' ? 14 : 6;
        const margin = maxR + 4;
        if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) * 0.5; }
        if (p.x > W - margin) { p.x = W - margin; p.vx = -Math.abs(p.vx) * 0.5; }
        if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) * 0.5; }
        if (p.y > H - margin) { p.y = H - margin; p.vy = -Math.abs(p.vy) * 0.5; }

        return { ...p, growth: newGrowth };
      });

      // Draw connections — dense chaotic neural network
      currentParticles.forEach((p, i) => {
        currentParticles.slice(i + 1).forEach(q => {
          if (!p.color || !q.color) return;
          
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          // Much denser connections — any nearby node connects
          const isHabitToLoan = (p.type === 'habit' && q.type === 'loan') || (p.type === 'loan' && q.type === 'habit') || (p.type === 'habit' && q.type === 'habit');
          const isLoanToLoan = (p.type === 'loan' && q.type === 'loan') || (p.type === 'loan' && q.type === 'micro') || (p.type === 'micro' && q.type === 'loan') || (p.type === 'micro' && q.type === 'micro');

          let maxDist = 0;
          if (isLoanToLoan) maxDist = 120;
          else if (isHabitToLoan) maxDist = 200;

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

            const pulse = 0.5 + Math.sin(currentTime * 0.006) * 0.5;

            // Main connection with gradient
            const gradient = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
            gradient.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, ${0.15 * strength * pulse})`);
            gradient.addColorStop(0.5, `rgba(${(pR + qR) / 2}, ${(pG + qG) / 2}, ${(pB + qB) / 2}, ${0.2 * strength * pulse})`);
            gradient.addColorStop(1, `rgba(${qR}, ${qG}, ${qB}, ${0.15 * strength * pulse})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = isHabitToLoan ? 0.4 + strength * 0.6 : 0.5 + strength * 1;
            ctx.lineCap = 'round';
            ctx.setLineDash(isHabitToLoan ? [3, 3] : []);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Glow halo (subtle)
            ctx.strokeStyle = `rgba(${pR}, ${pG}, ${pB}, ${0.04 * strength * pulse})`;
            ctx.lineWidth = isHabitToLoan ? 1.5 : 2 + strength * 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();

            // Flowing particles
            if (strength > 0.3) {
              const t = (currentTime * 0.0015) % 1;
              const flowX = p.x + (q.x - p.x) * t;
              const flowY = p.y + (q.y - p.y) * t;
              const flowGlow = Math.sin(currentTime * 0.01) * 0.5 + 0.5;
              ctx.fillStyle = `rgba(${(pR + qR) / 2}, ${(pG + qG) / 2}, ${(pB + qB) / 2}, ${0.4 * flowGlow})`;
              ctx.beginPath();
              ctx.arc(flowX, flowY, isHabitToLoan ? 0.5 : 0.8 + strength * 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      });

      // Draw nodes — chaotic sizes & movement
      const globalBreath = 1 + Math.sin(currentTime * 0.004) * 0.1;

      currentParticles.forEach(p => {
        let r;
        const isPaidOff = p.type === 'loan' && p.balance <= 0;

        if (p.type === 'loan') {
          const progress = 1 - (p.balance / p.original);
          if (isPaidOff) {
            // Paid-off loans shrink down
            r = 8 * globalBreath;
          } else {
            const payoffSize = 4 + progress * 8;
            const baseSize = (p.baseRadius || 8) + p.growth * 5;
            r = (baseSize + payoffSize) * globalBreath;
          }
        } else if (p.type === 'micro') {
          r = (p.baseRadius || 1) * (0.9 + Math.sin(currentTime * 0.008 + p.id.charCodeAt(0)) * 0.15);
        } else {
          r = (p.baseRadius || 5) * (1 + Math.sin(currentTime * 0.007 + p.id.charCodeAt(0)) * 0.12);
        }

        if (!p.color) return;

        // Paid-off color: bright emerald green
        let rVal, gVal, bVal;
        if (isPaidOff) {
          rVal = 52; gVal = 211; bVal = 153; // emerald
        } else {
          const rgbColor = parseInt(p.color.slice(1), 16);
          rVal = (rgbColor >> 16) & 255;
          gVal = (rgbColor >> 8) & 255;
          bVal = rgbColor & 255;
        }

        // Crisp core node (flat fill, no radial gradient to avoid dark center)
        ctx.save();
        ctx.imageSmoothingEnabled = true;

        ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.82)`;
        ctx.beginPath();
        ctx.arc(Math.round(p.x), Math.round(p.y), r, 0, Math.PI * 2);
        ctx.fill();

        // Crisp border ring
        ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.9)`;
        ctx.lineWidth = p.type === 'micro' ? 0.5 : 1.2;
        ctx.beginPath();
        ctx.arc(Math.round(p.x), Math.round(p.y), r, 0, Math.PI * 2);
        ctx.stroke();

        // Progress ring (loans only)
        if (p.type === 'loan' && !isPaidOff) {
          const progress = 1 - (p.balance / p.original);
          if (progress > 0.01) {
            const ringRadius = r + 3;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + progress * 2 * Math.PI;
            ctx.strokeStyle = `rgba(${rVal}, ${gVal}, ${bVal}, 0.5)`;
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(Math.round(p.x), Math.round(p.y), ringRadius, startAngle, endAngle);
            ctx.stroke();
          }
        }

        // Paid-off: draw a checkmark pulse ring
        if (isPaidOff) {
          const pulse = 0.4 + Math.sin(currentTime * 0.006) * 0.3;
          ctx.strokeStyle = `rgba(52, 211, 153, ${pulse})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(Math.round(p.x), Math.round(p.y), r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // No emoji inside bubble — color key shown below

        ctx.restore();
      });

      positionsRef.current = currentParticles.map(p => ({
        x: p.x, y: p.y, type: p.type, balance: p.balance, original: p.original, color: p.color,
      }));

      // Electroplankton-style glowing trail behind the grabbed node
      const grabbed = grabbedRef.current;
      if (grabbed) {
        const gp = currentParticles.find(p => p.id === grabbed.id);
        if (gp) {
          trailRef.current.push({ x: gp.x, y: gp.y, color: gp.color });
          if (trailRef.current.length > 45) trailRef.current.shift();
        }
      } else if (trailRef.current.length) {
        trailRef.current.shift();
      }
      const trail = trailRef.current;
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length;
        const hex = trail[i].color ? parseInt(trail[i].color.slice(1), 16) : 0x8c64f0;
        ctx.strokeStyle = `rgba(${(hex >> 16) & 255}, ${(hex >> 8) & 255}, ${hex & 255}, ${a * 0.5})`;
        ctx.lineWidth = 1 + a * 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }

      // Eased pointer glow — drags a little behind the stylus, nearly transparent
      if (dotElRef.current) {
        const t = pointerTargetRef.current;
        const cur = pointerDotRef.current;
        cur.x += (t.x - cur.x) * 0.2;
        cur.y += (t.y - cur.y) * 0.2;
        const targetOpacity = t.active ? 0.5 : 0;
        cur.opacity += (targetOpacity - cur.opacity) * 0.12;
        dotElRef.current.style.transform = `translate3d(${cur.x - 16}px, ${cur.y - 16}px, 0)`;
        dotElRef.current.style.opacity = cur.opacity;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [particles]);

  // Grab a node and drag it like an Electroplankton organism — it follows your
  // stylus and leaves a glowing trail, and lifting it up and down sweeps the pitch
  // like a theremin. A deep Endel-style bass swell rises on grab.
  const nodeAtPoint = (clientX, clientY, rect) => {
    const cx = (clientX - rect.left) * (W / rect.width);
    const cy = (clientY - rect.top) * (H / rect.height);
    let nearest = null;
    let bestD = 34;
    for (const p of positionsRef.current) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestD) { bestD = d; nearest = p; }
    }
    return nearest;
  };

  // The pointer glow trails a little behind the stylus and is nearly transparent —
  // a soft, fun presence that draws you in instead of a hard cursor.
  const updatePointerDot = (e, active) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active };
  };

  const handlePointerDown = (e) => {
    updatePointerDot(e, true);
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const n = nodeAtPoint(e.clientX, e.clientY, rect);
    if (!n) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    const pitch = Math.round((1 - cy / H) * 7);
    grabbedRef.current = { id: n.id, targetX: cx, targetY: cy, lastPitch: pitch, lastPlayAt: performance.now() };
    playFieldBass(enabled, 0.8);
    playFieldTone(pitch, enabled, 2.2);
  };

  const handlePointerMove = (e) => {
    updatePointerDot(e, true);
    if (!enabled || !grabbedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    grabbedRef.current.targetX = cx;
    grabbedRef.current.targetY = cy;
    const pitch = Math.round((1 - cy / H) * 7);
    const now = performance.now();
    if (pitch !== grabbedRef.current.lastPitch && now - grabbedRef.current.lastPlayAt > 120) {
      playFieldTone(pitch, enabled, 1.8);
      grabbedRef.current.lastPitch = pitch;
      grabbedRef.current.lastPlayAt = now;
    }
  };

  const handlePointerUp = () => { grabbedRef.current = null; };
  const handlePointerEnter = (e) => updatePointerDot(e, true);
  const handlePointerLeave = (e) => { updatePointerDot(e, false); grabbedRef.current = null; };

  // Passive orchestra layer — a random node "breathes" a slow tone now and then.
  // Sparse and disconnected by design, like a living field humming to itself.
  useEffect(() => {
    if (!enabled || !particles.length) return;
    let timer;
    const breathe = () => {
      const pick = particles[Math.floor(Math.random() * particles.length)];
      if (pick && pick.type === 'loan' && pick.original) {
        const progress = 1 - (pick.balance / pick.original);
        playNodeResonance(Math.round(Math.max(0, Math.min(1, progress)) * 7), true, 3.0);
      } else {
        playNodeResonance(Math.floor(Math.random() * 8), true, 3.0);
      }
      timer = setTimeout(breathe, 9000 + Math.random() * 7000);
    };
    timer = setTimeout(breathe, 6000 + Math.random() * 4000);
    return () => clearTimeout(timer);
  }, [enabled, particles]);

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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          style={{ display: 'block', width: '100%', height: 'auto', cursor: 'none', touchAction: 'none' }}
        />
        {/* Soft pointer glow — nearly transparent, trails a little behind the stylus */}
        <div
          ref={dotElRef}
          className="pointer-events-none absolute top-0 left-0 rounded-full"
          style={{
            width: 32,
            height: 32,
            opacity: 0,
            background: 'radial-gradient(circle, hsl(270,80%,72%,0.9) 0%, hsl(270,80%,60%,0.35) 35%, transparent 70%)',
            mixBlendMode: 'screen',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Color key */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, cat]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <span className="text-[10px] font-mono text-muted-foreground">{cat.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#34d39a' }} />
          <span className="text-[10px] font-mono text-muted-foreground">Paid off</span>
        </div>
      </div>

      {/* Footer info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[10px] font-mono text-muted-foreground/70 mt-4 leading-relaxed"
      >
        Living mind map. Nodes breathe as your debt shifts. Grab a node and drag it like an Electroplankton — it leaves a glowing trail and sings as you lift it up and down, with a deep bass rising on grab. Lines show influence. Watch them evolve.
      </motion.p>
    </motion.div>
  );
}