import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

/**
 * Narrative context for loans — adds story texture to the debt.
 * Generates narrative based on loan type, progress, and balance.
 */

const NARRATIVES = {
  student: {
    intro: 'They told you it was an investment. They were right. Just not how they meant.',
    zero: 'The degree stays. The debt leaves. Net gain.',
  },
  auto: {
    intro: 'A car is freedom. Until the bank owns the freedom.',
    zero: 'Paid in full. Now you actually own the roads.',
  },
  mortgage: {
    intro: 'You bought a house. The house bought you.',
    zero: 'It\'s yours now. The bank is just a memory.',
  },
  credit_card: {
    intro: 'Born from convenience. Weaponized by compounding.',
    zero: 'The card works again. This time, you do too.',
  },
  personal: {
    intro: 'Someone believed in you enough to lend. Prove them right.',
    zero: 'You proved them right. And yourself.',
  },
  medical: {
    intro: 'Medicine doesn\'t negotiate. Neither should you.',
    zero: 'You paid for your life. That\'s not negotiable either.',
  },
  other: {
    intro: 'Debt obscured. But math is honest.',
    zero: 'Balance: zero. Clarity: infinite.',
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