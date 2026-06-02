import { useIsMutating, useIsFetching } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SaveIndicator() {
  const isMutating = useIsMutating();
  const isFetching = useIsFetching();
  const [showSaved, setShowSaved] = useState(false);
  const [wasMutating, setWasMutating] = useState(false);

  // Show "saved" briefly when mutations complete
  useEffect(() => {
    if (isMutating > 0) {
      setWasMutating(true);
    } else if (wasMutating) {
      setShowSaved(true);
      setWasMutating(false);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isMutating, wasMutating]);

  const isActive = isMutating > 0 || isFetching > 0;

  return (
    <div className="fixed bottom-20 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border/40 shadow-lg"
          >
            <motion.div
              animate={{ scale: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <span className="text-[10px] font-mono text-muted-foreground">saving…</span>
          </motion.div>
        )}
        {showSaved && !isActive && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur border border-border/40 shadow-lg"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono text-muted-foreground">saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
