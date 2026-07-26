import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Volume2, VolumeX, X } from 'lucide-react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

const DISMISS_KEY = 'forge_headphone_hint_dismissed';

/**
 * SoundIntroBar — slim floating pill at the very top.
 * Tells first-timers to wear headphones, with an always-available
 * sound on/off toggle that matches the obsidian aesthetic.
 */
export default function SoundIntroBar() {
  const { mode, toggle } = useAmbientSoundContext();
  const isOn = mode !== 'off';
  const [hintVisible, setHintVisible] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) !== 'true'; } catch { return true; }
  });

  const dismiss = () => {
    setHintVisible(false);
    try { localStorage.setItem(DISMISS_KEY, 'true'); } catch {}
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 flex justify-center pointer-events-none px-3"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="pointer-events-auto mt-2 flex items-center gap-2 glass rounded-full border border-border/40 pl-3 pr-1.5 py-1.5 shadow-lg shadow-primary/5"
      >
        <AnimatePresence initial={false}>
          {hintVisible && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <Headphones className="w-3.5 h-3.5 text-primary/80 shrink-0" />
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.12em]">
                best experienced with headphones
              </span>
              <button
                onClick={dismiss}
                aria-label="Dismiss hint"
                className="text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="w-px h-3.5 bg-border/40 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggle}
          title={isOn ? 'Turn sound off' : 'Turn sound on'}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all border ${
            isOn
              ? 'border-primary/40 bg-primary/15 text-primary glow-purple'
              : 'border-border/40 bg-secondary/30 text-muted-foreground hover:text-foreground'
          }`}
        >
          {isOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="text-[10px] font-mono tracking-[0.12em]">{isOn ? 'sound on' : 'sound off'}</span>
        </button>
      </motion.div>
    </div>
  );
}