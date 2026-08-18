import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Waves } from 'lucide-react';
import { formatCurrency } from '@/lib/loanCalculations';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';
import { playOrbTone } from '@/lib/orchestraSound';
import TideCanvas from '@/components/forge/TideCanvas';
import BillCard from '@/components/forge/BillCard';

const INCOME_KEY = 'forge_monthly_income';

export default function Tides() {
  const [income, setIncome] = useState(() => {
    const v = localStorage.getItem(INCOME_KEY);
    return v ? parseFloat(v) : 0;
  });
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeDraft, setIncomeDraft] = useState('');

  // Add-bill form state
  const [addingBill, setAddingBill] = useState(false);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billEmoji, setBillEmoji] = useState('🪨');
  const [billType, setBillType] = useState('fixed');

  // Add-current form state
  const [addingCurrent, setAddingCurrent] = useState(false);
  const [currName, setCurrName] = useState('');
  const [currAmount, setCurrAmount] = useState('');
  const [currEmoji, setCurrEmoji] = useState('💧');

  const queryClient = useQueryClient();
  const { enabled } = useAmbientSoundContext();

  const { data: anchors = [] } = useQuery({ queryKey: ['anchors'], queryFn: () => base44.entities.Anchor.list() });
  const { data: habits = [] } = useQuery({ queryKey: ['spending_habits'], queryFn: () => base44.entities.SpendingHabit.list() });

  const createAnchor = useMutation({ mutationFn: (d) => base44.entities.Anchor.create(d), onSettled: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }) });
  const updateAnchor = useMutation({ mutationFn: ({ id, data }) => base44.entities.Anchor.update(id, data), onSettled: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }) });
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

  const submitBill = () => {
    const amt = parseFloat(billAmount) || 0;
    if (!billName.trim() || amt <= 0) return;
    createAnchor.mutate({ name: billName.trim(), emoji: billEmoji, monthly_average: amt, category: 'other', bill_type: billType });
    setBillName(''); setBillAmount(''); setBillEmoji('🪨'); setBillType('fixed'); setAddingBill(false);
  };

  const submitCurrent = () => {
    const amt = parseFloat(currAmount) || 0;
    if (!currName.trim() || amt <= 0) return;
    createHabit.mutate({ name: currName.trim(), emoji: currEmoji, monthly_average: amt, pattern: 'momentum_building' });
    setCurrName(''); setCurrAmount(''); setCurrEmoji('💧'); setAddingCurrent(false);
  };

  const toggleBillType = (id, type) => {
    updateAnchor.mutate({ id, data: { bill_type: type } });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Waves className="w-4 h-4 text-primary" />
        <h1 className="text-xl font-display font-semibold text-foreground">Tides</h1>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground/80 max-w-md mb-5">
        Money moves like water. What flows in, what flows out, and the depth that remains — the current that carries you toward freedom.
      </p>

      {/* Living tide pool — the animation, untouched */}
      <div className="relative overflow-hidden rounded-lg border border-border/20 bg-background/30 mb-5">
        <TideCanvas income={income} anchors={anchors} habits={habits} depth={depth} />
      </div>

      {/* Income source */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/30 bg-secondary/20 px-4 py-3 mb-6">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.18em]">flows in</p>
          <p className="text-[9px] font-mono text-muted-foreground/50">your monthly source</p>
        </div>
        {editingIncome ? (
          <div className="flex items-center gap-2">
            <input
              type="number" autoFocus value={incomeDraft} onChange={e => setIncomeDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveIncome(incomeDraft); if (e.key === 'Escape') setEditingIncome(false); }}
              className="w-28 bg-transparent text-right text-lg font-bold font-mono text-foreground focus:outline-none border-b border-primary/40"
              placeholder="0"
            />
            <button onClick={() => saveIncome(incomeDraft)} className="text-xs text-primary font-bold">✓</button>
          </div>
        ) : (
          <button
            onClick={() => { setIncomeDraft(String(income || '')); setEditingIncome(true); }}
            className="text-right"
          >
            <p className="text-lg font-bold font-mono text-primary">{income > 0 ? formatCurrency(income) : 'set source'}</p>
            <p className="text-[9px] font-mono text-muted-foreground/50">/ month</p>
          </button>
        )}
      </div>

      {/* Jack Butcher summary — three big numbers */}
      <div className="grid grid-cols-3 gap-px bg-border/30 border border-border/30 rounded-lg overflow-hidden mb-6">
        <div className="bg-background p-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.18em] mb-2">anchors hold</p>
          <p className="text-2xl font-black font-mono text-foreground leading-none">{formatCurrency(totalAnchors)}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50 mt-1.5">fixed outflow</p>
        </div>
        <div className="bg-background p-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.18em] mb-2">currents drift</p>
          <p className="text-2xl font-black font-mono text-foreground leading-none">{formatCurrency(totalHabits)}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50 mt-1.5">variable outflow</p>
        </div>
        <div className="bg-background p-4">
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.18em] mb-2">your depth</p>
          <p className={`text-2xl font-black font-mono leading-none ${depth > 0 ? 'text-primary' : 'text-muted-foreground'}`}>{formatCurrency(Math.max(0, depth))}</p>
          <p className="text-[9px] font-mono text-muted-foreground/50 mt-1.5">{depth > 0 ? 'can flow to chains' : depth === 0 ? 'balanced' : 'currents run deep'}</p>
        </div>
      </div>

      {/* Depth note — gentle money psychology */}
      {income > 0 && (
        <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed mb-7 border-l-2 border-primary/20 pl-3">
          {depth > 0
            ? <>Your depth of {formatCurrency(depth)} can flow toward breaking your chains. Every dollar here is a strike waiting to happen.</>
            : depth === 0
              ? <>The tides are balanced. Every dollar has a place. Consider what might shift to create depth.</>
              : <>The currents run {formatCurrency(Math.abs(depth))} deeper than the source. Not a crisis — a signal. What could shift?</>
          }
        </p>
      )}

      {/* ANCHORS — bills, Jack Butcher cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">— your anchors (bills)</p>
          <p className="text-[10px] font-mono text-muted-foreground/50">{anchors.length} {anchors.length === 1 ? 'bill' : 'bills'}</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mb-2 leading-relaxed">
          The steady drains. Some hold the same weight every month; others swing. Tap <span className="text-foreground/70">ways to lower</span> to think about each one.
        </p>

        <div className="border-b border-border/40">
          <AnimatePresence>
            {anchors.length === 0 && !addingBill && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground/50 py-6 text-center">
                No anchors yet. Add your first bill below.
              </motion.p>
            )}
            {anchors.map(bill => (
              <motion.div key={bill.id} exit={{ opacity: 0, height: 0 }}>
                <BillCard bill={bill} totalOutflow={totalAnchors} onToggleType={toggleBillType} onDelete={deleteAnchor.mutate} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add bill form */}
        {addingBill ? (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="border border-primary/30 bg-primary/5 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <input value={billEmoji} onChange={e => setBillEmoji(e.target.value)} maxLength={2} className="w-8 text-center bg-transparent text-sm focus:outline-none" placeholder="🪨" />
              <input value={billName} onChange={e => setBillName(e.target.value)} placeholder="bill name (e.g. Rent, Electric)" autoFocus className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none" onKeyDown={e => e.key === 'Enter' && submitBill()} />
              <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="$ / mo" className="w-20 bg-transparent text-right text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none" onKeyDown={e => e.key === 'Enter' && submitBill()} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {['fixed', 'variable'].map(t => (
                  <button
                    key={t}
                    onClick={() => setBillType(t)}
                    className={`text-[9px] font-mono uppercase tracking-[0.16em] px-2 py-1 rounded border transition-colors ${
                      billType === t
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-border/40 text-muted-foreground/60 hover:text-foreground'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <span className="text-[9px] font-mono text-muted-foreground/40 ml-1">{billType === 'fixed' ? 'same each month' : 'swings month to month'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={submitBill} className="text-xs text-primary font-bold">add ✓</button>
                <button onClick={() => setAddingBill(false)} className="text-xs text-muted-foreground/50 hover:text-foreground">cancel</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setAddingBill(true)}
            className="flex items-center gap-1.5 mt-3 text-xs font-mono text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> add a bill
          </button>
        )}
      </div>

      {/* CURRENTS — variable spending, compact */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">— your currents (spending)</p>
          <p className="text-[10px] font-mono text-muted-foreground/50">{habits.length} {habits.length === 1 ? 'current' : 'currents'}</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mb-3 leading-relaxed">
          The swirling eddies — spending that drifts. These already live in your mind map as organisms.
        </p>

        <div className="flex flex-wrap gap-1.5 items-center">
          <AnimatePresence>
            {habits.map(h => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 rounded-full border border-border/30 bg-secondary/30 pl-2.5 pr-1.5 py-1"
              >
                <span className="text-xs">{h.emoji || '💧'}</span>
                <span className="text-xs font-mono text-foreground/80">{h.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">${(h.monthly_average || 0).toFixed(0)}</span>
                <button onClick={() => { playOrbTone(0.3, enabled, 0.8); deleteHabit.mutate(h.id); }} className="w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive text-xs leading-none">×</button>
              </motion.div>
            ))}
          </AnimatePresence>

          {addingCurrent ? (
            <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 pl-2 pr-1.5 py-1">
              <input value={currEmoji} onChange={e => setCurrEmoji(e.target.value)} maxLength={2} className="w-6 bg-transparent text-center text-xs focus:outline-none" placeholder="💧" />
              <input value={currName} onChange={e => setCurrName(e.target.value)} placeholder="name" autoFocus className="w-20 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none" onKeyDown={e => e.key === 'Enter' && submitCurrent()} />
              <input type="number" value={currAmount} onChange={e => setCurrAmount(e.target.value)} placeholder="0" className="w-12 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none" onKeyDown={e => e.key === 'Enter' && submitCurrent()} />
              <button onClick={submitCurrent} className="text-xs text-primary font-bold px-1">✓</button>
              <button onClick={() => setAddingCurrent(false)} className="text-xs text-muted-foreground/50 px-1">✕</button>
            </div>
          ) : (
            <button onClick={() => setAddingCurrent(true)} className="flex items-center gap-1 rounded-full border border-dashed border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-colors px-2.5 py-1 text-xs font-mono">
              + current
            </button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/50 leading-relaxed border-t border-border/20 pt-4">
        Drag through the water to play the tides. Each anchor is a steady drain; each current is a swirling eddy. The glow at the center is your depth — what remains to carry you forward.
      </p>
    </div>
  );
}