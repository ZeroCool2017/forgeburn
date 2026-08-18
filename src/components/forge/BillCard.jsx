import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { formatCurrency } from '@/lib/loanCalculations';
import { getBillPsychology } from '@/lib/billPsychology';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone } from '@/lib/orchestraSound';

// Jack Butcher bill card — huge number, thin label, one bar, one accent.
// Not a sphere. The graph IS the typography.
export default function BillCard({ bill, totalOutflow, onToggleType, onDelete }) {
  const [open, setOpen] = useState(false);
  const { enabled } = useAmbientSoundContext();
  const psy = getBillPsychology(bill.category, bill.name);
  const amount = bill.monthly_average || 0;
  const share = totalOutflow > 0 ? Math.round((amount / totalOutflow) * 100) : 0;
  const isVariable = bill.bill_type === 'variable';

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

        {/* Identity + bar */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">{bill.emoji || '🪨'}</span>
            <p className="text-sm font-semibold text-foreground truncate">{bill.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${share}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-y-0 left-0"
                style={{ background: isVariable ? 'hsl(258 30% 45%)' : 'hsl(258 80% 68%)', height: '2px', top: '-0.5px' }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">{share}%</span>
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
            <span className="text-[9px] font-mono text-muted-foreground/40">
              {isVariable ? 'swings month to month' : 'same each month'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <button
            onClick={() => { playOrbTone(0.7, enabled, 1.3); setOpen(o => !o); }}
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