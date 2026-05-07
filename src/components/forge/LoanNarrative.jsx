import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

/**
 * Narrative context for loans — adds story texture to the debt.
 * Generates narrative based on loan type, progress, and balance.
 */

const NARRATIVES = {
  student: {
    intro: 'The education you invested in.',
    zero: 'Your knowledge is yours. The debt is gone.',
  },
  auto: {
    intro: 'The freedom you bought on wheels.',
    zero: 'The car is paid for. The road is open.',
  },
  mortgage: {
    intro: 'The roof over your head.',
    zero: 'The house is yours. No bank claim.',
  },
  credit_card: {
    intro: 'The emergency fund that turned into a trap.',
    zero: 'The credit card is paid. Freedom tastes like relief.',
  },
  personal: {
    intro: 'A loan for life. A loan that lived.',
    zero: 'You paid it back. You kept your word.',
  },
  medical: {
    intro: 'The cost of staying alive.',
    zero: 'You paid for your health. Now keep it.',
  },
  other: {
    intro: 'Debt, in its raw form.',
    zero: 'One less thing to owe.',
  },
};

export default function LoanNarrative({ loan }) {
  const original = loan.original_balance || loan.current_balance;
  const progress = 1 - (loan.current_balance / original);
  const narratives = NARRATIVES[loan.category] || NARRATIVES.other;

  const isComplete = loan.current_balance <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-l-2 border-primary/30 pl-3 py-2"
    >
      <div className="flex items-start gap-2">
        <BookOpen className="w-3 h-3 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          {isComplete ? (
            <p className="text-xs italic text-primary leading-relaxed">"{narratives.zero}"</p>
          ) : (
            <>
              <p className="text-xs italic text-foreground/80 leading-relaxed mb-1">"{narratives.intro}"</p>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-border/30 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">{Math.round(progress * 100)}%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}