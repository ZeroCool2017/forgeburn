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
    id: 'electroplankton',
    label: 'Electroplankton',
    sub: 'Living tones · generative',
    icon: '🪸',
    description: 'Harmonic organisms drift through pentatonic space. Inspired by Toshio Iwai\'s Electroplankton.',
  },
  {
    id: 'ender',
    label: 'Ender',
    sub: 'Battle room pulse · focused',
    icon: '⚡',
    description: 'Sparse, cold, precise. Like the silence between commands in the Battle School. Ender-style tactical focus.',
  },
  {
    id: 'deep',
    label: 'Deep Drone',
    sub: 'Sub-bass meditation',
    icon: '🌊',
    description: 'Sub-harmonic drone layers. Low and slow — for when the debt feels heavy and you need to breathe.',
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
    if (mode !== 'off') {
      start(mode);
    } else {
      stop();
    }
  }, [mode, start, stop]);

  const toggle = () => setMode(m => m === 'off' ? 'electroplankton' : 'off');

  return (
    <AmbientSoundContext.Provider value={{ enabled: mode !== 'off', mode, setMode, toggle }}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSoundContext() {
  return useContext(AmbientSoundContext);
}