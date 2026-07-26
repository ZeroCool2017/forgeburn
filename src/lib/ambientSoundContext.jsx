import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAmbientSound } from '@/hooks/useAmbientSound';

const AmbientSoundContext = createContext(null);

const STORAGE_KEY = 'chainforge_ambient_sound';
const MODE_KEY = 'chainforge_ambient_mode';

export const SOUND_MODES = [
  {
    id: 'off',
    label: 'Silent',
    sub: 'No sound',
    icon: '🔇',
    description: 'Pure focus, no audio.',
  },
  {
    id: 'drift',
    label: 'Drift',
    sub: 'Living tones · generative',
    icon: '🪸',
    description: 'Harmonic organisms drift through pentatonic space. Soft, evolving, organic.',
  },
  {
    id: 'focus',
    label: 'Focus',
    sub: 'Fast beats · grounded bass',
    icon: '⚡',
    description: 'Faster precision pulse, tactical rhythms with strong sub-bass foundation. Cold, clear, intentional.',
  },
  {
    id: 'haunted',
    label: 'Haunted',
    sub: 'Harpsichord plucks · harmonic minor',
    icon: '🎹',
    description: 'True harpsichord with metallic plucks in harmonic minor. Creepy, unsettling, deeply eerie.',
  },
  {
    id: 'arcade',
    label: 'Arcade',
    sub: '8-bit retro · nostalgia',
    icon: '👾',
    description: 'Chiptune bleeps and bloops. Retro video game vibes — playful, energetic, vintage.',
  },
  {
    id: 'deep',
    label: 'Deep Void',
    sub: 'Subsonic meditation',
    icon: '⬛',
    description: 'Oppressive sub-bass drones. Meditative, heavy, introspective.',
  },
  {
    id: 'tulsa',
    label: 'Greenwood',
    sub: 'Blues · soul · resilience',
    icon: '🏛️',
    description: 'Deep blues guitar, resonant vocals, and soul. For Greenwood, Black Wall Street, strength through struggle.',
  },
  {
    id: 'uplifting',
    label: 'Ascend',
    sub: 'Hopeful · major key',
    icon: '✨',
    description: 'Ascending melodies in major keys. Warm, hopeful, energizing — momentum toward freedom.',
  },
  {
    id: 'western',
    label: 'Western',
    sub: 'Pedal steel · outlaw',
    icon: '🤠',
    description: 'Pedal steel guitar slides and cowboy blues. Gritty, resilient, frontier spirit.',
  },
  {
    id: 'house90s',
    label: '90s House',
    sub: 'Deep house · euphoria',
    icon: '🕺',
    description: 'Classic 90s deep house. Soulful loops, warm pads, and hypnotic beats.',
  },
  {
    id: 'trap',
    label: 'Southern Trap',
    sub: '808 bass · boom bap soul',
    icon: '🎛️',
    description: 'Dark trap with southern soul blues scale, heavy 808 sub-bass, and syncopated rhythms.',
  },
];

export function AmbientSoundProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) || 'off'; } catch { return 'off'; }
  });

  const { start, stop } = useAmbientSound();

  const [hasUserGesture, setHasUserGesture] = useState(false);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(STORAGE_KEY, String(mode !== 'off'));
    stop();
    if (mode !== 'off' && hasUserGesture) start(mode, 0);
  }, [mode, hasUserGesture, start, stop]);

  // Web Audio must begin inside a user gesture. A persisted sound preference
  // is honored after the first pointer or keyboard interaction, never on mount.
  useEffect(() => {
    if (hasUserGesture || mode === 'off') return undefined;
    const activate = () => setHasUserGesture(true);
    window.addEventListener('pointerdown', activate, { once: true, passive: true });
    window.addEventListener('keydown', activate, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', activate);
      window.removeEventListener('keydown', activate);
    };
  }, [hasUserGesture, mode]);

  const toggle = () => {
    setHasUserGesture(true);
    setMode(m => m === 'off' ? 'drift' : 'off');
  };

  return (
    <AmbientSoundContext.Provider value={{ enabled: mode !== 'off', mode, setMode, toggle }}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSoundContext() {
  return useContext(AmbientSoundContext);
}