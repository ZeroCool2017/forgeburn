import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';

// Obsidian-style "graph view" — nodes are loans, edges show interest flow and payoff order
// Pure SVG, no external deps

const W = 420;
const H = 280;
const CX = W / 2;
const CY = H / 2;

function polarToXY(angle, r) {
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  };
}

function getFloatingOffset(nodeId, time) {
  // Deterministic floating based on node ID
  const seed = parseInt(nodeId.slice(0, 8), 16) || 0;
  const phase1 = (seed % 1000) / 1000 * Math.PI * 2;
  const phase2 = ((seed >> 8) % 1000) / 1000 * Math.PI * 2;
  
  const t = time / 1000;
  const floatX = Math.sin(t * 0.8 + phase1) * 4 + Math.sin(t * 0.3 + phase1 * 2) * 2;
  const floatY = Math.cos(t * 0.9 + phase2) * 3.5 + Math.cos(t * 0.4 + phase2 * 1.5) * 1.5;
  const scaleFloat = 1 + (Math.sin(t * 0.5 + phase1) * 0.08 + Math.sin(t * 0.35 + phase2) * 0.06);
  
  return { floatX, floatY, scaleFloat };
}

function NodeLabel({ x, y, label, value, color, isCenter }) {
  return (
    <g>
      {isCenter ? (
        <>
          <circle cx={x} cy={y} r={28} fill="hsl(258,80%,8%)" stroke={color} strokeWidth={1.5} />
          <text x={x} y={y - 4} textAnchor="middle" fill={color} fontSize={9} fontFamily="monospace" fontWeight="700">
            TOTAL
          </text>
          <text x={x} y={y + 8} textAnchor="middle" fill="hsl(240,10%,88%)" fontSize={8} fontFamily="monospace">
            {value}
          </text>
        </>
      ) : (
        <>
          <circle cx={x} cy={y} r={18} fill="hsl(0,0%,9%)" stroke={color} strokeWidth={1.2} />
          <text x={x} y={y + 3} textAnchor="middle" fill={color} fontSize={8} fontFamily="monospace" fontWeight="600">
            {label}
          </text>
        </>
      )}
    </g>
  );
}

