import React, { useState, useMemo, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer } from 'lucide-react';

import { calculatePayoffSchedule, calculateMinimumOnlyPayoff, formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import QuoteBar from '@/components/forge/QuoteBar';
import ChainProgress from '@/components/forge/ChainProgress';
import StatsOrb from '@/components/forge/StatsOrb';
import BurndownChart from '@/components/forge/BurndownChart';
import InterestBreakdown from '@/components/forge/InterestBreakdown';
import PaymentTimeline from '@/components/forge/PaymentTimeline';
import StrategyCompare from '@/components/forge/StrategyCompare';
import FreedomScore from '@/components/forge/FreedomScore';
import MonthlyHeatmap from '@/components/forge/MonthlyHeatmap';
import ExtraBudgetSlider from '@/components/forge/ExtraBudgetSlider';
import DebtReductionChart from '@/components/forge/DebtReductionChart';
import AddLoanDialog from '@/components/forge/AddLoanDialog';
import EmptyState from '@/components/forge/EmptyState';
import RecordPaymentDialog from '@/components/forge/RecordPaymentDialog';
import ChainShatterOverlay from '@/components/forge/ChainShatterOverlay';
import PullToRefresh from '@/components/forge/PullToRefresh';
import VisualizeValue from '@/components/forge/VisualizeValue';
import { useForgeSound } from '@/hooks/useForgeSound';

export default function Dashboard() {
  const [strategy, setStrategy] = useState('momentum');
  const [extraBudget, setExtraBudget] = useState(200);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Payment flow state
  const [payingLoan, setPayingLoan] = useState(null);
  const [shatterTrigger, setShatterTrigger] = useState(0);
  const [shatterColor, setShatterColor] = useState('#a78bfa');
  const [shatterOrigin, setShatterOrigin] = useState({ x: 0, y: 0 });
  const [shatteringLoanId, setShatteringLoanId] = useState(null);

  const cardRefs = useRef({});
  const queryClient = useQueryClient();
  const { playChainBreak, playAdd } = useForgeSound();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list(),
  });

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
    mutationFn: ({ loan, amount }) => {
      const newBalance = Math.max(0, loan.current_balance - amount);
      return base44.entities.Loan.update(loan.id, { current_balance: newBalance });
    },
    onMutate: async ({ loan, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['loans'] });
      const prev = queryClient.getQueryData(['loans']);
      const newBalance = Math.max(0, loan.current_balance - amount);
      queryClient.setQueryData(['loans'], (old = []) =>
        old.map(l => l.id === loan.id ? { ...l, current_balance: newBalance } : l)
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

    playChainBreak();
    setShatterColor(cat.color);
    setShatteringLoanId(loan.id);
    setShatterTrigger(t => t + 1); // increment to re-trigger overlay

    // Clear the shatter card highlight after animation
    setTimeout(() => setShatteringLoanId(null), 600);

    // Apply DB update slightly after for visual effect
    setTimeout(() => recordPayment.mutate({ loan, amount }), 100);
  }, [recordPayment]);

  const schedule = useMemo(
    () => calculatePayoffSchedule(loans, extraBudget, strategy),
    [loans, extraBudget, strategy]
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
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-3/5 rounded-full blur-3xl" />
      </div>

      {/* Shatter overlay — remounts on each new trigger */}
      <AnimatePresence>
        {shatterTrigger > 0 && (
          <ChainShatterOverlay
            key={shatterTrigger}
            trigger={shatterTrigger}
            color={shatterColor}
            origin={shatterOrigin}
          />
        )}
      </AnimatePresence>

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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Hammer className="w-6 h-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Chain<span className="text-primary">Forge</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Break every chain. Forge your freedom.
            </p>
          </div>
          <AddLoanDialog onAdd={createLoan.mutate} open={dialogOpen} onOpenChange={setDialogOpen} />
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatsOrb label="Total Debt" value={formatCurrency(totalDebt)} sublabel={`of ${formatCurrency(totalOriginal)}`} delay={0} />
              <StatsOrb label="Free In" value={formatMonths(schedule.months)} sublabel={`${monthsSaved > 0 ? monthsSaved + ' months saved' : 'vs minimum'}`} delay={0.1} />
              <StatsOrb label="Forge Power" value={interestSaved > 0 ? formatCurrency(interestSaved) : '—'} sublabel={interestSaved > 0 ? `${monthsSaved}mo reclaimed` : 'add extra budget'} delay={0.2} accent="chart-3" />
              <StatsOrb label="Chains" value={loans.length} sublabel={`${loans.filter(l => l.current_balance <= 0).length} broken`} delay={0.3} />
            </div>

            {/* Visualize Value panel */}
            <div className="mb-6">
              <VisualizeValue
                totalDebt={totalDebt}
                totalOriginal={totalOriginal}
                interestSaved={interestSaved > 0 ? interestSaved : 0}
                months={monthsSaved > 0 ? monthsSaved : schedule.months}
              />
            </div>

            {/* Extra Budget + Freedom Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <ExtraBudgetSlider value={extraBudget} onChange={setExtraBudget} />
              </div>
              <FreedomScore loans={loans} />
            </div>

            {/* Debt Reduction Progress */}
            <div className="mb-6">
              <DebtReductionChart
                schedule={schedule}
                minimumSchedule={minimumSchedule}
                totalDebt={totalOriginal}
              />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <BurndownChart schedule={schedule} minimumSchedule={minimumSchedule} />
              <StrategyCompare
                loans={loans}
                extraBudget={extraBudget}
                activeStrategy={strategy}
                onStrategyChange={setStrategy}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <PaymentTimeline schedule={schedule} />
              <InterestBreakdown loans={loans} schedule={schedule} />
            </div>

            <div className="mb-6">
              <MonthlyHeatmap schedule={schedule} />
            </div>

            {/* Loan Cards */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Your Chains
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {loans.map(loan => (
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
          </>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}