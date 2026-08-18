import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, PartyPopper } from 'lucide-react';
import { exportAllData } from '@/lib/exportData';

import { calculatePayoffSchedule, calculateMinimumOnlyPayoff, formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import { advanceDueDate } from '@/lib/dueDates';
import QuoteBar from '@/components/forge/QuoteBar';
import ChainProgress from '@/components/forge/ChainProgress';
import StatsOrb from '@/components/forge/StatsOrb';
import FreedomTimeline from '@/components/forge/FreedomTimeline';
import FreedomScore from '@/components/forge/FreedomScore';
import ExtraBudgetSlider from '@/components/forge/ExtraBudgetSlider';
import DebtReductionChart from '@/components/forge/DebtReductionChart';
import AddLoanDialog from '@/components/forge/AddLoanDialog';
import EmptyState from '@/components/forge/EmptyState';
import RecordPaymentDialog from '@/components/forge/RecordPaymentDialog';
import ChainDissolutionEffect from '@/components/forge/ChainDissolutionEffect';
import MilestoneOverlay from '@/components/forge/MilestoneOverlay';
import FloatingOrganisms from '@/components/forge/FloatingOrganisms';
import { detectMilestone } from '@/lib/milestones';
import PullToRefresh from '@/components/forge/PullToRefresh';
import VisualizeValue from '@/components/forge/VisualizeValue';
import CompoundCurveWidget from '@/components/forge/CompoundCurveWidget';

import MoneyStorySession from '@/components/forge/MoneyStorySession';
import CelestialMindMap from '@/components/forge/CelestialMindMap';
import InteractiveHeatmap from '@/components/forge/InteractiveHeatmap';
import { useForgeSound } from '@/hooks/useForgeSound';

export default function Dashboard() {
  const [strategy, setStrategy] = useState(() => localStorage.getItem('forge_strategy') || 'momentum');
  const [extraBudget, setExtraBudget] = useState(200);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [birthData, setBirthData] = useState(null);
  const [showBroken, setShowBroken] = useState(false);

  // Sync strategy to localStorage so Strategy page can share it
  useEffect(() => {
    localStorage.setItem('forge_strategy', strategy);
  }, [strategy]);

  // Payment flow state
  const [payingLoan, setPayingLoan] = useState(null);
  const [shatterTrigger, setShatterTrigger] = useState(0);
  const [shatterColor, setShatterColor] = useState('#a78bfa');
  const [shatterOrigin, setShatterOrigin] = useState({ x: 0, y: 0 });
  const [shatteringLoanId, setShatteringLoanId] = useState(null);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [milestoneLoanName, setMilestoneLoanName] = useState('');
  const [showInsight, setShowInsight] = useState(true);
  const [newLoanForStory, setNewLoanForStory] = useState(null);
  const [moneyStoryOpen, setMoneyStoryOpen] = useState(false);

  const cardRefs = useRef({});
  const queryClient = useQueryClient();
  const { playChainBreak, playAdd } = useForgeSound();

  // Load user birth data for astrology
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => base44.auth.me(),
  });

  // Extract birth data from user metadata when available
  useEffect(() => {
    if (user?.birthData) {
      setBirthData(user.birthData);
    }
  }, [user]);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list(),
  });

  // Load spending habits to calculate their impact on available budget
  const { data: habits = [] } = useQuery({
    queryKey: ['spending_habits'],
    queryFn: () => base44.entities.SpendingHabit.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list(),
  });

  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    exportAllData(loans, transactions);
    setTimeout(() => setExporting(false), 1000);
  };

  // Calculate total monthly spending from habits
  const totalHabitSpending = habits.reduce((sum, h) => sum + (h.monthly_average || 0), 0);

  const createLoan = useMutation({
    mutationFn: (data) => base44.entities.Loan.create(data),
    onMutate: async (newLoan) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueryData(['loans']);
      queryClient.setQueryData(['loans'], (old = []) => [
        ...old,
        { id: `temp-${Date.now()}`, ...newLoan },
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['loans'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
    onSuccess: (_data, variables) => {
      // Auto-open money story session after adding a chain
      setNewLoanForStory({ ...variables, name: variables.name || 'New Chain' });
      setMoneyStoryOpen(true);
    },
  });

  const deleteLoan = useMutation({
    mutationFn: (id) => base44.entities.Loan.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueryData(['loans']);
      queryClient.setQueryData(['loans'], (old = []) => old.filter(l => l.id !== id));
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['loans'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  const recordPayment = useMutation({
    mutationFn: ({ loan, amount, countsTowardDueDate = true }) => {
      const newBalance = Math.max(0, loan.current_balance - amount);
      const payment = {
        amount,
        date: new Date().toISOString(),
        counts_toward_due_date: countsTowardDueDate,
      };
      const paymentHistory = [...(loan.payment_history || []), payment];
      const nextDueDate = countsTowardDueDate && (loan.next_due_date || loan.due_date)
        ? advanceDueDate(loan.next_due_date || loan.due_date, loan.payment_frequency || 'monthly')
        : (loan.next_due_date || loan.due_date || null);
      return base44.entities.Loan.update(loan.id, {
        current_balance: newBalance,
        payment_history: paymentHistory,
        last_payment_date: payment.date,
        next_due_date: nextDueDate,
      });
    },
    onMutate: async ({ loan, amount, countsTowardDueDate = true }) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueryData(['loans']);
      const newBalance = Math.max(0, loan.current_balance - amount);
      const payment = {
        amount,
        date: new Date().toISOString(),
        counts_toward_due_date: countsTowardDueDate,
      };
      const nextDueDate = countsTowardDueDate && (loan.next_due_date || loan.due_date)
        ? advanceDueDate(loan.next_due_date || loan.due_date, loan.payment_frequency || 'monthly')
        : (loan.next_due_date || loan.due_date || null);
      queryClient.setQueryData(['loans'], (old = []) =>
        old.map(l => l.id === loan.id ? {
          ...l,
          current_balance: newBalance,
          payment_history: [...(l.payment_history || []), payment],
          last_payment_date: payment.date,
          next_due_date: nextDueDate,
        } : l)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(['loans'], ctx.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  // Trigger the shatter effect then apply the payment
  const handlePaymentConfirm = useCallback((loan, amount) => {
    const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;

    // Get position from the card ref for the shatter origin
    const cardEl = cardRefs.current[loan.id];
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setShatterOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    // Milestone detection
    const original = loan.original_balance || loan.current_balance;
    const newBalance = Math.max(0, loan.current_balance - amount);
    const milestone = detectMilestone(loan.current_balance, newBalance, original);
    if (milestone) {
      setActiveMilestone(milestone);
      setMilestoneLoanName(loan.name);
    }

    playChainBreak();
    setShatterColor(cat.color);
    setShatteringLoanId(loan.id);
    setShatterTrigger(t => t + 1);

    setTimeout(() => setShatteringLoanId(null), 600);
    setTimeout(() => recordPayment.mutate({ loan, amount }), 100);
  }, [recordPayment]);

  // Sort active loans by strategy — mirrors Strategy page
  const activeLoans = useMemo(() => {
    const active = loans.filter(l => l.current_balance > 0);
    switch (strategy) {
      case 'avalanche':
        return [...active].sort((a, b) => b.interest_rate - a.interest_rate);
      case 'snowball':
        return [...active].sort((a, b) => a.current_balance - b.current_balance);
      case 'blitz':
        return [...active].sort((a, b) => (b.minimum_payment || 0) - (a.minimum_payment || 0));
      case 'momentum':
      default:
        return [...active].sort((a, b) => {
          const aProgress = 1 - (a.current_balance / (a.original_balance || a.current_balance));
          const bProgress = 1 - (b.current_balance / (b.original_balance || b.current_balance));
          const aScore = (a.interest_rate * 0.6) + (aProgress * 100 * 0.4);
          const bScore = (b.interest_rate * 0.6) + (bProgress * 100 * 0.4);
          return bScore - aScore;
        });
    }
  }, [loans, strategy]);

  const brokenChains = useMemo(() => loans.filter(l => l.current_balance <= 0), [loans]);

  // Fire confetti when a chain is broken
  const prevBrokenCount = useRef(0);
  useEffect(() => {
    if (brokenChains.length > prevBrokenCount.current) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#a78bfa', '#c084fc', '#818cf8', '#f472b6', '#fbbf24'],
        });
      });
    }
    prevBrokenCount.current = brokenChains.length;
  }, [brokenChains.length]);

  // Adjust extra budget based on habit spending reduction (tangible connection)
  const adjustedExtraBudget = Math.max(0, extraBudget - (totalHabitSpending * 0.1)); // Habits reduce available extra by 10% of their value
  
  const schedule = useMemo(
    () => calculatePayoffSchedule(loans, adjustedExtraBudget, strategy),
    [loans, adjustedExtraBudget, strategy]
  );

  const minimumSchedule = useMemo(
    () => calculateMinimumOnlyPayoff(loans),
    [loans]
  );

  const totalDebt = loans.reduce((s, l) => s + l.current_balance, 0);
  const totalOriginal = loans.reduce((s, l) => s + (l.original_balance || l.current_balance), 0);
  const interestSaved = minimumSchedule.totalInterest - schedule.totalInterest;
  const monthsSaved = minimumSchedule.months - schedule.months;

  const formatMonths = (m) => {
    const years = Math.floor(m / 12);
    const months = m % 12;
    if (years === 0) return `${months}mo`;
    if (months === 0) return `${years}yr`;
    return `${years}yr ${months}mo`;
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['loans'] });
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div>
      {/* Floating Electroplankton organisms */}
      <FloatingOrganisms debtProgress={totalDebt > 0 ? (totalOriginal - totalDebt) / totalOriginal : 0} />

      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-3/5 rounded-full blur-3xl" />
      </div>

      {/* Chain dissolution overlay — permanent, weighty effect */}
      <AnimatePresence>
        {shatterTrigger > 0 && (
          <ChainDissolutionEffect
            key={shatterTrigger}
            trigger={shatterTrigger}
            color={shatterColor}
            origin={shatterOrigin}
          />
        )}
      </AnimatePresence>

      {/* Milestone overlay */}
      <MilestoneOverlay
        milestone={activeMilestone}
        loanName={milestoneLoanName}
        onDismiss={() => setActiveMilestone(null)}
      />

      {/* Money story auto-triggered after adding a chain */}
      <MoneyStorySession
        loan={newLoanForStory}
        open={moneyStoryOpen}
        onOpenChange={(open) => { setMoneyStoryOpen(open); if (!open) setNewLoanForStory(null); }}
      />

      {/* Record payment dialog */}
      <RecordPaymentDialog
        loan={payingLoan}
        open={!!payingLoan}
        onOpenChange={(open) => !open && setPayingLoan(null)}
        onConfirm={handlePaymentConfirm}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xs font-mono text-muted-foreground tracking-widest">forge/ glow → strike ⟶ break</p>
                <p className="text-xs font-mono text-muted-foreground/50">{dateStr}</p>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">⛓️</span>
                <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-display">
                  Carry the <span className="text-primary">Zero</span>
                </h1>
              </div>

            </div>
            <div className="flex items-center gap-2">
              {/* Strategy selector */}
              <div className="flex gap-0.5 bg-card/60 border border-border/30 rounded-lg p-0.5">
                {[
                  { id: 'momentum', icon: '⛓️' },
                  { id: 'avalanche', icon: '💧' },
                  { id: 'snowball', icon: '⚪' },
                  { id: 'blitz', icon: '💥' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStrategy(s.id)}
                    className={`px-1.5 py-1 rounded-md text-xs transition-all ${
                      strategy === s.id
                        ? 'bg-primary/20 text-primary shadow-sm'
                        : 'text-muted-foreground/50 hover:text-muted-foreground'
                    }`}
                    title={s.id === 'blitz' ? 'Cash Flow' : s.id.charAt(0).toUpperCase() + s.id.slice(1)}
                  >
                    {s.icon}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExport}
                disabled={exporting || loans.length === 0}
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-lg border border-border/40 bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-border/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                {exporting ? 'Exporting…' : 'Export'}
              </button>
              <AddLoanDialog onAdd={createLoan.mutate} open={dialogOpen} onOpenChange={setDialogOpen} />
            </div>
          </div>
          <div className="obs-divider mt-6" />
        </motion.div>

        {/* Quote */}
        <div className="mb-6">
          <QuoteBar />
        </div>

        {loans.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stats Row */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— overview</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatsOrb label="Total Debt" value={formatCurrency(totalDebt)} sublabel={`of ${formatCurrency(totalOriginal)}`} delay={0} />
              <StatsOrb label="Free In" value={formatMonths(schedule.months)} sublabel={`${monthsSaved > 0 ? monthsSaved + ' months saved' : 'vs minimum'}`} delay={0.1} />
              <StatsOrb label="Forge Power" value={interestSaved > 0 ? formatCurrency(interestSaved) : '—'} sublabel={interestSaved > 0 ? `${monthsSaved}mo reclaimed` : 'add extra budget'} delay={0.2} accent="chart-3" />
              <StatsOrb label="Chains" value={activeLoans.length} sublabel={`${brokenChains.length} broken`} delay={0.3} />
            </div>

            <div className="obs-divider my-6" />
            {/* Visualize Value panel */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— data story</p>
            <div className="mb-6">
              <VisualizeValue
                totalDebt={totalDebt}
                totalOriginal={totalOriginal}
                interestSaved={interestSaved > 0 ? interestSaved : 0}
                months={monthsSaved > 0 ? monthsSaved : schedule.months}
                loans={loans}
              />
            </div>

            <div className="obs-divider my-6" />
            {/* Extra Budget + Freedom Score — CONTROL POINT */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— forge controls</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className="lg:col-span-2">
                <ExtraBudgetSlider value={extraBudget} onChange={setExtraBudget} />
              </div>
              <FreedomScore loans={loans} />
            </div>

            <div className="obs-divider my-6" />
            {/* Systems-thinking: compound curve widget */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— compound effect</p>
            <div className="mb-6">
              <CompoundCurveWidget
                loans={loans}
                schedule={schedule}
                minimumSchedule={minimumSchedule}
              />
            </div>

            <div className="obs-divider my-6" />
            {/* Debt Reduction Progress */}
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— reduction trajectory</p>
            <div className="mb-6">
              <DebtReductionChart
                schedule={schedule}
                minimumSchedule={minimumSchedule}
                totalDebt={totalOriginal}
              />
            </div>

            {/* PAYOFF TIMELINE — museum moment */}
            <div className="obs-divider my-8" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">— your freedom timeline</p>
            <div className="mb-12">
              <FreedomTimeline schedule={schedule.schedule} months={schedule.months} />
            </div>


            {/* INTERACTIVE INTEREST MAP */}
            <div className="obs-divider my-8" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">— interactive interest map</p>
            <div className="mb-12">
              <InteractiveHeatmap 
                schedule={schedule.schedule} 
                title="Click months to explore"
                habitImpact={totalHabitSpending}
              />
            </div>

            {/* MOMENTUM FIELD */}
            <div className="obs-divider my-8" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">— debt patterns</p>
            <div className="mb-12">
              <CelestialMindMap loans={loans} schedule={schedule} />
            </div>

            <div className="obs-divider my-6" />
            {/* Loan Cards */}
            <div className="mb-6">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.2em] mb-3">— your chains</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeLoans.map(loan => (
                  <div
                    key={loan.id}
                    ref={el => cardRefs.current[loan.id] = el}
                  >
                    <ChainProgress
                      loan={loan}
                      totalOriginal={totalOriginal}
                      onPay={() => setPayingLoan(loan)}
                      onDelete={() => deleteLoan.mutate(loan.id)}
                      isShattering={shatteringLoanId === loan.id}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Broken Chains */}
            {brokenChains.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowBroken(!showBroken)}
                  className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 hover:text-muted-foreground transition-colors mb-3"
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  {brokenChains.length} chain{brokenChains.length > 1 ? 's' : ''} broken — {showBroken ? 'hide' : 'show'}
                </button>
                <AnimatePresence>
                  {showBroken && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                      {brokenChains.map(loan => (
                        <motion.div
                          key={loan.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass rounded-2xl p-4 border border-green-500/20 relative overflow-hidden"
                        >
                          <div className="absolute top-2 right-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                              BROKEN
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl opacity-50">⛓️💥</span>
                            <div>
                              <p className="text-sm font-semibold text-foreground/60 line-through">{loan.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground/40">
                                was {loan.original_balance || loan.current_balance > 0 ? formatCurrency(loan.original_balance || loan.current_balance) : '—'}
                              </p>
                            </div>
                          </div>
                          <div className="h-px bg-gradient-to-r from-green-500/20 via-green-500/10 to-transparent" />
                          <p className="text-[10px] font-mono text-green-500/60 mt-2">✓ Paid in full</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </>
          )}
          </div>
          </div>
          </PullToRefresh>
  );
}