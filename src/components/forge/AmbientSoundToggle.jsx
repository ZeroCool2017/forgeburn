import React from 'react';
import { motion } from 'framer-motion';
import { Music, VolumeX } from 'lucide-react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

export default function AmbientSoundToggle() {
  const { enabled, toggle } = useAmbientSoundContext();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${enabled ? 'bg-primary/20' : 'bg-secondary'}`}>
          {enabled
            ? <Music className="w-4 h-4 text-primary" />
            : <VolumeX className="w-4 h-4 text-muted-foreground" />
          }
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Focus Soundscape</p>
          <p className="text-xs text-muted-foreground">
            {enabled ? 'Lo-fi ambient loop playing' : 'Silent mode'}
          </p>
        </div>
      </div>

      {/* Toggle pill */}
      <button
        onClick={toggle}
        aria-label={enabled ? 'Disable ambient sound' : 'Enable ambient sound'}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
          enabled ? 'bg-primary' : 'bg-secondary border border-border/50'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        />
      </button>
    </div>
  );
}