import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal for recording reflections on monthly interest costs.
 * Clean, minimal interface for capturing financial insights.
 */

export default function HeatmapNoteModal({ month, interest, open, onClose, onSave }) {
  const [note, setNote] = useState('');

  const handleSave = () => {
    onSave?.({ month, interest, note });
    setNote('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto glass rounded-2xl border border-border/40 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground/70">MONTH {month}</p>
                <h3 className="text-lg font-semibold text-foreground mt-1">
                  ${interest.toFixed(0)} interest
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context */}
            <p className="text-xs text-muted-foreground/70 mb-4">
              Record a reflection. What does this cost mean to you right now?
            </p>

            {/* Input */}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Your thoughts on this month's interest cost..."
              className="w-full h-24 bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              autoFocus
            />

            {/* Actions */}
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-border/30 text-muted-foreground hover:bg-secondary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}