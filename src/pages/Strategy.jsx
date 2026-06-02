import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Target } from 'lucide-react';
import { calculatePayoffSchedule, calculateMinimumOnlyPayoff, formatCurrency, CATEGORY_CONFIG } from '@/lib/loanCalculations';
import StrategyCompare from '@/components/forge/StrategyCompare';
import BurndownChart from '@/components/forge/BurndownChart';
import ExtraBudgetSlider from '@/components/forge/ExtraBudgetSlider';

export default function Strategy() {
  const [strategy, setStrategy] = useState('momentum');
  const [extraBudget, setExtraBudget] = useState(200);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list(),
  });

  // Filter loans by selected category
  const filteredLoans = useMemo(() =>
    selectedCategory === 'all' ? loans : loans.filter(l => l.category === selectedCategory),
    [loans, selectedCategory]
  );

  const schedule = useMemo(
    () => calculatePayoffSchedule(filteredLoans, extraBudget, strategy),
    [filteredLoans, extraBudget, strategy]
  );

  const minimumSchedule = useMemo(
    () => calculateMinimumOnlyPayoff(filteredLoans),
    [filteredLoans]
  );

  const interestSaved = minimumSchedule.totalInterest - schedule.totalInterest;
  const monthsSaved = minimumSchedule.months - schedule.months;

  // Order loans by strategy for the priority list
  const priorityLoans = useMemo(() => {
    const active = filteredLoans.filter(l => l.current_balance > 0);
    switch (strategy) {
      case 'avalanche':
        return [...active].sort((a, b) => b.interest_rate - a.interest_rate);
      case 'snowball':
        return [...active].sort((a, b) => a.current_balance - b.current_balance);
      case 'momentum': {
        return [...active].sort((a, b) => {
          const aProgress = 1 - (a.current_balance / (a.original_balance || a.current_balance));
          const bProgress = 1 - (b.current_balance / (b.original_balance || b.current_balance));
          const aScore = (a.interest_rate * 0.6) + (aProgress * 100 * 0.4);
          const bScore = (b.interest_rate * 0.6) + (bProgress * 100 * 0.4);
          return bScore - aScore;
        });
      }
      case 'blitz':
        // Highest minimum payment first — frees up cash flow fastest
        return [...active].sort((a, b) => (b.minimum_payment || 0) - (a.minimum_payment || 0));
      default:
        return active;
    }
  }, [filteredLoans, strategy]);

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
            {/* Category filter */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Filter by Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    selectedCategory === 'all'
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'border-border/30 text-muted-foreground hover:border-border/60'
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_CONFIG).filter(([key]) =>
                  loans.some(l => l.category === key)
                ).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 ${
                      selectedCategory === key
                        ? 'border-primary/50 text-foreground'
                        : 'border-border/30 text-muted-foreground hover:border-border/60'
                    }`}
                    style={selectedCategory === key ? { background: cat.color + '22', borderColor: cat.color + '66', color: cat.color } : {}}
                  >
                    <span>{cat.emoji}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Priority payoff order */}
            {priorityLoans.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                  — Attack Order
                </p>
                <div className="space-y-2">
                  {priorityLoans.map((loan, idx) => {
                    const cat = CATEGORY_CONFIG[loan.category] || CATEGORY_CONFIG.other;
                    return (
                      <motion.div
                        key={loan.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/20 bg-secondary/20"
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                          {idx + 1}
                        </span>
                        <span className="text-base">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{loan.name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{loan.interest_rate}% APR · {formatCurrency(loan.current_balance)}</p>
                        </div>
                        {idx === 0 && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 shrink-0">
                            FIRST
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <StrategyCompare
              loans={filteredLoans}
              extraBudget={extraBudget}
              activeStrategy={strategy}
              onStrategyChange={setStrategy}
            />

            <BurndownChart schedule={schedule} minimumSchedule={minimumSchedule} loans={filteredLoans} />
          </div>
        )}
      </div>
    </div>
  );
}