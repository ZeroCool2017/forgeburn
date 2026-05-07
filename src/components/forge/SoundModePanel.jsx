import React from 'react';
import { motion } from 'framer-motion';
import { SOUND_MODES, useAmbientSoundContext } from '@/lib/ambientSoundContext';

export default function SoundModePanel() {
  const { mode, setMode } = useAmbientSoundContext();

  return (
    <div className="space-y-2">
      {SOUND_MODES.map((m) => {
        const active = mode === m.id;
        return (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode(m.id)}
            className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
              active
                ? 'border-primary/50 bg-primary/10'
                : 'border-border/30 bg-secondary/20 hover:border-border/60 hover:bg-secondary/40'
            }`}
          >
            <span className="text-xl shrink-0 mt-0.5">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>
                  {m.label}
                </p>
                {active && (
                  <motion.div
                    layoutId="sound-active"
                    className="flex gap-0.5 items-end h-3.5 shrink-0"
                  >
                    {[1, 2, 3, 2, 1].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, h, 1] }}
                        transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }}
                        className="w-0.5 rounded-full bg-primary"
                        style={{ height: `${h * 4}px`, transformOrigin: 'bottom' }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground">{m.sub}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">{m.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}