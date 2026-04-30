import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { calculatePayoffSchedule, calculateMinimumOnlyPayoff, formatCurrency } from '@/lib/loanCalculations';
import StrategyCompare from '@/components/forge/StrategyCompare';
import BurndownChart from '@/components/forge/BurndownChart';
import ExtraBudgetSlider from '@/components/forge/ExtraBudgetSlider';

export default function Strategy() {
  const [strategy, setStrategy] = useState('momentum');
  const [extraBudget, setExtraBudget] = useState(200);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list(),
  });

  const schedule = useMemo(
    () => calculatePayoffSchedule(loans, extraBudget, strategy),
    [loans, extraBudget, strategy]
  );

  const minimumSchedule = useMemo(
    () => calculateMinimumOnlyPayoff(loans),
    [loans]
  );

  const interestSaved = minimumSchedule.totalInterest - schedule.totalInterest;
  const monthsSaved = minimumSchedule.months - schedule.months;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Swords className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Strategy Arena</h1>
            <p className="text-sm text-muted-foreground">Compare payoff strategies side by side</p>
          </div>
        </motion.div>

        {loans.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">
            Add loans on the Forge tab to compare strategies.
          </div>
        ) : (
          <div className="space-y-4">
            <ExtraBudgetSlider value={extraBudget} onChange={setExtraBudget} />

            {/* Summary callout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Months Saved</p>
                <p className="text-2xl font-black font-mono text-primary">{monthsSaved > 0 ? `−${monthsSaved}` : '0'}</p>
                <p className="text-xs text-muted-foreground">vs min. payments</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Interest Saved</p>
                <p className="text-2xl font-black font-mono text-primary">
                  {interestSaved > 0 ? formatCurrency(interestSaved) : '$0'}
                </p>
                <p className="text-xs text-muted-foreground">vs min. payments</p>
              </div>
            </div>

            <StrategyCompare
              loans={loans}
              extraBudget={extraBudget}
              activeStrategy={strategy}
              onStrategyChange={setStrategy}
            />

            <BurndownChart schedule={schedule} minimumSchedule={minimumSchedule} />
          </div>
        )}
      </div>
    </div>
  );
}