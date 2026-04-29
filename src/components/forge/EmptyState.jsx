import React from 'react';
import { motion } from 'framer-motion';
import { Link2Off } from 'lucide-react';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-purple">
          <Link2Off className="w-8 h-8 text-primary" />
        </div>
      </motion.div>
      <h2 className="text-xl font-bold text-foreground mb-2">No Chains Yet</h2>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Every chain broken is a step toward freedom. Add your first loan to begin forging your path to financial independence.
      </p>
    </motion.div>
  );
}