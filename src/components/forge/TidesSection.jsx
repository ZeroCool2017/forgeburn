import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/loanCalculations';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone } from '@/lib/orchestraSound';
import TideCanvas from './TideCanvas';

const INCOME_KEY = 'forge_monthly_income';

// Compact pill-based list for anchors (bills) or habits (currents)
function FlowChips({ items, type, onCreate, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [emoji, setEmoji] = useState(type === 'anchor' ? '🏠' : '💧');
  const { enabled } = useAmbientSoundContext();

  const submit = () => {
    const amt = parseFloat(amount) || 0;
    if (!name.trim() || amt <= 0) return;
    const data = type === 'anchor'
      ? { name: name.trim(), emoji, monthly_average: amt, category: 'other' }
      : { name: name.trim(), emoji, monthly_average: amt, pattern: 'momentum_building' };
    onCreate(data);
    setName(''); setAmount(''); setEmoji(type === 'anchor' ? '🏠' : '💧'); setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 rounded-full border border-border/30 bg-secondary/30 pl-2.5 pr-1.5 py-1"
          >
            <span className="text-xs">{item.emoji || (type === 'anchor' ? '🏠' : '💧')}</span>
            <span className="text-xs font-mono text-foreground/80">{item.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">${(item.monthly_average || 0).toFixed(0)}</span>
            <button
              onClick={() => { playOrbTone(0.6, enabled, 1.2); onDelete(item.id); }}
              className="w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors text-xs leading-none"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {adding ? (
        <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 pl-2 pr-1.5 py-1">
          <input
            value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2}
            className="w-6 bg-transparent text-center text-xs focus:outline-none"
            placeholder="🏠"
          />
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="name" autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="w-20 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0" onKeyDown={e => e.key === 'Enter' && submit()}
            className="w-12 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button onClick={submit} className="text-xs text-primary hover:text-primary/80 font-bold px-1">✓</button>
          <button onClick={() => setAdding(false)} className="text-xs text-muted-foreground/50 hover:text-foreground px-1">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-colors px-2.5 py-1 text-xs font-mono"
        >
          + {type === 'anchor' ? 'anchor' : 'current'}
        </button>
      )}
    </div>
  );
}

export default function TidesSection() {
  const [income, setIncome] = useState(() => {
    const v = localStorage.getItem(INCOME_KEY);
    return v ? parseFloat(v) : 0;
  });
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState('');
  const queryClient = useQueryClient();
  const { enabled } = useAmbientSoundContext();

  const { data: anchors = [] } = useQuery({ queryKey: ['anchors'], queryFn: () => base44.entities.Anchor.list() });
  const { data: habits = [] } = useQuery({ queryKey: ['spending_habits'], queryFn: () => base44.entities.SpendingHabit.list() });

  const createAnchor = useMutation({ mutationFn: (d) => base44.entities.Anchor.create(d), onSettled: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }) });
  const deleteAnchor = useMutation({ mutationFn: (id) => base44.entities.Anchor.delete(id), onSettled: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }) });
  const createHabit = useMutation({ mutationFn: (d) => base44.entities.SpendingHabit.create(d), onSettled: () => queryClient.invalidateQueries({ queryKey: ['spending_habits'] }) });
  const deleteHabit = useMutation({ mutationFn: (id) => base44.entities.SpendingHabit.delete(id), onSettled: () => queryClient.invalidateQueries({ queryKey: ['spending_habits'] }) });

  const totalAnchors = anchors.reduce((s, a) => s + (a.monthly_average || 0), 0);
  const totalHabits = habits.reduce((s, h) => s + (h.monthly_average || 0), 0);
  const depth = income - totalAnchors - totalHabits;

  const saveIncome = (val) => {
    const n = parseFloat(val) || 0;
    setIncome(n);
    localStorage.setItem(INCOME_KEY, String(n));
    setEditingIncome(false);
    playOrbTone(0.4, enabled, 1.5);
  };

  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      {/* Header + income */}
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Tides</h3>
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 max-w-md">
            Money moves like water. What flows in, what flows out, and the depth that remains — the current that carries you toward freedom.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-secondary/20 px-3 py-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">flows in</span>
          {editingIncome ? (
            <input
              type="number" autoFocus value={incomeDraft} onChange={e => setIncomeDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveIncome(incomeDraft); if (e.key === 'Escape') setEditingIncome(false); }}
              onBlur={() => saveIncome(incomeDraft)}
              className="w-20 bg-transparent text-sm font-bold font-mono text-foreground focus:outline-none text-right"
              placeholder="0"
            />
          ) : (
            <button
              onClick={() => { setIncomeDraft(String(income || '')); setEditingIncome(true); }}
              className="text-sm font-bold font-mono text-primary hover:text-primary/80 transition-colors text-right min-w-[60px]"
            >
              {income > 0 ? formatCurrency(income) : 'set source'}
            </button>
          )}
          <span className="text-[10px] font-mono text-muted-foreground/50">/mo</span>
        </div>
      </div>

      {/* Living tide pool */}
      <div className="relative overflow-hidden rounded-lg border border-border/20 bg-background/30 my-4">
        <TideCanvas income={income} anchors={anchors} habits={habits} depth={depth} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-border/20 bg-secondary/10 p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Anchors hold</p>
          <p className="text-lg font-black font-mono text-foreground/80">{formatCurrency(totalAnchors)}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50">fixed outflow</p>
        </div>
        <div className="rounded-lg border border-border/20 bg-secondary/10 p-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Currents drift</p>
          <p className="text-lg font-black font-mono text-foreground/80">{formatCurrency(totalHabits)}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50">variable outflow</p>
        </div>
        <div className={`rounded-lg border p-3 ${depth > 0 ? 'border-primary/30 bg-primary/5' : 'border-border/20 bg-secondary/10'}`}>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Your depth</p>
          <p className={`text-lg font-black font-mono ${depth > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{formatCurrency(Math.max(0, depth))}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50">{depth > 0 ? 'can flow to chains' : depth === 0 ? 'balanced' : 'currents run deep'}</p>
        </div>
      </div>

      {/* Depth note — gentle money psychology */}
      {income > 0 && (
        <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed mb-4 border-l-2 border-primary/20 pl-3">
          {depth > 0
            ? <>Your depth of {formatCurrency(depth)} can flow toward breaking your chains. Every dollar here is a strike waiting to happen.</>
            : depth === 0
              ? <>The tides are balanced. Every dollar has a place. Consider what might shift to create depth.</>
              : <>The currents run {formatCurrency(Math.abs(depth))} deeper than the source. Not a crisis — a signal. What could shift?</>
          }
        </p>
      )}

      {/* Flow management — compact pills */}
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">— your anchors (bills)</p>
          <FlowChips items={anchors} type="anchor" onCreate={createAnchor.mutate} onDelete={deleteAnchor.mutate} />
        </div>
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">— your currents (spending)</p>
          <FlowChips items={habits} type="habit" onCreate={createHabit.mutate} onDelete={deleteHabit.mutate} />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-4 leading-relaxed">
        Drag through the water to play the tides. Each anchor is a steady drain; each current is a swirling eddy. The glow at the center is your depth — what remains to carry you forward.
      </p>
    </div>
  );
}