import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Trash2 } from 'lucide-react';

export default function HeatmapNoteModal({ month, interest, existingNote = '', open, onClose, onSave, onDelete }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(existingNote || '');
  }, [existingNote, open]);

  const handleSave = () => {
    if (!note.trim()) return;
    onSave?.({ month, interest, note });
    setNote('');
  };

  const handleDelete = () => {
    onDelete?.(month);
    setNote('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto glass rounded-2xl border border-border/40 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-mono text-muted-foreground/70">MONTH {month}</p>
                <h3 className="text-lg font-semibold text-foreground mt-1">
                  ${interest?.toFixed(0) || 0} interest
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {existingNote && (
                  <button
                    onClick={handleDelete}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/70 mb-4">
              {existingNote ? 'Edit your reflection or write a new one.' : 'Record a reflection. What does this month\'s interest cost mean to you?'}
            </p>

            {existingNote && (
              <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-2">
                  <Book className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/70 italic leading-relaxed">{existingNote}</p>
                </div>
              </div>
            )}

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={existingNote ? 'Update your note...' : "Your thoughts on this month's interest cost..."}
              className="w-full h-24 bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              autoFocus
            />

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-border/30 text-muted-foreground hover:bg-secondary/40 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!note.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors disabled:opacity-40"
              >
                {existingNote ? 'Update' : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
