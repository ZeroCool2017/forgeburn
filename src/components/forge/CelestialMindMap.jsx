import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { playElectroplantonTone } from '@/lib/musicalInterface';

const W = 540;
const H = 380;
const CX = W / 2;
const CY = H / 2;

function colorToRgb(color) {
  const value = Number.parseInt(String(color || '#a78bfa').replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function influenceScore(habit, loan, totalBalance) {
  const habitCategory = habit.category || habit.pattern || '';
  const sameCategory = habitCategory && habitCategory === loan.category;
  const balanceShare = (Math.max(0, Number(loan.current_balance) || 0) / Math.max(totalBalance, 1));
  const rate = Math.max(0, Number(loan.interest_rate) || 0);
  const monthly = Math.max(0, Number(habit.monthly_average) || 0);
  return (sameCategory ? 4 : 1) + balanceShare * 2 + rate / 25 + monthly / 1000;
}

/**
 * Living Mind Map — Momentum Field
 * Blends the original high-fidelity neural network of loans, habits, and floating micro-particles
 * with tactile Electroplankton wiggling tails, expanding ripples, and vertical pitch-mapped chimes.
 */
export default function CelestialMindMap({ loans }) {
  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
  });
  const canvasRef = useRef(null);
  const particleStateRef = useRef([]);
  const dragIdRef = useRef(null);
  const activePointerIdRef = useRef(null);
  const ripplesRef = useRef([]);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const collisionCooldownsRef = useRef({});
  const [isDragging, setIsDragging] = useState(false);
  const [particles, setParticles] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // Initialize nodes (loans, habits, and floating micro-particles) to match the style before
  useEffect(() => {
    if (!loans.length) {
      setParticles([]);
      particleStateRef.current = [];
      return undefined;
    }

    const totalBalance = loans.reduce((sum, loan) => sum + Math.max(0, Number(loan.current_balance) || 0), 0);
    
    // 1. Debt nodes (loans)
    const loanParticles = loans.map((loan, index) => {
      const angle = (index / Math.max(1, loans.length)) * Math.PI * 2 - Math.PI / 2;
      const radius = 40 + loans.length * 4;
      const category = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      return {
        id: `loan-${loan.id}`,
        dataId: loan.id,
        type: 'loan',
        x: CX + Math.cos(angle) * radius,
        y: CY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        balance: Number(loan.current_balance) || 0,
        original: Math.max(1, Number(loan.original_balance) || Number(loan.current_balance) || 1),
        name: loan.name,
        color: category.color,
        category: loan.category,
        growth: 0.5 + Math.random() * 0.5,
        baseRadius: 10 + Math.random() * 4,
        influences: [],
      };
    });

    // 2. Spending habit nodes (organisms)
    const habitParticles = habits.map((habit, index) => {
      const angle = (index / Math.max(1, habits.length)) * Math.PI * 2 + Math.PI / 4;
      const radius = 135 + habits.length * 2;
      const category = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.other;
      const rankedLoans = [...loans]
        .sort((a, b) => influenceScore(habit, b, totalBalance) - influenceScore(habit, a, totalBalance))
        .slice(0, Math.min(3, loans.length));
      return {
        id: `habit-${habit.id}`,
        dataId: habit.id,
        type: 'habit',
        x: CX + Math.cos(angle) * radius,
        y: CY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        name: habit.name,
        color: habit.color || category.color,
        category: habit.category,
        monthly: Number(habit.monthly_average) || 0,
        growth: 0.2 + Math.random() * 0.3,
        baseRadius: 6 + Math.random() * 3,
        influences: rankedLoans.map(loan => loan.id),
      };
    });

    // 3. Visual dust micro-particles clustered around debts to bring back the rich design style before
    const microParticles = loans.flatMap((loan, idx) => 
      Array.from({ length: 3 + Math.floor(Math.random() * 2) }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 25 + Math.random() * 45;
        const category = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
        return {
          id: `micro-${loan.id}-${i}`,
          type: 'micro',
          x: CX + radius * Math.cos(angle),
          y: CY + radius * Math.sin(angle),
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          color: category.color,
          growth: 0.1 + Math.random() * 0.2,
          baseRadius: 1.5 + Math.random() * 2.0,
        };
      })
    );

    const next = [...loanParticles, ...habitParticles, ...microParticles];
    particleStateRef.current = next;
    setParticles(next);
    return undefined;
  }, [loans, habits]);

  // Main high fidelity render & physics animation loop
  useEffect(() => {
    if (!canvasRef.current || !particles.length) return undefined;
    const canvas = canvasRef.current;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    let frame;
    let currentTime = 0;

    const animate = () => {
      currentTime += 16;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      
      // Draw grid dots
      ctx.fillStyle = 'rgba(140, 100, 240, 0.025)';
      for (let x = 24; x < W; x += 24) {
        for (let y = 24; y < H; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Electroplankton expanding water ripples
      ctx.save();
      ripplesRef.current = ripplesRef.current.filter(r => {
        r.radius += 2.0;
        r.alpha -= 0.016;
        if (r.alpha <= 0) return false;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.r}, ${r.g}, ${r.b}, ${r.alpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.r}, ${r.g}, ${r.b}, ${r.alpha * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return true;
      });
      ctx.restore();

      const state = particleStateRef.current;

      // Update fluid drift physics & collision repulsion
      state.forEach(p => {
        if (dragIdRef.current === p.id) return;
        
        // Soft gravity pull to center
        const toCenterX = CX - p.x;
        const toCenterY = CY - p.y;
        const dist = Math.hypot(toCenterX, toCenterY) || 1;
        
        p.vx += (toCenterX / dist) * 0.005;
        p.vy += (toCenterY / dist) * 0.005;

        // Active swimming drift noise (wiggling)
        p.vx += Math.cos(currentTime * 0.0016 + p.id.length) * 0.03;
        p.vy += Math.sin(currentTime * 0.0014 + p.id.length) * 0.03;

        // Repel other nodes to avoid clustering overlapping
        state.forEach(other => {
          if (other.id === p.id) return;
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const d = Math.hypot(dx, dy) || 0.1;
          const minDist = p.type === 'loan' ? 38 : p.type === 'habit' ? 24 : 14;
          if (d < minDist) {
            const push = (minDist - d) * 0.012;
            p.vx -= (dx / d) * push;
            p.vy -= (dy / d) * push;
          }
        });

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // Keep inside bounds
        const margin = p.type === 'loan' ? 28 : 18;
        p.x = Math.max(margin, Math.min(W - margin, p.x));
        p.y = Math.max(margin, Math.min(H - margin, p.y));
      });

      // Electroplankton Proximity Bridges of Glowing Light
      const draggedNode = state.find(p => p.id === dragIdRef.current);
      if (draggedNode) {
        state.forEach(p => {
          if (p.id === draggedNode.id) return;
          const dist = Math.hypot(p.x - draggedNode.x, p.y - draggedNode.y);
          if (dist < 52) {
            const [r1, g1, b1] = colorToRgb(draggedNode.color);
            const [r2, g2, b2] = colorToRgb(p.color);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${(r1 + r2) / 2}, ${(g1 + g2) / 2}, ${(b1 + b2) / 2}, 0.5)`;
            ctx.lineWidth = 2.0;
            ctx.moveTo(draggedNode.x, draggedNode.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            // Sound chime cooldown trigger
            const pairId = `${draggedNode.id}-${p.id}`;
            const now = Date.now();
            if (!collisionCooldownsRef.current[pairId] || now - collisionCooldownsRef.current[pairId] > 1500) {
              collisionCooldownsRef.current[pairId] = now;
              playElectroplantonTone(Math.min(1, Math.max(0, 1 - (p.y / H))), 0.85);
              ripplesRef.current.push({
                x: (draggedNode.x + p.x) / 2,
                y: (draggedNode.y + p.y) / 2,
                radius: 12,
                alpha: 0.8,
                r: Math.floor((r1 + r2) / 2),
                g: Math.floor((g1 + g2) / 2),
                b: Math.floor((b1 + b2) / 2),
              });
            }
          }
        });
      }

      // Draw Connections (Dense Neural Network lines with flow particles)
      const pulse = 0.55 + Math.sin(currentTime * 0.006) * 0.25;
      state.filter(p => p.type === 'habit').forEach(habit => {
        habit.influences.forEach(loanId => {
          const loan = state.find(candidate => candidate.type === 'loan' && candidate.dataId === loanId);
          if (!loan) return;
          const distance = Math.hypot(loan.x - habit.x, loan.y - habit.y);
          const strength = Math.max(0.12, 1 - distance / 260);
          const [hr, hg, hb] = colorToRgb(habit.color);
          const [lr, lg, lb] = colorToRgb(loan.color);
          
          const gradient = ctx.createLinearGradient(habit.x, habit.y, loan.x, loan.y);
          gradient.addColorStop(0, `rgba(${hr},${hg},${hb},${0.18 * strength * pulse})`);
          gradient.addColorStop(1, `rgba(${lr},${lg},${lb},${0.35 * strength * pulse})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8 + strength * 1.5;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(habit.x, habit.y);
          ctx.lineTo(loan.x, loan.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Flow specs (swimming particles of light)
          const t = (currentTime * 0.0012 + habit.id.length / 10) % 1;
          ctx.fillStyle = `rgba(${(hr + lr) / 2},${(hg + lg) / 2},${(hb + lb) / 2},${0.45 * strength})`;
          ctx.beginPath();
          ctx.arc(habit.x + (loan.x - habit.x) * t, habit.y + (loan.y - habit.y) * t, 1.3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // Render all Nodes
      const globalBreath = 1 + Math.sin(currentTime * 0.004) * 0.08;
      
      state.forEach(p => {
        const progress = p.type === 'loan' ? Math.max(0, Math.min(1, 1 - p.balance / p.original)) : 0;
        const paidOff = p.type === 'loan' && p.balance <= 0;
        
        let radius = 6;
        if (p.type === 'loan') {
          radius = (p.baseRadius + progress * 8) * globalBreath;
        } else if (p.type === 'habit') {
          radius = (p.baseRadius + Math.min(5, p.monthly / 150)) * globalBreath;
        } else {
          radius = p.baseRadius * (0.95 + Math.sin(currentTime * 0.007 + p.id.length) * 0.15);
        }

        const [r, g, b] = paidOff ? [52, 211, 153] : colorToRgb(p.color);
        ctx.save();

        // 1. Draw swimming flagella tail for habits
        if (p.type === 'habit') {
          const angle = Math.atan2(p.y - CY, p.x - CX) + Math.PI;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${r},${g},${b},0.45)`;
          ctx.lineWidth = 1.2;
          ctx.moveTo(p.x, p.y);
          let tx = p.x;
          let ty = p.y;
          for (let i = 1; i <= 3; i++) {
            const tailAngle = angle + Math.sin(currentTime * 0.012 + i + p.id.length) * 0.85;
            tx += Math.cos(tailAngle) * (radius * 0.75);
            ty += Math.sin(tailAngle) * (radius * 0.75);
            ctx.lineTo(tx, ty);
          }
          ctx.stroke();
        }

        // 2. Draw core nodes with glows
        ctx.fillStyle = `rgba(${r},${g},${b},${p.type === 'micro' ? 0.45 : 0.85})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.45)`;
        ctx.shadowBlur = p.type === 'loan' ? 12 : p.type === 'habit' ? 6 : 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = `rgba(${r},${g},${b},${p.type === 'micro' ? 0.5 : 0.9})`;
        ctx.lineWidth = p.type === 'loan' ? 1.2 : p.type === 'micro' ? 0.4 : 0.8;
        ctx.stroke();

        // 3. Paid-off checkmark pulse ring
        if (p.type === 'loan' && progress > 0 && !paidOff) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 4, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
          ctx.strokeStyle = `rgba(${r},${g},${b},0.65)`;
          ctx.stroke();
        }
        if (paidOff) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius + 5 + Math.sin(currentTime * 0.006) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(52,211,153,0.55)`;
          ctx.stroke();
        }
        ctx.restore();
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [particles]);

  const eventPoint = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  };

  const hitTest = point => [...particleStateRef.current].reverse().find(p => {
    if (p.type === 'micro') return false; // don't drag tiny visual dust particles
    const radius = p.type === 'loan' ? 25 : 18;
    return Math.hypot(point.x - p.x, point.y - p.y) <= radius;
  });

  const handlePointerDown = event => {
    const node = hitTest(eventPoint(event));
    if (!node) return;
    dragIdRef.current = node.id;
    activePointerIdRef.current = event.pointerId;
    setIsDragging(true);
    setSelectedNode(node);
    
    lastXRef.current = node.x;
    lastYRef.current = node.y;
    const normalizedValue = Math.min(1, Math.max(0, 1 - (node.y / H)));
    playElectroplantonTone(normalizedValue, 0.7);
    const [r, g, b] = colorToRgb(node.color);
    ripplesRef.current.push({ x: node.x, y: node.y, radius: 10, alpha: 0.8, r, g, b });

    canvasRef.current.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = event => {
    if (!dragIdRef.current) return;
    const node = particleStateRef.current.find(p => p.id === dragIdRef.current);
    if (!node) return;
    const point = eventPoint(event);
    node.x = Math.max(18, Math.min(W - 18, point.x));
    node.y = Math.max(18, Math.min(H - 18, point.y));
    node.vx = 0;
    node.vy = 0;
    setSelectedNode({ ...node });

    const dist = Math.hypot(node.x - lastXRef.current, node.y - lastYRef.current);
    if (dist > 22) {
      lastXRef.current = node.x;
      lastYRef.current = node.y;
      const normalizedValue = Math.min(1, Math.max(0, 1 - (node.y / H)));
      playElectroplantonTone(normalizedValue, 0.45);
      const [r, g, b] = colorToRgb(node.color);
      ripplesRef.current.push({ x: node.x, y: node.y, radius: 10, alpha: 0.7, r, g, b });
    }
  };

  const handlePointerEnd = () => {
    const pointerId = activePointerIdRef.current;
    if (pointerId !== null) canvasRef.current?.releasePointerCapture?.(pointerId);
    
    if (dragIdRef.current) {
      const node = particleStateRef.current.find(p => p.id === dragIdRef.current);
      if (node) {
        const normalizedValue = Math.min(1, Math.max(0, 1 - (node.y / H)));
        playElectroplantonTone(normalizedValue, 0.9);
        const [r, g, b] = colorToRgb(node.color);
        ripplesRef.current.push({ x: node.x, y: node.y, radius: 12, alpha: 0.95, r, g, b });
      }
    }

    activePointerIdRef.current = null;
    dragIdRef.current = null;
    setIsDragging(false);
  };

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
      <div className="mb-4 space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">Living Mind Map</h3>
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          Your financial ecosystem in motion. <span className="font-semibold text-foreground">Large glowing spheres</span> are your debts; <span className="font-semibold text-foreground">small floating, wiggling organisms</span> are your monthly habits.
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground/80">
          Glowing dotted threads show calculated <span className="text-primary font-medium">influence paths</span> where spending habits feed specific debts. 
        </p>
        <p className="text-[10px] italic text-muted-foreground/60">
          Drag the organisms to play the feedback loop. Higher vertical positions on the screen synthesize higher musical notes in the pentatonic scale.
        </p>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-border/20 bg-background/30">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          aria-label="Interactive living financial mind map. Drag debt and spending pattern bubbles."
        />
        {selectedNode && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border/30 bg-background/80 px-3 py-2 backdrop-blur-sm">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{selectedNode.type === 'loan' ? 'Debt' : 'Pattern'}</p>
            <p className="text-xs text-foreground">{selectedNode.name}</p>
            {selectedNode.type === 'loan' ? (
              <p className="text-[10px] font-mono text-muted-foreground">${selectedNode.balance.toLocaleString()} remaining</p>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground">${selectedNode.monthly.toFixed(0)}/mo · {selectedNode.influences.length} linked debts</p>
            )}
          </div>
        )}
      </div>
      <div className="sr-only" aria-label="Living mind map data">
        <p>Debt nodes and spending pattern nodes are connected by calculated influence paths.</p>
        <ul>
          {loans.map(loan => <li key={`accessible-loan-${loan.id}`}>Debt: {loan.name}, ${(Number(loan.current_balance) || 0).toLocaleString()} remaining.</li>)}
          {habits.map(habit => {
            const linkedLoans = [...loans]
              .sort((a, b) => influenceScore(habit, b, loans.reduce((sum, item) => sum + (Number(item.current_balance) || 0), 0)) - influenceScore(habit, a, loans.reduce((sum, item) => sum + (Number(item.current_balance) || 0), 0)))
              .slice(0, Math.min(3, loans.length));
            return <li key={`accessible-habit-${habit.id}`}>Pattern: {habit.name}, ${(Number(habit.monthly_average) || 0).toFixed(0)} per month, linked to {linkedLoans.map(loan => loan.name).join(', ') || 'no debts yet'}.</li>;
          })}
        </ul>
      </div>
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
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] text-muted-foreground/80 mt-4 leading-relaxed border-t border-border/10 pt-3"
      >
        <span className="font-semibold text-foreground">How to read the map:</span> Debt nodes grow larger based on their remaining balance; spending pattern nodes pulse in size based on their monthly cost; influence threads are automatically computed from category matches, relative balance sizes, interest rates (APR), and monthly spending amounts.
      </motion.p>
    </motion.div>
  );
}
