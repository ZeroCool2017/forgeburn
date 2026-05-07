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
    sub: 'Precision pulse · grounded',
    icon: '⚡',
    description: 'Sparse, intentional, precise. Tactical focus with soft harmonic grounding.',
  },
  {
    id: 'deep',
    label: 'Deep Drone',
    sub: 'Sub-bass meditation',
    icon: '🌊',
    description: 'Sub-harmonic drone layers. Low and slow — for when the debt feels heavy and you need to breathe.',
  },
  {
    id: 'tulsa',
    label: 'Greenwood',
    sub: 'Blues & resilience',
    icon: '🏛️',
    description: 'Gospel and blues-inspired pentatonic. For Greenwood, Black Wall Street, and the resilience it took to rebuild. Warm, reflective, grounded.',
  },
];

export function AmbientSoundProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) || 'off'; } catch { return 'off'; }
  });

  const { start, stop } = useAmbientSound();

  useEffect(() => {
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(STORAGE_KEY, String(mode !== 'off'));
    stop();
    if (mode !== 'off') {
      setTimeout(() => start(mode, 0), 100);
    }
  }, [mode, start, stop]);

  const toggle = () => setMode(m => m === 'off' ? 'drift' : 'off');

  return (
    <AmbientSoundContext.Provider value={{ enabled: mode !== 'off', mode, setMode, toggle }}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSoundContext() {
  return useContext(AmbientSoundContext);
}