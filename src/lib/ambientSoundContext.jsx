import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAmbientSound } from '@/hooks/useAmbientSound';

const AmbientSoundContext = createContext(null);

const STORAGE_KEY = 'chainforge_ambient_sound';

export function AmbientSoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  const { start, stop } = useAmbientSound();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
    if (enabled) {
      start();
    } else {
      stop();
    }
  }, [enabled, start, stop]);

  const toggle = () => setEnabled(v => !v);

  return (
    <AmbientSoundContext.Provider value={{ enabled, toggle }}>
      {children}
    </AmbientSoundContext.Provider>
  );
}

export function useAmbientSoundContext() {
  return useContext(AmbientSoundContext);
}