import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientSoundContext } from '@/lib/ambientSoundContext';

export default function MuteButton() {
  const { mode, setMode } = useAmbientSoundContext();
  const isMuted = mode === 'off';

  const toggleMute = () => {
    if (isMuted) {
      setMode('drift');
    } else {
      setMode('off');
    }
  };

  return (
    <motion.button
      onClick={toggleMute}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-2 rounded-lg border transition-all ${
        isMuted
          ? 'border-border/40 bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
          : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
      }`}
      title={isMuted ? 'Unmute sound' : 'Mute sound'}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </motion.button>
  );
}