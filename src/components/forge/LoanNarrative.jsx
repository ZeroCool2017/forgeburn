import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { playNoteFromData, playHarmonicChord, playShimmerChime } from '@/lib/musicalInterface';

/**
 * Narrative context for loans — ironic, intelligent storytelling + audio.
 * Generates narrative based on loan type, progress, and balance.
 */

const NARRATIVES = {
  student: {
    intro: 'You paid to learn. Now you\'re learning to pay. The education system works.',
    zero: 'Degree kept. Debt vaporized. The asymmetry was always the point.',
  },
  auto: {
    intro: 'You bought velocity. The bank bought your future. Economics is elegant.',
    zero: 'Title clear. Payments silent. Turns out freedom tastes like interest saved.',
  },
  mortgage: {
    intro: 'You wanted a home. The bank wanted a 30-year relationship. Both dreams came true.',
    zero: 'The walls are yours. The nightmares? Those fade slower.',
  },
  credit_card: {
    intro: 'Convenience is the highest interest rate of all. You paid for the privilege of convenience.',
    zero: 'Zero balance. Same convenience. This time the math works for you.',
  },
  personal: {
    intro: 'Trust gets a number. You\'re paying the interest on someone else\'s faith in you.',
    zero: 'You kept the promise. The debt is just the receipt.',
  },
  medical: {
    intro: 'Your body or your money. The system made you choose. You chose survival.',
    zero: 'Alive and debt-free. The medical-industrial complex can\'t take that.',
  },
  other: {
    intro: 'The reasons blur. Only the numbers remain. And you\'re rewriting them.',
    zero: 'Whatever it was, it\'s paid. Move forward differently.',
  },
};

export default function LoanNarrative({ loan }) {
  const [isHovered, setIsHovered] = useState(false);
  const original = loan.original_balance || loan.current_balance;
  const progress = 1 - (loan.current_balance / original);
  const narratives = NARRATIVES[loan.category] || NARRATIVES.other;
  const isComplete = loan.current_balance <= 0;

  const handleHover = (entering) => {
    setIsHovered(entering);
    if (entering) {
      // Electroplankton-like shimmer on scroll/appearance
      playShimmerChime(Math.random() * 0.6 - 0.3);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => handleHover(true)}
      onHoverEnd={() => handleHover(false)}
      className="border-l-2 border-primary/30 pl-3 py-2 hover:border-primary/60 transition-colors cursor-default"
    >
      <div className="flex items-start gap-2">
        <motion.div
          animate={{ scale: isHovered ? 1.2 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <BookOpen className="w-3 h-3 text-primary mt-0.5 shrink-0" />
        </motion.div>
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