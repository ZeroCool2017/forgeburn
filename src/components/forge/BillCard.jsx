import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { formatCurrency } from '@/lib/loanCalculations';
import { getBillPsychology } from '@/lib/billPsychology';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone, playFieldTone, playFieldBass, playDataBloom } from '@/lib/orchestraSound';

// Jack Butcher bill card — huge number, thin label, one bar, one accent.
// The bar is a living instrument: drag across it to play the bill as a tone
// (Electroplankton scrub), it breathes (Endel), and a light travels it.
export default function BillCard({ bill, totalOutflow, onToggleType, onDelete }) {
  const [open, setOpen] = useState(false);
  const { enabled } = useAmbientSoundContext();
  const psy = getBillPsychology(bill.category, bill.name);
  const amount = bill.monthly_average || 0;
  const share = totalOutflow > 0 ? Math.round((amount / totalOutflow) * 100) : 0;
  const isVariable = bill.bill_type === 'variable';

  const barRef = useRef(null);
  const lastPlayRef = useRef(0);
  const draggingRef = useRef(false);

  // Bigger bills sing deeper — map amount to a pitch band, then scrub within.
  const pitchBand = Math.max(0, Math.min(6, 7 - Math.round(Math.log10(Math.max(10, amount)) * 1.6)));

  const playAt = (clientX) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return;
    const norm = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    playFieldTone(pitchBand + Math.round(norm * 2), enabled, 1.8);
  };

  const handleBarDown = (e) => {
    draggingRef.current = true;
    playFieldBass(enabled, 0.5);
    playAt(e.clientX);
    lastPlayRef.current = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleBarMove = (e) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    if (now - lastPlayRef.current < 130) return;
    lastPlayRef.current = now;
    playAt(e.clientX);
  };

  const handleBarUp = (e) => {
    draggingRef.current = false;
    e.currentTarget?.releasePointerCapture?.(e.pointerId);
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) playDataBloom(pitchBand / 7, enabled);
    else playOrbTone(0.4, enabled, 1.0);
  };

  return (
    <div className="group relative border-t border-border/40 py-5 transition-colors hover:bg-secondary/10">
      <div className="flex items-start gap-4">
        {/* Huge number — the graph */}
        <div className="shrink-0 leading-none">
          <p className="text-3xl sm:text-4xl font-black font-mono text-foreground tracking-tight">
            {formatCurrency(amount)}
          </p>
          <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.18em] mt-1">/ month</p>
        </div>

        {/* Identity + living bar */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">{bill.emoji || '🪨'}</span>
            <p className="text-sm font-semibold text-foreground truncate">{bill.name}</p>
          </div>
          {/* The bar — drag to play */}
          <div
            ref={barRef}
            onPointerDown={handleBarDown}
            onPointerMove={handleBarMove}
            onPointerUp={handleBarUp}
            onPointerCancel={handleBarUp}
            className="relative h-2.5 rounded-full bg-border/30 cursor-ew-resize touch-none select-none"
            style={{ touchAction: 'none' }}
            role="slider"
            aria-label={`Play ${bill.name} — drag to hear`}
          >
            {/* Breathing fill */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${share}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
              style={{ background: isVariable ? 'hsl(258 35% 50%)' : 'hsl(258 80% 68%)' }}
            >
              {/* Endel breathing glow */}
              <motion.div
                animate={{ opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 10px ${isVariable ? 'hsl(258 35% 50% / 0.6)' : 'hsl(258 80% 68% / 0.6)'}` }}
              />
              {/* Traveling light particle — Electroplankton flow */}
              <motion.div
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 bottom-0 w-6 -skew-x-12"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
              />
            </motion.div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => { playOrbTone(0.5, enabled, 1.1); onToggleType(bill.id, isVariable ? 'fixed' : 'variable'); }}
              className="text-[9px] font-mono uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border transition-colors"
              style={{
                borderColor: isVariable ? 'hsl(258 30% 45% / 0.5)' : 'hsl(258 80% 68% / 0.5)',
                color: isVariable ? 'hsl(258 20% 70%)' : 'hsl(258 80% 72%)',
              }}
              title="Toggle fixed / variable"
            >
              {isVariable ? 'variable' : 'fixed'}
            </button>
            <span className="text-[9px] font-mono text-muted-foreground/40">{share}% of outflow</span>
            <span className="text-[9px] font-mono text-muted-foreground/30 italic">· drag the bar</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <button
            onClick={toggleOpen}
            className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded"
          >
            ways to lower
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => { playOrbTone(0.3, enabled, 0.8); onDelete(bill.id); }}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Remove bill"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Psychology — ways to lower */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-1 sm:pl-[136px] pt-3">
              <p className="text-[11px] italic text-foreground/80 leading-relaxed border-l-2 border-primary/40 pl-3 mb-3">
                {psy.reframe}
              </p>
              <ul className="space-y-2">
                {psy.levers.map((lever, i) => (
                  <li key={i} className="flex gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
                    <span className="text-primary/60 font-mono shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span>{lever}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}