export default function SystemsMapWidget({ loans, schedule }) {
  const [hovered, setHovered] = useState(null);
  const [time, setTime] = useState(0);
  const svgRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 16);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const nodes = useMemo(() => {
    if (!loans.length) return [];
    const r = Math.min(100, 40 + loans.length * 12);
    return loans.map((loan, i) => {
      const angle = (i / loans.length) * 2 * Math.PI - Math.PI / 2;
      const pos = polarToXY(angle, r);
      const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
      const progress = 1 - (loan.current_balance / (loan.original_balance || loan.current_balance));
      // Monthly interest cost
      const monthlyInterest = (loan.current_balance * loan.interest_rate / 100) / 12;
      return {
        ...pos,
        id: loan.id,
        name: loan.name.length > 8 ? loan.name.slice(0, 7) + '…' : loan.name,
        fullName: loan.name,
        color: cat.color,
        emoji: cat.emoji,
        balance: loan.current_balance,
        rate: loan.interest_rate,
        monthlyInterest,
        progress,
        category: loan.category,
      };
    });
  }, [loans]);

  const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
  const totalMonthlyInterest = nodes.reduce((s, n) => s + n.monthlyInterest, 0);

  if (!loans.length) return null;

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      {/* Obsidian dot grid */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(hsl(258,80%,68%) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="obs-label mb-1">system map</p>
            <h3 className="text-sm font-bold text-foreground">Debt Graph View</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-muted-foreground">monthly drain</p>
            <p className="text-sm font-black font-mono text-destructive">{formatCurrency(totalMonthlyInterest)}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          {/* SVG graph */}
          <div className="flex-1 min-w-0">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ maxHeight: 220 }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Edges — lines from center to each node */}
              {nodes.map((node, i) => {
                const isHov = hovered === node.id;
                // Edge thickness = relative monthly interest
                const edgeW = Math.max(0.5, Math.min(4, (node.monthlyInterest / (totalMonthlyInterest || 1)) * 12));
                return (
                  <g key={node.id}>
                    {/* Pulsing interest flow line */}
                    <line
                      x1={CX} y1={CY}
                      x2={node.x} y2={node.y}
                      stroke={node.color}
                      strokeWidth={edgeW}
                      strokeOpacity={isHov ? 0.9 : 0.25}
                      strokeDasharray={isHov ? 'none' : '4 6'}
                      filter={isHov ? 'url(#glow)' : undefined}
                    />
                    {/* Progress arc around node */}
                    {node.progress > 0 && (() => {
                      const r = 20;
                      const circumference = 2 * Math.PI * r;
                      const arc = circumference * node.progress;
                      const startAngle = -Math.PI / 2;
                      const x1 = node.x + r * Math.cos(startAngle);
                      const y1 = node.y + r * Math.sin(startAngle);
                      const endAngle = startAngle + node.progress * 2 * Math.PI;
                      const x2 = node.x + r * Math.cos(endAngle);
                      const y2 = node.y + r * Math.sin(endAngle);
                      const large = node.progress > 0.5 ? 1 : 0;
                      return (
                        <path
                          d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
                          fill="none"
                          stroke={node.color}
                          strokeWidth={1.5}
                          strokeOpacity={0.5}
                          strokeLinecap="round"
                        />
                      );
                    })()}
                  </g>
                );
              })}

              {/* Center node */}
              <NodeLabel
                x={CX} y={CY}
                label="TOTAL"
                value={formatCurrency(totalDebt)}
                color="hsl(258,80%,68%)"
                isCenter
              />

              {/* Loan nodes */}
              {nodes.map((node) => {
                const { floatX, floatY, scaleFloat } = getFloatingOffset(node.id, time);
                const floatedX = node.x + floatX;
                const floatedY = node.y + floatY;

                return (
                  <g
                    key={node.id}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <circle cx={floatedX} cy={floatedY} r={24} fill="transparent" />
                    {/* Pulsing glow halo */}
                    <circle
                      cx={floatedX} cy={floatedY}
                      r={24 * scaleFloat}
                      fill={node.color}
                      fillOpacity={0.08 * (scaleFloat - 0.92)}
                    />
                    <NodeLabel
                      x={floatedX} y={floatedY}
                      label={node.name}
                      color={node.color}
                    />
                    {/* Emoji label below */}
                    <text x={floatedX} y={floatedY + 28} textAnchor="middle" fontSize={10}>
                      {node.emoji}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sidebar legend */}
          <div className="w-36 shrink-0 space-y-2 pt-2">
            <p className="obs-label mb-2">nodes</p>
            {nodes.map(node => (
              <motion.div
                key={node.id}
                onHoverStart={() => setHovered(node.id)}
                onHoverEnd={() => setHovered(null)}
                className={`rounded-lg px-2.5 py-1.5 border transition-all cursor-default ${
                  hovered === node.id
                    ? 'border-primary/40 bg-primary/8'
                    : 'border-border/20 bg-secondary/20'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: node.color }} />
                  <p className="text-[10px] font-mono text-foreground truncate">{node.fullName}</p>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">{node.rate}% · {formatCurrency(node.monthlyInterest)}/mo</p>
                <div className="w-full h-0.5 bg-border/20 rounded mt-1">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${node.progress * 100}%`, background: node.color, opacity: 0.7 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer callout */}
        {hovered && (() => {
          const n = nodes.find(n => n.id === hovered);
          if (!n) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 obs-callout py-2"
            >
              <p className="text-xs font-mono text-foreground/80">
                <span style={{ color: n.color }}>{n.fullName}</span>
                {' '}— draining{' '}
                <span className="text-destructive">{formatCurrency(n.monthlyInterest)}</span>
                {' '}in interest every month at {n.rate}% APR.{' '}
                {n.progress > 0.5
                  ? `Over halfway — keep the pressure on.`
                  : `${Math.round(n.progress * 100)}% paid off. Every payment bends the curve.`}
              </p>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}