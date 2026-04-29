import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trash2, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { calculatePayoffSchedule, calculateMinimumOnlyPayoff, formatCurrency } from '@/lib/loanCalculations';
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
import AddLoanDialog from '@/components/forge/AddLoanDialog';
import EmptyState from '@/components/forge/EmptyState';

export default function Dashboard() {
  const [strategy, setStrategy] = useState('momentum');
  const [extraBudget, setExtraBudget] = useState(200);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list(),
  });

  const createLoan = useMutation({
    mutationFn: (data) => base44.entities.Loan.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  const deleteLoan = useMutation({
    mutationFn: (id) => base44.entities.Loan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-3/5 rounded-full blur-3xl" />
      </div>

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
              <StatsOrb label="Interest Cost" value={formatCurrency(schedule.totalInterest)} sublabel={interestSaved > 0 ? `Saving ${formatCurrency(interestSaved)}` : ''} delay={0.2} />
              <StatsOrb label="Chains" value={loans.length} sublabel={`${loans.filter(l => l.current_balance <= 0).length} broken`} delay={0.3} />
            </div>

            {/* Extra Budget + Freedom Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2">
                <ExtraBudgetSlider value={extraBudget} onChange={setExtraBudget} />
              </div>
              <FreedomScore loans={loans} />
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
                  <div key={loan.id} className="relative group">
                    <ChainProgress loan={loan} totalOriginal={totalOriginal} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLoan.mutate(loan.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 w-7 h-7"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}